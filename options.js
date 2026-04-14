const els = {
  debounceEnabled: document.getElementById('debounceEnabled'),
  threshold: document.getElementById('threshold'),
  debounceSection: document.getElementById('debounceSection'),
  ignorePinned: document.getElementById('ignorePinned'),
  autoUnmuteOnSwitch: document.getElementById('autoUnmuteOnSwitch'),
  whitelistEnabled: document.getElementById('whitelistEnabled'),
  ignoredTitles: document.getElementById('ignoredTitles'),
  whitelistSection: document.getElementById('whitelistSection'),
  status: document.getElementById('status'),
};

function load(s) {
  els.debounceEnabled.checked = s.debounceEnabled;
  els.threshold.value = s.threshold;
  els.ignorePinned.checked = s.ignorePinned;
  els.autoUnmuteOnSwitch.checked = s.autoUnmuteOnSwitch;
  els.whitelistEnabled.checked = s.whitelistEnabled;
  els.ignoredTitles.value = s.ignoredTitles.join('\n');
  updateSections();
}

function updateSections() {
  els.debounceSection.classList.toggle('disabled', !els.debounceEnabled.checked);
  els.whitelistSection.classList.toggle('disabled', !els.whitelistEnabled.checked);
}

function save() {
  updateSections();
  const raw = parseFloat(els.threshold.value);
  const settings = {
    debounceEnabled: els.debounceEnabled.checked,
    threshold: isNaN(raw) ? DEFAULTS.threshold : raw,
    ignorePinned: els.ignorePinned.checked,
    autoUnmuteOnSwitch: els.autoUnmuteOnSwitch.checked,
    whitelistEnabled: els.whitelistEnabled.checked,
    ignoredTitles: els.ignoredTitles.value.split('\n').filter(l => l.trim())
  };
  browser.storage.local.set(settings).then(() => {
    els.status.textContent = 'Saved';
    setTimeout(() => els.status.textContent = '', 1500);
  });
}

function reset() {
  browser.storage.local.set(DEFAULTS).then(() => {
    load(DEFAULTS);
    els.status.textContent = 'Reset to defaults';
    setTimeout(() => els.status.textContent = '', 1500);
  });
}

browser.storage.local.get(DEFAULTS).then(load);

els.debounceEnabled.addEventListener('change', save);
els.threshold.addEventListener('change', save);
els.ignorePinned.addEventListener('change', save);
els.autoUnmuteOnSwitch.addEventListener('change', save);
els.whitelistEnabled.addEventListener('change', save);
els.ignoredTitles.addEventListener('change', save);
document.getElementById('resetBtn').addEventListener('click', reset);
