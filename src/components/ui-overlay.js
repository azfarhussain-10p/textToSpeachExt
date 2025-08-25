/**
 * UI Overlay Component for Intelligent TTS Extension
 * Provides contextual interface for TTS and AI explanation features
 */

export class UIOverlay {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.isInitialized = false;
        this.currentCallbacks = {};
        this.settings = {
            showOverlay: true,
            theme: 'auto', // 'light', 'dark', 'auto'
            position: 'smart', // 'smart', 'top', 'bottom', 'cursor'
            animations: true
        };
        this.overlayId = 'tts-extension-overlay';
    }

    async initialize() {
        try {
            this.createOverlayStructure();
            this.attachEventListeners();
            this.applyTheme();
            this.isInitialized = true;
            console.log('UI Overlay initialized successfully');
        } catch (error) {
            console.error('Failed to initialize UI Overlay:', error);
            throw error;
        }
    }

    createOverlayStructure() {
        // Remove existing overlay if present
        const existing = document.getElementById(this.overlayId);
        if (existing) {
            existing.remove();
        }

        // Create main container
        this.container = document.createElement('div');
        this.container.id = this.overlayId;
        this.container.className = 'tts-overlay-container';
        
        // Create overlay content
        this.container.innerHTML = `
            <div class="tts-overlay-content">
                <div class="tts-overlay-header">
                    <div class="tts-overlay-title">
                        <span class="tts-icon">🔊</span>
                        <span class="tts-title-text">TTS Assistant</span>
                    </div>
                    <button class="tts-close-btn" aria-label="Close TTS overlay" title="Close (Esc)">
                        <span>×</span>
                    </button>
                </div>
                
                <div class="tts-overlay-body">
                    <div class="tts-selected-text" role="region" aria-label="Selected text">
                        <div class="tts-text-content"></div>
                    </div>
                    
                    <div class="tts-controls" role="toolbar" aria-label="TTS controls">
                        <button class="tts-btn tts-speak-btn" aria-label="Read selected text aloud" title="Speak (Ctrl+Shift+S)">
                            <span class="btn-icon">▶️</span>
                            <span class="btn-text">Speak</span>
                        </button>
                        
                        <button class="tts-btn tts-explain-btn" aria-label="Get AI explanation" title="Explain (Ctrl+Shift+E)">
                            <span class="btn-icon">💡</span>
                            <span class="btn-text">Explain</span>
                        </button>
                        
                        <button class="tts-btn tts-stop-btn" style="display: none;" aria-label="Stop speaking" title="Stop (Ctrl+Shift+X)">
                            <span class="btn-icon">⏹️</span>
                            <span class="btn-text">Stop</span>
                        </button>
                    </div>
                    
                    <div class="tts-status" role="status" aria-live="polite">
                        <div class="tts-loading" style="display: none;">
                            <div class="tts-spinner"></div>
                            <span class="tts-loading-text">Processing...</span>
                        </div>
                        <div class="tts-error" style="display: none;"></div>
                    </div>
                    
                    <div class="tts-explanation" style="display: none;">
                        <div class="tts-explanation-header">
                            <h4>AI Explanation</h4>
                            <button class="tts-btn tts-speak-explanation-btn" aria-label="Read explanation aloud">
                                <span class="btn-icon">🔊</span>
                            </button>
                        </div>
                        <div class="tts-explanation-content"></div>
                    </div>
                </div>
                
                <div class="tts-overlay-footer">
                    <div class="tts-shortcuts">
                        <span class="tts-shortcut">Ctrl+Shift+S: Speak</span>
                        <span class="tts-shortcut">Ctrl+Shift+E: Explain</span>
                        <span class="tts-shortcut">Esc: Close</span>
                    </div>
                </div>
            </div>
        `;

        // Apply styles
        this.injectStyles();
        
        // Append to document
        document.body.appendChild(this.container);
    }

    injectStyles() {
        const styleId = 'tts-overlay-styles';
        
        // Remove existing styles
        const existingStyles = document.getElementById(styleId);
        if (existingStyles) {
            existingStyles.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .tts-overlay-container {
                position: fixed;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                color: #333;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                border-radius: 12px;
                background: white;
                border: 1px solid #e1e5e9;
                min-width: 320px;
                max-width: 500px;
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
            }
            
            .tts-overlay-container.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }
            
            .tts-overlay-content {
                padding: 0;
                background: white;
                border-radius: 12px;
                overflow: hidden;
            }
            
            .tts-overlay-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .tts-overlay-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
            }
            
            .tts-icon {
                font-size: 16px;
            }
            
            .tts-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .tts-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .tts-overlay-body {
                padding: 16px;
            }
            
            .tts-selected-text {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 16px;
                border-left: 3px solid #667eea;
                max-height: 120px;
                overflow-y: auto;
            }
            
            .tts-text-content {
                font-style: italic;
                color: #495057;
                word-wrap: break-word;
            }
            
            .tts-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .tts-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                flex: 1;
                min-width: 80px;
                justify-content: center;
            }
            
            .tts-btn:hover {
                background: #5a6fd8;
                transform: translateY(-1px);
            }
            
            .tts-btn:active {
                transform: translateY(0);
            }
            
            .tts-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
                transform: none;
            }
            
            .tts-explain-btn {
                background: #28a745;
            }
            
            .tts-explain-btn:hover {
                background: #218838;
            }
            
            .tts-stop-btn {
                background: #dc3545;
            }
            
            .tts-stop-btn:hover {
                background: #c82333;
            }
            
            .tts-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6c757d;
                font-size: 13px;
            }
            
            .tts-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #e9ecef;
                border-top: 2px solid #667eea;
                border-radius: 50%;
                animation: tts-spin 1s linear infinite;
            }
            
            @keyframes tts-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .tts-error {
                background: #f8d7da;
                color: #721c24;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
            }
            
            .tts-explanation {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e9ecef;
            }
            
            .tts-explanation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .tts-explanation-header h4 {
                margin: 0;
                color: #495057;
                font-size: 14px;
                font-weight: 600;
            }
            
            .tts-speak-explanation-btn {
                background: #17a2b8;
                min-width: auto;
                padding: 6px 8px;
                font-size: 12px;
            }
            
            .tts-speak-explanation-btn:hover {
                background: #138496;
            }
            
            .tts-explanation-content {
                background: #e8f4f8;
                padding: 12px;
                border-radius: 6px;
                color: #495057;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .tts-overlay-footer {
                padding: 12px 16px;
                background: #f8f9fa;
                border-top: 1px solid #e9ecef;
            }
            
            .tts-shortcuts {
                display: flex;
                gap: 12px;
                font-size: 11px;
                color: #6c757d;
                flex-wrap: wrap;
            }
            
            .tts-shortcut {
                background: #e9ecef;
                padding: 2px 6px;
                border-radius: 3px;
            }
            
            /* Dark theme */
            @media (prefers-color-scheme: dark) {
                .tts-overlay-container {
                    background: #2d3748;
                    border-color: #4a5568;
                    color: #e2e8f0;
                }
                
                .tts-overlay-content {
                    background: #2d3748;
                }
                
                .tts-selected-text {
                    background: #4a5568;
                    color: #e2e8f0;
                }
                
                .tts-text-content {
                    color: #cbd5e0;
                }
                
                .tts-overlay-footer {
                    background: #4a5568;
                    border-color: #718096;
                }
                
                .tts-explanation-content {
                    background: #4a5568;
                    color: #e2e8f0;
                }
                
                .tts-shortcuts {
                    color: #a0aec0;
                }
                
                .tts-shortcut {
                    background: #718096;
                    color: #e2e8f0;
                }
            }
            
            /* Responsive design */
            @media (max-width: 480px) {
                .tts-overlay-container {
                    min-width: 280px;
                    max-width: 90vw;
                }
                
                .tts-controls {
                    flex-direction: column;
                }
                
                .tts-shortcuts {
                    font-size: 10px;
                    gap: 8px;
                }
            }
            
            /* Accessibility */
            .tts-overlay-container:focus-within {
                outline: 2px solid #667eea;
                outline-offset: 2px;
            }
            
            .tts-btn:focus {
                outline: 2px solid #fff;
                outline-offset: 2px;
            }
            
            /* Animation utilities */
            .tts-fade-in {
                animation: tts-fadeIn 0.3s ease-out;
            }
            
            @keyframes tts-fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
    }

    attachEventListeners() {
        if (!this.container) return;

        // Close button
        const closeBtn = this.container.querySelector('.tts-close-btn');
        closeBtn?.addEventListener('click', () => this.hide());

        // Control buttons
        const speakBtn = this.container.querySelector('.tts-speak-btn');
        speakBtn?.addEventListener('click', () => this.handleSpeak());

        const explainBtn = this.container.querySelector('.tts-explain-btn');
        explainBtn?.addEventListener('click', () => this.handleExplain());

        const stopBtn = this.container.querySelector('.tts-stop-btn');
        stopBtn?.addEventListener('click', () => this.handleStop());

        const speakExplanationBtn = this.container.querySelector('.tts-speak-explanation-btn');
        speakExplanationBtn?.addEventListener('click', () => this.handleSpeakExplanation());

        // Click outside to close
        document.addEventListener('click', (event) => {
            if (this.isVisible && !this.container.contains(event.target)) {
                this.hide();
            }
        });

        // Prevent overlay from closing when clicking inside
        this.container.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    show(options = {}) {
        if (!this.isInitialized || !this.settings.showOverlay) return;

        const { text, position, onSpeak, onExplain, onClose } = options;

        // Store callbacks
        this.currentCallbacks = { onSpeak, onExplain, onClose };

        // Update text content
        const textContent = this.container.querySelector('.tts-text-content');
        if (textContent && text) {
            textContent.textContent = text.length > 200 ? text.substring(0, 200) + '...' : text;
        }

        // Position overlay
        this.positionOverlay(position);

        // Show overlay
        this.container.classList.add('visible');
        this.isVisible = true;

        // Focus management for accessibility
        setTimeout(() => {
            const firstButton = this.container.querySelector('.tts-speak-btn');
            firstButton?.focus();
        }, 100);
    }

    hide() {
        if (!this.container) return;

        this.container.classList.remove('visible');
        this.isVisible = false;
        this.clearStatus();
        this.hideExplanation();

        // Call close callback
        if (this.currentCallbacks.onClose) {
            this.currentCallbacks.onClose();
        }
    }

    positionOverlay(position) {
        if (!position) return;

        const { x, y } = position;
        const rect = this.container.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x;
        let top = y + 20; // Offset below cursor

        // Adjust horizontal position if overlay would go off-screen
        if (left + rect.width > viewportWidth) {
            left = viewportWidth - rect.width - 20;
        }
        if (left < 20) {
            left = 20;
        }

        // Adjust vertical position if overlay would go off-screen
        if (top + rect.height > viewportHeight) {
            top = y - rect.height - 10; // Position above cursor
        }
        if (top < 20) {
            top = 20;
        }

        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;
    }

    setLoadingState(type) {
        const loading = this.container.querySelector('.tts-loading');
        const loadingText = this.container.querySelector('.tts-loading-text');
        const speakBtn = this.container.querySelector('.tts-speak-btn');
        const explainBtn = this.container.querySelector('.tts-explain-btn');
        const stopBtn = this.container.querySelector('.tts-stop-btn');

        this.clearStatus();

        if (loading && loadingText) {
            loading.style.display = 'flex';
            
            if (type === 'speaking') {
                loadingText.textContent = 'Speaking...';
                speakBtn.style.display = 'none';
                stopBtn.style.display = 'flex';
            } else if (type === 'explaining') {
                loadingText.textContent = 'Getting explanation...';
                explainBtn.disabled = true;
            }
        }
    }

    clearLoadingState() {
        const loading = this.container.querySelector('.tts-loading');
        const speakBtn = this.container.querySelector('.tts-speak-btn');
        const explainBtn = this.container.querySelector('.tts-explain-btn');
        const stopBtn = this.container.querySelector('.tts-stop-btn');

        if (loading) {
            loading.style.display = 'none';
        }

        speakBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        explainBtn.disabled = false;
    }

    showError(message) {
        this.clearStatus();
        
        const error = this.container.querySelector('.tts-error');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                error.style.display = 'none';
            }, 5000);
        }
    }

    clearStatus() {
        const loading = this.container.querySelector('.tts-loading');
        const error = this.container.querySelector('.tts-error');
        
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'none';
    }

    showExplanation(options = {}) {
        const { explanation, onSpeak } = options;
        
        const explanationDiv = this.container.querySelector('.tts-explanation');
        const explanationContent = this.container.querySelector('.tts-explanation-content');
        
        if (explanationDiv && explanationContent) {
            explanationContent.textContent = explanation;
            explanationDiv.style.display = 'block';
            
            // Store callback for speaking explanation
            this.currentCallbacks.onSpeakExplanation = () => onSpeak && onSpeak(explanation);
            
            // Add fade-in animation
            explanationDiv.classList.add('tts-fade-in');
        }
    }

    hideExplanation() {
        const explanationDiv = this.container.querySelector('.tts-explanation');
        if (explanationDiv) {
            explanationDiv.style.display = 'none';
        }
    }

    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        this.applyTheme();
    }

    applyTheme() {
        // Theme handling is done via CSS media queries for now
        // Could be extended to allow manual theme override
    }

    // Event handlers
    handleSpeak() {
        if (this.currentCallbacks.onSpeak) {
            this.currentCallbacks.onSpeak();
        }
    }

    handleExplain() {
        if (this.currentCallbacks.onExplain) {
            this.currentCallbacks.onExplain();
        }
    }

    handleStop() {
        // Stop functionality will be handled by the content script
        this.clearLoadingState();
    }

    handleSpeakExplanation() {
        if (this.currentCallbacks.onSpeakExplanation) {
            this.currentCallbacks.onSpeakExplanation();
        }
    }

    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        
        const styles = document.getElementById('tts-overlay-styles');
        if (styles) {
            styles.remove();
        }
        
        this.isInitialized = false;
        this.isVisible = false;
    }
}