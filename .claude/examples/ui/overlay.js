// overlay.js - Comprehensive Smart Overlay Component for Browser Extensions

/**
 * Creates and manages a smart overlay popup that positions itself near a trigger
 * (e.g., text selection or mouse position) without overflowing the viewport.
 * Features: Auto-adjust left/top, optional arrow, dismiss on outside click/esc.
 * Usage: Call showOverlay(event, content) with MouseEvent and HTML/string content.
 */

// Singleton overlay element
let overlay = null;
let arrow = null;

// Configuration options
const DEFAULT_OPTIONS = {
  offsetX: 10, // Horizontal offset from trigger
  offsetY: 10, // Vertical offset from trigger
  maxWidth: '300px',
  zIndex: 9999,
  showArrow: true,
  arrowSize: 8, // Arrow triangle size in px
  styles: { // Default CSS styles
    position: 'absolute',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px'
  }
};

// Initialize overlay if not exists
function initOverlay() {
  if (!overlay) {
    overlay = document.createElement('div');
    Object.assign(overlay.style, DEFAULT_OPTIONS.styles);
    overlay.style.maxWidth = DEFAULT_OPTIONS.maxWidth;
    overlay.style.zIndex = DEFAULT_OPTIONS.zIndex;
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    // Optional arrow
    if (DEFAULT_OPTIONS.showArrow) {
      arrow = document.createElement('div');
      arrow.style.position = 'absolute';
      arrow.style.border = `${DEFAULT_OPTIONS.arrowSize}px solid transparent`;
      overlay.appendChild(arrow);
    }

    // Dismiss handlers
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', repositionOverlay);
    window.addEventListener('scroll', repositionOverlay);
  }
}

// Show overlay at position from event (e.g., mouseup)
function showOverlay(event, content, options = {}) {
  initOverlay();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Set content
  if (typeof content === 'string') {
    overlay.innerHTML = content;
  } else {
    overlay.appendChild(content);
  }

  overlay.style.display = 'block';

  // Calculate initial position
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  let posX = event.clientX + scrollX + mergedOptions.offsetX;
  let posY = event.clientY + scrollY + mergedOptions.offsetY;

  overlay.style.left = `${posX}px`;
  overlay.style.top = `${posY}px`;

  // Smart adjustment for viewport overflow
  adjustForViewport(mergedOptions);

  // Position arrow if enabled (default bottom-left pointing up)
  if (arrow) {
    arrow.style.borderBottomColor = '#ccc'; // Match border
    arrow.style.top = `-${DEFAULT_OPTIONS.arrowSize * 2}px`;
    arrow.style.left = '10px'; // Offset from left
    arrow.style.borderTop = 'none';
  }
}

// Adjust position to prevent overflow
function adjustForViewport(options) {
  const rect = overlay.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let adjustX = 0;
  let adjustY = 0;

  // Horizontal overflow
  if (rect.right > viewportWidth) {
    adjustX = viewportWidth - rect.right - options.offsetX; // Flip left if possible
    if (arrow) {
      arrow.style.left = 'auto';
      arrow.style.right = '10px'; // Adjust arrow for right alignment
    }
  } else if (rect.left < 0) {
    adjustX = -rect.left + options.offsetX;
  }

  // Vertical overflow (flip to top if bottom overflow)
  if (rect.bottom > viewportHeight) {
    adjustY = -rect.height - options.offsetY * 2; // Move above trigger
    if (arrow) {
      arrow.style.top = 'auto';
      arrow.style.bottom = `-${options.arrowSize * 2}px`;
      arrow.style.borderBottom = 'none';
      arrow.style.borderTopColor = '#ccc'; // Point down
    }
  } else if (rect.top < 0) {
    adjustY = -rect.top + options.offsetY;
  }

  overlay.style.transform = `translate(${adjustX}px, ${adjustY}px)`;
}

// Reposition on resize/scroll (requires storing last event)
let lastEvent = null;
function repositionOverlay() {
  if (overlay.style.display === 'block' && lastEvent) {
    showOverlay(lastEvent, overlay.innerHTML); // Recompute
  }
}

// Hide overlay
function hideOverlay() {
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = ''; // Clear content
    overlay.style.transform = ''; // Reset
  }
}

// Handle outside click
function handleOutsideClick(event) {
  if (overlay && !overlay.contains(event.target) && overlay.style.display === 'block') {
    hideOverlay();
  }
}

// Handle escape key
function handleEscape(event) {
  if (event.key === 'Escape') {
    hideOverlay();
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showOverlay, hideOverlay };
} else {
  window.Overlay = { showOverlay, hideOverlay };
}

// Usage example: showOverlay(event, '<p>Selected Text: Hello</p>');