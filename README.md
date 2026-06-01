# UnSponsored Browser Extension

![Extension Icon](icons/icon128.png)

![Alt Text](images/example.gif)

## Description

UnSponsored hides sponsored content on supported web pages. It currently
supports:

- Google Search (`google.com`, `google.co.uk`, `google.de`)
- mobile.de (search results and home page)
- Ecosia (`ecosia.org`)

The extension is built on the WebExtensions API and runs in both Chromium-based
browsers (Chrome, Edge, Brave, Opera, …) and Firefox from a single codebase.

## Installation

### Chrome / Edge / Brave / Opera

1. Download the extension files from the [GitHub repository](https://github.com/kreusel/UnSponsored).
2. Unzip the downloaded folder.
3. Open `chrome://extensions/` (or the equivalent for your browser).
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the unzipped folder.

### Firefox

The same `manifest.json` works in Firefox 115+ thanks to its Manifest V3 support
and the `browser_specific_settings` block.

To load the extension temporarily for development:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select the `manifest.json` file from the unzipped folder.

For permanent installation, the extension needs to be signed by Mozilla
(submit at <https://addons.mozilla.org/developers/>) or you can use Firefox
Developer Edition / Nightly with `xpinstall.signatures.required` set to
`false`.

## Usage

Once installed, visit a supported site and sponsored results are hidden
automatically. Click the toolbar icon to toggle the extension on or off for the
current session — the setting is synced through the browser profile.

## Adding more sites

Site support is configured in `UnSponsored.js` via the `SITE_SELECTORS` map.
Add a new entry with the selectors you want to hide and add the matching host
to the `host_permissions` and `content_scripts.matches` arrays in
`manifest.json`.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your fork.
5. Open a pull request against `main`.

## License

This project is licensed under the [MIT License](LICENSE).

## Version History

### Version 1.7

- Added Firefox support via `browser_specific_settings` — single manifest now
  loads in both Chrome (MV3) and Firefox (MV3).
- Added support for mobile.de and ecosia.org in addition to Google Search.
- Hiding is now done by injecting a single `<style>` element so dynamically
  loaded results (SPA navigation, infinite scroll) are covered without
  rerunning the hide logic.
- Fixed `manifest_version: 4` (invalid value, only 2 and 3 exist) and removed
  the obsolete MV2 `browser_action` key.
- Restoring elements no longer forces `display: block`, which previously broke
  `flex`/`grid` layouts when toggling the extension off.

### Version 1.6 (March 05, 2025)

- Added new flag to identify and hide a new type of sponsored result -
  mapview shortlist result.

### Version 1.5 (October 30, 2023)

- Added toggle switch in the popup to enable/disable the extension.
- Fixed a bug where sponsored results were not displayed after disabling the
  extension.

### Version 1.4 (October 29, 2023)

- Improved performance for hiding sponsored elements.
- Updated icon designs for better visibility.

### Version 1.0 (October 29, 2023)

- Initial release.
