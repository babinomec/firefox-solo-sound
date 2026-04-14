let settings = { ...DEFAULTS, ignoredTitles: [...DEFAULTS.ignoredTitles] };

browser.storage.local.get(DEFAULTS).then(s => settings = s);
browser.storage.onChanged.addListener((changes) => {
  for (const key of Object.keys(DEFAULTS)) {
    if (changes[key]) settings[key] = changes[key].newValue;
  }
});

function isIgnored(title) {
  if (!settings.whitelistEnabled) return false;
  const lower = title.toLowerCase();
  return settings.ignoredTitles.some(p => {
    if (p.startsWith('/') && p.endsWith('/')) {
      try { return new RegExp(p.slice(1, -1), 'i').test(title); } catch { return false; }
    }
    return lower.includes(p.toLowerCase());
  });
}

function muteOtherAudibleTabs(excludeTabId) {
  browser.tabs.query({ audible: true }).then(tabs => {
    for (const tab of tabs) {
      if (tab.id !== excludeTabId) {
        browser.tabs.update(tab.id, { muted: true });
      }
    }
  });
}

const pendingChecks = new Map();

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // User unmutes a tab → act immediately
  if (changeInfo.mutedInfo && !changeInfo.mutedInfo.muted) {
    muteOtherAudibleTabs(tabId);
    return;
  }

  // Tab becomes audible
  if (changeInfo.audible === true) {
    clearTimeout(pendingChecks.get(tabId));

    if (!settings.debounceEnabled) {
      browser.tabs.get(tabId).then(tab => {
        if (!isIgnored(tab.title)) muteOtherAudibleTabs(tabId);
      }).catch(() => {});
      return;
    }

    pendingChecks.set(tabId, setTimeout(() => {
      pendingChecks.delete(tabId);
      browser.tabs.get(tabId).then(tab => {
        if (tab.audible && !isIgnored(tab.title)) muteOtherAudibleTabs(tabId);
      }).catch(() => {});
    }, settings.threshold * 1000));
  }

  // Tab stops playing → cancel pending check
  if (changeInfo.audible === false) {
    clearTimeout(pendingChecks.get(tabId));
    pendingChecks.delete(tabId);
  }
});
