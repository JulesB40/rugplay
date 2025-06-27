document.addEventListener('DOMContentLoaded', () => {
  const trackUserForm = document.getElementById('trackUserForm');
  const newUserNameInput = document.getElementById('newUserName');
  const trackedUsersList = document.getElementById('trackedUsersList');

  const trackCoinForm = document.getElementById('trackCoinForm');
  const newCoinSymbolInput = document.getElementById('newCoinSymbol');
  const trackedCoinsList = document.getElementById('trackedCoinsList');

  // Load and display tracked items on startup
  loadTrackedItems();

  trackUserForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userName = newUserNameInput.value.trim();
    if (userName) {
      addTrackedItem('users', userName, newUserNameInput);
    }
  });

  trackCoinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const coinSymbol = newCoinSymbolInput.value.trim();
    if (coinSymbol) {
      addTrackedItem('coins', coinSymbol, newCoinSymbolInput);
    }
  });

  async function addTrackedItem(type, item, inputElement) {
    const key = type === 'users' ? 'trackedUsers' : 'trackedCoins';
    try {
      const data = await chrome.storage.local.get([key]);
      const items = data[key] || [];
      if (!items.includes(item)) {
        items.push(item);
        await chrome.storage.local.set({ [key]: items });
        renderTrackedItems(type, items);
        if (inputElement) inputElement.value = ''; // Clear input field
      } else {
        alert(`${type === 'users' ? 'User' : 'Coin'} "${item}" is already tracked.`);
      }
    } catch (error) {
      console.error(`Error adding tracked ${type}:`, error);
      alert(`Failed to track ${type}. See console for details.`);
    }
  }

  async function removeTrackedItem(type, item) {
    const key = type === 'users' ? 'trackedUsers' : 'trackedCoins';
    try {
      const data = await chrome.storage.local.get([key]);
      let items = data[key] || [];
      items = items.filter(i => i !== item);
      await chrome.storage.local.set({ [key]: items });
      renderTrackedItems(type, items);
    } catch (error) {
      console.error(`Error removing tracked ${type}:`, error);
      alert(`Failed to remove ${type}. See console for details.`);
    }
  }

  async function loadTrackedItems() {
    try {
      const userData = await chrome.storage.local.get(['trackedUsers']);
      renderTrackedItems('users', userData.trackedUsers || []);

      const coinData = await chrome.storage.local.get(['trackedCoins']);
      renderTrackedItems('coins', coinData.trackedCoins || []);
    } catch (error) {
      console.error('Error loading tracked items:', error);
    }
  }

  function renderTrackedItems(type, items) {
    const listElement = type === 'users' ? trackedUsersList : trackedCoinsList;
    listElement.innerHTML = ''; // Clear current list

    if (!items || items.length === 0) {
      const li = document.createElement('li');
      li.textContent = `No ${type} currently tracked.`;
      listElement.appendChild(li);
      return;
    }

    items.forEach(item => {
      const li = document.createElement('li');
      const textSpan = document.createElement('span');
      textSpan.textContent = item;
      li.appendChild(textSpan);

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('remove-btn');
      removeButton.addEventListener('click', () => removeTrackedItem(type, item));
      li.appendChild(removeButton);

      listElement.appendChild(li);
    });
  }
});
