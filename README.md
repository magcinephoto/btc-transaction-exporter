# Btc Transaction Exporter

## About

Btc Transaction Exporter is a chrome extension that exports bitcoin transaction history in csv.

Sites such as mempool allow you to view transaction history in your browser, but do not provide the ability to save history.

I have created this EXTENSION to help those who like Bitcoin and Ordinals to enjoy the activity more and save time on administrative work.

## Usage

See [Documentation](https://btctransactionexporter.gitbook.io/docs)

## Contribution

If you want to develop a fix, launch the extension locally and send a pull request.

### Required Environment

* node.js >= 18.16.0

This repo version is locked at `18.16.0` by `.node-version`, but you can change the above version you want to use.

### How to build extension locally

```bash
yarn
yarn run dev
```

You can see the extension to access `http://localhost:3000`.

### How to load an unpacked extension in developer mode:

Please do below at your Google Chrome browser.

* Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design chrome:// URLs are not linkable.)
* Alternatively, click the Extensions menu puzzle button and select Manage Extensions at the bottom of the menu.
* Or, click the Chrome menu, hover over More Tools, then select Extensions.
* Enable Developer Mode by clicking the toggle switch next to Developer mode.

If you want to learn more about chrome extension, you can see [Google Chrome Extension Documentation](https://developer.chrome.com/docs/extensions).

## License

MIT

## Donate

See [Donate](https://btctransactionexporter.gitbook.io/docs/donate)

## Author

Mag([@mag_cinephoto](https://twitter.com/mag_cinephoto))
