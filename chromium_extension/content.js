// Inject custom styles to change website look and add Tracker link to sidebar
(function() {
  const style = document.createElement('style');
  style.textContent = `
    body { background-color: #f6f8ff !important; }
    .rp-tracker-link { color: #c000c0 !important; }
  `;
  document.head.appendChild(style);

  function addLink() {
    const sidebar = document.querySelector('.sidebar-container');
    if (!sidebar) return;
    const nav = sidebar.querySelector('nav') || sidebar.querySelector('ul') || sidebar;
    if (!nav || document.getElementById('rp-tracker-link')) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.id = 'rp-tracker-link';
    a.className = 'rp-tracker-link';
    a.textContent = 'Tracker';
    a.href = chrome.runtime.getURL('tracker.html');
    a.target = '_blank';
    li.appendChild(a);
    (nav.querySelector('ul') || nav).appendChild(li);
  }

  const observer = new MutationObserver(addLink);
  observer.observe(document.body, { childList: true, subtree: true });
  addLink();
})();
