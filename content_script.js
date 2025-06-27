// --- Sidebar Injection ---

function addLinkToSidebar() {
  const trackingPageURL = chrome.runtime.getURL('tracking.html');
  const linkText = 'Tracked Items';

  // Create the link element
  const newLink = document.createElement('a');
  newLink.href = trackingPageURL;
  newLink.textContent = linkText;
  newLink.target = '_blank'; // Open in a new tab
  newLink.style.display = 'block'; // Basic styling, can be refined
  newLink.style.padding = '10px';
  newLink.style.color = '#8A2BE2'; // Example color, adjust to match site
  newLink.style.textDecoration = 'none';
  newLink.id = 'rugplay-tracker-sidebar-link';

  // --- Attempt to find a suitable sidebar/navigation element ---
  // This is the part that will likely need adjustment based on rugplay.com's actual structure.
  // Order of preference for selectors:
  const selectors = [
    'nav',                               // Standard navigation element
    '.sidebar',                          // Common class name
    '#sidebar',                          // Common ID
    '.nav',                              // Common class name
    '#nav',                              // Common ID
    '.menu',                             // Common class name
    '#menu',                             // Common ID
    'aside',                             // Aside element, often used for sidebars
    'ul[class*="nav"], ul[class*="menu"]', // Unordered lists with nav/menu in class
    'body > div:first-child ul'          // Fallback: a list in the first div of body
  ];

  let parentElement = null;
  for (const selector of selectors) {
    parentElement = document.querySelector(selector);
    if (parentElement) {
      console.log(`RugPlay Tracker: Found sidebar/nav element with selector: ${selector}`);
      break;
    }
  }

  if (parentElement) {
    // Check if the link already exists
    if (document.getElementById('rugplay-tracker-sidebar-link')) {
      console.log('RugPlay Tracker: Link already added.');
      return;
    }

    // Decide how to append: if it's a UL, wrap in LI
    if (parentElement.tagName === 'UL') {
      const listItem = document.createElement('li');
      // Attempt to copy class from existing li elements for styling consistency
      const existingLi = parentElement.querySelector('li');
      if (existingLi) {
        listItem.className = existingLi.className;
      }
      listItem.appendChild(newLink);
      parentElement.appendChild(listItem);
    } else {
      // For other elements (nav, div, aside), append directly or wrap in a div
      const wrapperDiv = document.createElement('div');
      wrapperDiv.appendChild(newLink);
      parentElement.appendChild(wrapperDiv);
    }
    console.log('RugPlay Tracker: Link added to sidebar.');
  } else {
    console.warn('RugPlay Tracker: Could not find a suitable sidebar/navigation element to inject the link.');
    // As a last resort, prepend to body, though this is not ideal
    // document.body.prepend(newLink);
  }
}


// --- Transaction/Activity Highlighting ---

let trackedUsers = [];
let trackedCoins = [];
const HIGHLIGHT_USER_CLASS = 'rugplay-tracker-highlight-user';
const HIGHLIGHT_COIN_CLASS = 'rugplay-tracker-highlight-coin';
const ALREADY_HIGHLIGHTED_MARKER = 'data-rugplay-tracker-highlighted';

async function loadTrackedDataForHighlighting() {
  try {
    const data = await chrome.storage.local.get(['trackedUsers', 'trackedCoins']);
    trackedUsers = data.trackedUsers || [];
    trackedCoins = data.trackedCoins || [];
    // console.log("RugPlay Tracker: Loaded data for highlighting:", trackedUsers, trackedCoins);
  } catch (error) {
    console.error("RugPlay Tracker: Error loading tracked data:", error);
  }
}

function highlightMatchesInNode(node) {
  if (node.nodeType === Node.TEXT_NODE && node.parentNode && !node.parentNode.closest(`[${ALREADY_HIGHLIGHTED_MARKER}]`)) {
    const text = node.textContent;
    let matchFound = false;
    let highlightClass = '';

    // Check for users first
    for (const user of trackedUsers) {
      if (user && text.toLowerCase().includes(user.toLowerCase())) {
        matchFound = true;
        highlightClass = HIGHLIGHT_USER_CLASS;
        break;
      }
    }

    // If no user match, check for coins
    if (!matchFound) {
      for (const coin of trackedCoins) {
        if (coin && text.toLowerCase().includes(coin.toLowerCase())) {
          matchFound = true;
          highlightClass = HIGHLIGHT_COIN_CLASS;
          break;
        }
      }
    }

    if (matchFound) {
      const parent = node.parentNode;
      // Avoid highlighting scripts, styles, or within our own injected elements
      if (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE' || parent.closest('#rugplay-tracker-sidebar-link')) {
        return;
      }

      // Attempt to highlight the most relevant parent, up to a certain level
      // This is a heuristic. For specific sites, more targeted selectors are better.
      let elementToHighlight = parent;
      if (parent.childNodes.length === 1 && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
         // If the text node is the sole child, highlight the parent.
      } else {
        // Otherwise, wrap the text node itself, or find a smallish parent.
        // For now, let's try to wrap the text in a span if it's mixed content.
        // A more robust way would be to find the closest block-level or significant inline ancestor.
        // For simplicity, we'll try to highlight the parent if it's not too large.
      }

      // Check if the element or its direct parent is already highlighted by us
      if (elementToHighlight.hasAttribute(ALREADY_HIGHLIGHTED_MARKER) ||
          (elementToHighlight.parentNode && elementToHighlight.parentNode.hasAttribute && elementToHighlight.parentNode.hasAttribute(ALREADY_HIGHLIGHTED_MARKER))) {
        return;
      }

      // More robustly, wrap the text node itself if it's part of mixed content.
      // However, simply highlighting the parent is often good enough for visibility.
      // Let's try to be a bit smarter: if the text match is a good portion of the parent's text, highlight parent.
      // Otherwise, consider wrapping. For now, highlight parent.

      // The actual highlighting logic:
      // Create a new span, replace the text node with the span containing the text.
      // This is complex if the match is partial. For now, we'll add class to parent.
      // This might highlight more than intended but is simpler to implement without DOM knowledge.

      if (!elementToHighlight.classList.contains(highlightClass)) {
         // If the parent is small enough (e.g. a P, SPAN, DIV with mostly this text)
         // For now, we'll just add the class to the immediate parent of the text node.
         // This is a simplification.
        if (parent && typeof parent.setAttribute === 'function') {
            parent.classList.add(highlightClass);
            parent.setAttribute(ALREADY_HIGHLIGHTED_MARKER, 'true');
            // console.log(`RugPlay Tracker: Highlighting element for text: "${text.substring(0,30)}..." with class ${highlightClass}`, parent);
        }
      }
      return; // Stop after first match in this text node's parent processing.
    }
  }

  // Recursively check child nodes
  // Only iterate over element nodes for children, skip script/style
  if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
    for (const child of node.childNodes) {
      highlightMatchesInNode(child);
    }
  }
}

async function highlightTrackedItems() {
  // console.log("RugPlay Tracker: Starting highlight process...");
  await loadTrackedDataForHighlighting();

  if (trackedUsers.length === 0 && trackedCoins.length === 0) {
    // console.log("RugPlay Tracker: No items to track for highlighting.");
    return;
  }

  // Remove previous highlights marker to allow re-highlighting if content changed
  // This is too broad, ideally we'd only do this if content truly changed.
  // document.querySelectorAll(`[${ALREADY_HIGHLIGHTED_MARKER}]`).forEach(el => {
  //   el.classList.remove(HIGHLIGHT_USER_CLASS, HIGHLIGHT_COIN_CLASS);
  //   el.removeAttribute(ALREADY_HIGHLIGHTED_MARKER);
  // });

  highlightMatchesInNode(document.body);
  // console.log("RugPlay Tracker: Highlighting complete.");
}


// --- Main Execution ---

// Function to run all setup tasks
function runExtensionFeatures() {
  addLinkToSidebar();
  highlightTrackedItems();
}

// Run features once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runExtensionFeatures);
} else {
  // DOMContentLoaded has already fired
  runExtensionFeatures();
}

// For dynamic content, set up a MutationObserver or a periodic check.
// A MutationObserver is more efficient.
const observerConfig = { childList: true, subtree: true };
let highlightTimeout = null;

const observer = new MutationObserver((mutationsList, observer) => {
  // Debounce highlighting to avoid excessive calls during rapid DOM changes
  clearTimeout(highlightTimeout);
  highlightTimeout = setTimeout(() => {
    // console.log("RugPlay Tracker: DOM changed, re-evaluating highlights.");
    // Before re-highlighting, it might be necessary to clean up old ALREADY_HIGHLIGHTED_MARKERs
    // if elements are removed/re-added, or just rely on the marker check.
    highlightTrackedItems();
  }, 1000); // Adjust delay as needed
});

// Start observing the document body for configured mutations
// We need to wait for the body to exist
if (document.body) {
    observer.observe(document.body, observerConfig);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, observerConfig);
    });
}


console.log("RugPlay Tracker content script loaded and observer set up.");
