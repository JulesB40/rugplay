# Rugplay Tracker Chrome Extension

This extension helps you monitor specific users and coins on [rugplay.com](https://rugplay.com).
It periodically fetches recent trades and highlights any activity involving your tracked users or coins.

## Installation
1. Open `chrome://extensions/` in your Chromium browser.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `chromium_extension` folder.

## Usage
- Use the popup to add usernames or coin symbols you want to track.
- The extension lists recent trades that involve those users or coins.

The extension also injects a small "Tracker" link into Rugplay's sidebar.
Clicking it opens an overlay page where you can enter your API key and manage
tracked users and coins.

The background service polls the Rugplay API every minute to refresh trade data.
