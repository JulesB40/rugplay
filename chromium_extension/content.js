// Content script to modify Rugplay website appearance and add a Tracker page
(function() {
  function changeLook() {
    document.body.style.filter = 'hue-rotate(20deg)';
  }

  function insertTrackerLink() {
    const sidebar = document.querySelector('aside') || document.querySelector('nav');
    if (!sidebar || document.getElementById('tracker-link')) return;
    const link = document.createElement('a');
    link.id = 'tracker-link';
    link.textContent = 'Tracker';
    link.style.cursor = 'pointer';
    link.style.display = 'block';
    link.style.padding = '8px';
    link.addEventListener('click', showTrackerPage);
    sidebar.appendChild(link);
  }

  function showTrackerPage(e) {
    e.preventDefault();
    let overlay = document.getElementById('tracker-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tracker-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0,0,0,0.8)';
      overlay.style.color = '#fff';
      overlay.style.padding = '20px';
      overlay.style.overflow = 'auto';
      overlay.style.zIndex = '9999';
      overlay.innerHTML = `
        <button id="tracker-close" style="float:right">Close</button>
        <h2>Rugplay Tracker</h2>
        <div>
          <label>API Key <input id="tracker-api-key" type="text" /></label>
          <button id="save-api-key">Save</button>
        </div>
        <div>
          <h3>Users</h3>
          <input id="tracker-user-input" placeholder="Add username" />
          <button id="tracker-add-user">Add</button>
          <ul id="tracker-users"></ul>
        </div>
        <div>
          <h3>Coins</h3>
          <input id="tracker-coin-input" placeholder="Add coin symbol" />
          <button id="tracker-add-coin">Add</button>
          <ul id="tracker-coins"></ul>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById('tracker-close').addEventListener('click', () => {
        overlay.style.display = 'none';
      });
      document.getElementById('save-api-key').addEventListener('click', async () => {
        const key = document.getElementById('tracker-api-key').value.trim();
        await chrome.storage.local.set({ apiKey: key });
      });
      document.getElementById('tracker-add-user').addEventListener('click', addUser);
      document.getElementById('tracker-add-coin').addEventListener('click', addCoin);
    }
    overlay.style.display = 'block';
    loadData();
  }

  async function loadData() {
    const data = await chrome.storage.local.get(['apiKey', 'trackedUsers', 'trackedCoins']);
    const apiInput = document.getElementById('tracker-api-key');
    if (apiInput) apiInput.value = data.apiKey || '';
    displayList('tracker-users', data.trackedUsers || [], 'trackedUsers');
    displayList('tracker-coins', data.trackedCoins || [], 'trackedCoins');
  }

  function displayList(id, items, key) {
    const ul = document.getElementById(id);
    if (!ul) return;
    ul.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      const btn = document.createElement('button');
      btn.textContent = 'x';
      btn.style.marginLeft = '4px';
      btn.addEventListener('click', async () => {
        const data = await chrome.storage.local.get(key);
        const arr = data[key] || [];
        const idx = arr.indexOf(item);
        if (idx > -1) arr.splice(idx, 1);
        await chrome.storage.local.set({ [key]: arr });
        loadData();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  async function addUser() {
    const input = document.getElementById('tracker-user-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    const { trackedUsers = [] } = await chrome.storage.local.get('trackedUsers');
    if (!trackedUsers.includes(val)) {
      trackedUsers.push(val);
      await chrome.storage.local.set({ trackedUsers });
    }
    input.value = '';
    loadData();
  }

  async function addCoin() {
    const input = document.getElementById('tracker-coin-input');
    if (!input) return;
    const val = input.value.trim().toUpperCase();
    if (!val) return;
    const { trackedCoins = [] } = await chrome.storage.local.get('trackedCoins');
    if (!trackedCoins.includes(val)) {
      trackedCoins.push(val);
      await chrome.storage.local.set({ trackedCoins });
    }
    input.value = '';
    loadData();
  }

  changeLook();
  insertTrackerLink();
})();
