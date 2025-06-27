const API_BASE = 'https://rugplay.com';

function $(id) { return document.getElementById(id); }

async function loadData() {
  const data = await chrome.storage.local.get(['trackedUsers', 'trackedCoins', 'recentTrades']);
  const users = data.trackedUsers || [];
  const coins = data.trackedCoins || [];
  displayList('users', users, 'user');
  displayList('coins', coins, 'coin');
  renderTrades(data.recentTrades || [], users, coins);
}

function displayList(elId, items, type) {
  const ul = $(elId);
  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    const remove = document.createElement('button');
    remove.textContent = 'x';
    remove.style.marginLeft = '4px';
    remove.addEventListener('click', async () => {
      const key = type === 'user' ? 'trackedUsers' : 'trackedCoins';
      const list = (await chrome.storage.local.get(key))[key] || [];
      const index = list.indexOf(item);
      if (index > -1) { list.splice(index, 1); }
      await chrome.storage.local.set({ [key]: list });
      loadData();
    });
    li.appendChild(remove);
    ul.appendChild(li);
  });
}

function renderTrades(trades, users, coins) {
  const ul = $('trades');
  ul.innerHTML = '';
  trades.filter(trade => {
    const byUser = users.includes(trade.username);
    const byCoin = coins.includes(trade.coinSymbol);
    return byUser || byCoin;
  }).forEach(trade => {
    const li = document.createElement('li');
    li.textContent = `${trade.username} ${trade.type} ${trade.amount} ${trade.coinSymbol}`;
    ul.appendChild(li);
  });
}

$('addUser').addEventListener('click', async () => {
  const username = $('userInput').value.trim();
  if (!username) return;
  const { trackedUsers = [] } = await chrome.storage.local.get('trackedUsers');
  if (!trackedUsers.includes(username)) {
    trackedUsers.push(username);
    await chrome.storage.local.set({ trackedUsers });
  }
  $('userInput').value = '';
  loadData();
});

$('addCoin').addEventListener('click', async () => {
  const coin = $('coinInput').value.trim().toUpperCase();
  if (!coin) return;
  const { trackedCoins = [] } = await chrome.storage.local.get('trackedCoins');
  if (!trackedCoins.includes(coin)) {
    trackedCoins.push(coin);
    await chrome.storage.local.set({ trackedCoins });
  }
  $('coinInput').value = '';
  loadData();
});

loadData();
