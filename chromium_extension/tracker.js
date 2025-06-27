function $(id) { return document.getElementById(id); }

async function loadData() {
  const { apiKey, trackedUsers = [], trackedCoins = [] } = await chrome.storage.local.get(['apiKey','trackedUsers','trackedCoins']);
  $('apiKeyInput').value = apiKey || '';
  renderList('users', trackedUsers, 'trackedUsers');
  renderList('coins', trackedCoins, 'trackedCoins');
}

function renderList(elId, items, key) {
  const ul = $(elId);
  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    const rm = document.createElement('button');
    rm.textContent = 'x';
    rm.addEventListener('click', async () => {
      const data = await chrome.storage.local.get(key);
      const list = data[key] || [];
      const idx = list.indexOf(item);
      if (idx > -1) list.splice(idx,1);
      await chrome.storage.local.set({ [key]: list });
      loadData();
    });
    li.appendChild(rm);
    ul.appendChild(li);
  });
}

$('saveApiKey').addEventListener('click', async () => {
  const val = $('apiKeyInput').value.trim();
  await chrome.storage.local.set({ apiKey: val });
  $('apiStatus').textContent = 'Saved!';
});

$('addUser').addEventListener('click', async () => {
  const val = $('userInput').value.trim();
  if (!val) return;
  const { trackedUsers = [] } = await chrome.storage.local.get('trackedUsers');
  if (!trackedUsers.includes(val)) {
    trackedUsers.push(val);
    await chrome.storage.local.set({ trackedUsers });
  }
  $('userInput').value = '';
  loadData();
});

$('addCoin').addEventListener('click', async () => {
  const val = $('coinInput').value.trim().toUpperCase();
  if (!val) return;
  const { trackedCoins = [] } = await chrome.storage.local.get('trackedCoins');
  if (!trackedCoins.includes(val)) {
    trackedCoins.push(val);
    await chrome.storage.local.set({ trackedCoins });
  }
  $('coinInput').value = '';
  loadData();
});

loadData();
