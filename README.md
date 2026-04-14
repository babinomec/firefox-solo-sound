# Solo Sound

A minimal Firefox extension that ensures only one tab plays sound at a time.

## How it works

- When you **unmute a tab**, all other audible tabs get muted automatically.
- When a tab **starts playing audio**, all other audible tabs get muted.
- Tabs that aren't producing sound are never touched.

No configuration, no UI — just install and forget.

## Install

### From Firefox Add-ons (coming soon)

<!-- [Install from addons.mozilla.org](https://addons.mozilla.org/firefox/addon/solo-sound/) -->

### Manual install

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file

## Permissions

This extension only requires the `tabs` permission to detect audio state changes and mute/unmute tabs. No data is collected or transmitted.

## License

[WTFPL](http://www.wtfpl.net/)
