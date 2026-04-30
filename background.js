let settings = { ...DEFAULTS, ignoredTitles: [...DEFAULTS.ignoredTitles] };

browser.storage.local.get(DEFAULTS).then(s => settings = s);
browser.storage.onChanged.addListener((changes) => {
  for (const key of Object.keys(DEFAULTS)) {
    if (changes[key]) settings[key] = changes[key].newValue;
  }
});

function isExcluded(tab) {
  if (settings.ignorePinned && tab.pinned) return true;
  if (!settings.whitelistEnabled) return false;
  const lower = tab.title.toLowerCase();
  return settings.ignoredTitles.some(p => {
    if (p.startsWith('/') && p.endsWith('/')) {
      try { return new RegExp(p.slice(1, -1), 'i').test(tab.title); } catch { return false; }
    }
    return lower.includes(p.toLowerCase());
  });
}

let previousTabId = null;
let currentTabId = null;
let pendingResume = null;

function muteOtherAudibleTabs(excludeTabId) {
  browser.tabs.query({ audible: true }).then(tabs => {
    let muted = null;
    for (const tab of tabs) {
      if (tab.id !== excludeTabId && !isExcluded(tab)) {
        if (!muted) muted = tab.id;
        browser.tabs.update(tab.id, { muted: true });
      }
    }
    if (settings.resumePrevious && muted) {
      previousTabId = muted;
      currentTabId = excludeTabId;
    }
  });
}

const pendingChecks = new Map();

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // User unmutes a tab → check if it's actually playing before muting others
  if (changeInfo.mutedInfo && !changeInfo.mutedInfo.muted) {
    setTimeout(() => {
      browser.tabs.get(tabId).then(tab => {
        if (tab.audible) muteOtherAudibleTabs(tabId);
      }).catch(() => {});
    }, 100);
    return;
  }

  // Tab becomes audible
  if (changeInfo.audible === true) {
    clearTimeout(pendingChecks.get(tabId));

    // Cancel pending resume if the tab that caused muting starts playing again
    if (tabId === currentTabId && pendingResume) {
      clearTimeout(pendingResume);
      pendingResume = null;
    }

    if (!settings.debounceEnabled) {
      browser.tabs.get(tabId).then(tab => {
        if (!isExcluded(tab)) muteOtherAudibleTabs(tabId);
      }).catch(() => {});
      return;
    }

    pendingChecks.set(tabId, setTimeout(() => {
      pendingChecks.delete(tabId);
      browser.tabs.get(tabId).then(tab => {
        if (tab.audible && !isExcluded(tab)) muteOtherAudibleTabs(tabId);
      }).catch(() => {});
    }, settings.threshold * 1000));
  }

  // Tab stops playing → cancel pending check, maybe resume previous
  if (changeInfo.audible === false) {
    clearTimeout(pendingChecks.get(tabId));
    pendingChecks.delete(tabId);

    if (settings.resumePrevious && tabId === currentTabId && previousTabId !== null) {
      clearTimeout(pendingResume);
      const tabToResume = previousTabId;
      const delay = settings.debounceEnabled ? settings.threshold * 1000 : 500;
      pendingResume = setTimeout(() => {
        browser.tabs.get(tabToResume).then(tab => {
          if (tab.mutedInfo.muted) {
            browser.tabs.update(tabToResume, { muted: false });
          }
        }).catch(() => {});
        previousTabId = null;
        currentTabId = null;
      }, delay);
    }
  }
});

browser.tabs.onActivated.addListener(({ tabId }) => {
  if (!settings.autoUnmuteOnSwitch) return;
  browser.tabs.get(tabId).then(tab => {
    if (tab.mutedInfo.muted) {
      browser.tabs.update(tabId, { muted: false });
    }
  }).catch(() => {});
});
