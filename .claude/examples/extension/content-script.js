// content-script.js

// Create the overlay element once and reuse it for performance
const overlay = document.createElement('div');
overlay.id = 'text-selection-overlay';
overlay.style.position = 'absolute';
overlay.style.backgroundColor = '#ffffff';
overlay.style.border = '1px solid #cccccc';
overlay.style.borderRadius = '4px';
overlay.style.padding = '10px';
overlay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
overlay.style.zIndex = '9999'; // Ensure it's on top
overlay.style.display = 'none'; // Initially hidden
overlay.style.maxWidth = '300px';
overlay.style.fontFamily = 'Arial, sans-serif';
overlay.style.fontSize = '14px';
document.body.appendChild(overlay);

// Function to get selected text compatibly across browsers
function getSelectedText() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.selection && document.selection.type !== 'Control') {
    return document.selection.createRange().text;
  }
  return '';
}

// Function to position and show the overlay
function showOverlay(event, selectedText) {
  if (selectedText.length > 0) {
    // Calculate position with scroll offset
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    const posX = event.clientX + scrollLeft + 10; // Offset to the right of cursor
    const posY = event.clientY + scrollTop + 10;  // Offset below cursor

    // Build overlay content (e.g., display text and a button)
    overlay.innerHTML = `
      <p><strong>Selected Text:</strong> ${selectedText}</p>
      <button id="copy-button">Copy to Clipboard</button>
    `;
    overlay.style.left = `${posX}px`;
    overlay.style.top = `${posY}px`;
    overlay.style.display = 'block';

    // Add event listener for the button (example action)
    document.getElementById('copy-button').addEventListener('click', () => {
      navigator.clipboard.writeText(selectedText).then(() => {
        alert('Text copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
      hideOverlay();
    });
  } else {
    hideOverlay();
  }
}

// Function to hide the overlay
function hideOverlay() {
  overlay.style.display = 'none';
}

// Event listener for text selection (mouseup for detection)
document.addEventListener('mouseup', (event) => {
  const selectedText = getSelectedText().trim();
  showOverlay(event, selectedText);
});

// Hide overlay on mousedown (e.g., when clicking elsewhere)
document.addEventListener('mousedown', (event) => {
  // Check if click is outside the overlay to avoid hiding when interacting with it
  if (!overlay.contains(event.target) && overlay.style.display !== 'none') {
    hideOverlay();
  }
});

// Optional: Listen for selectionchange for more responsive handling
document.addEventListener('selectionchange', () => {
  const selectedText = getSelectedText().trim();
  if (selectedText.length === 0) {
    hideOverlay();
  }
});

// Error handling: Log any issues without disrupting the page
window.addEventListener('error', (event) => {
  console.error('Content script error:', event.message);
});

// Optional: Communicate with background script if needed (e.g., send selected text)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ text: getSelectedText() });
  }
});