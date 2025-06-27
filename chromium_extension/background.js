const API_BASE = 'https://rugplay.com';
const TRADE_ENDPOINT = `${API_BASE}/api/trades/recent?limit=100`;

async function fetchTrades() {
  try {
    const res = await fetch(TRADE_ENDPOINT);
    if (res.ok) {
      const data = await res.json();
      return data.trades || [];
    }
  } catch (e) {
    console.error('Failed to fetch trades', e);
  }
  return [];
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('updateTrades', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === 'updateTrades') {
    const trades = await fetchTrades();
    chrome.storage.local.set({ recentTrades: trades });
  }
});
