browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // Trigger when a tab becomes audible OR gets unmuted
  const becameAudible = changeInfo.audible === true;
  const becameUnmuted = changeInfo.mutedInfo && !changeInfo.mutedInfo.muted;

  if (becameAudible || becameUnmuted) {
    browser.tabs.query({ audible: true }).then(tabs => {
      for (const tab of tabs) {
        if (tab.id !== tabId) {
          browser.tabs.update(tab.id, { muted: true });
        }
      }
    });
  }
});
