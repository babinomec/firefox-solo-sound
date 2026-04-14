# Solo Sound

A minimal Firefox extension that ensures only one tab plays sound at a time.

## How it works

- When you **unmute a tab**, all other audible tabs get muted automatically.
- When a tab **starts playing audio**, all other audible tabs get muted.
- Sounds shorter than a configurable threshold (default: 2 seconds) are ignored.
- Tabs whose title matches a configurable list (Gmail, Slack, Discord, etc.) are ignored — so notification sounds play without muting anything.
- Tabs that aren't producing sound are never touched.

## Settings

Right-click the extension → "Manage Extension" → "Options" to configure:

- **Debounce threshold** — how long a sound must play before triggering muting (default: 2s, set to 0 to disable)
- **Ignored tab titles** — case-insensitive patterns, one per line. Tabs matching any pattern are excluded.

## Install

### From Firefox Add-ons (coming soon)

<!-- [Install from addons.mozilla.org](https://addons.mozilla.org/firefox/addon/solo-sound/) -->

### Manual install

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file

## Permissions

- `tabs` — detect audio state changes and mute/unmute tabs
- `storage` — persist settings

No data is collected or transmitted.

## License

[WTFPL](http://www.wtfpl.net/)
