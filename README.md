# Solo Sound

A minimal Firefox extension that ensures only one tab plays sound at a time.

## Features

- When you **unmute a tab**, all other audible tabs get muted automatically (after a quick check that the tab is actually playing audio).
- When a tab **starts playing audio**, all other audible tabs get muted after a short delay.
- Tabs whose title matches a configurable list (Gmail, Slack, Discord, etc.) are never muted and never trigger muting of other tabs.
- Tabs that aren't producing sound are never touched.

## Install

### From Firefox Add-ons (coming soon)

<!-- [Install from addons.mozilla.org](https://addons.mozilla.org/firefox/addon/solo-sound/) -->

### Manual install

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file

## Settings

Right-click the extension → "Manage Extension" → "Options" to configure:

- **Debounce** — ignores short sounds like notifications by waiting before triggering muting. Configurable threshold (default: 1s).
- **Ignored tab titles** — case-insensitive patterns, one per line. Tabs matching any pattern are excluded. Supports regex when wrapped in slashes: `/pattern/`

## Permissions

- `tabs` — detect audio state changes and mute/unmute tabs
- `storage` — persist settings locally

No data is collected or transmitted.

## Technical details

The extension listens to `tabs.onUpdated` for two types of changes:

1. **Mute state change** — when a tab is unmuted, we wait 100ms (muted tabs always report `audible: false`, so we need a moment for Firefox to update), then check if the tab is actually producing sound. If it is, we mute all other audible tabs.

2. **Audible state change** — when a tab starts producing sound, we wait for a configurable debounce delay (default: 1s). If the tab is still audible after the delay, we mute all other audible tabs. If it stopped (e.g. a short notification ding), we do nothing. This is how notification sounds are ignored without needing to detect them explicitly.

In both cases, tabs whose title matches the whitelist are skipped entirely — they won't be muted and won't trigger muting of others.

## License

[WTFPL](http://www.wtfpl.net/)
