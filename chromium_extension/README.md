# Rugplay Tracker Chrome Extension

This extension helps you monitor specific users and coins on [rugplay.com](https://rugplay.com).
It periodically fetches recent trades and highlights any activity involving your tracked users or coins.

## Installation
1. Open `chrome://extensions/` in your Chromium browser.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `chromium_extension` folder.

## Usage
- Use the popup to quickly add usernames or coin symbols you want to track.
- A new **Tracker** link appears in the Rugplay sidebar. It opens a settings page
  where you can store an API key and manage your tracked users or coins.
- The extension slightly changes the site background color so you know it's
  active. Recent trades are fetched every minute in the background.
