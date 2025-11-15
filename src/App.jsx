import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import { useLLMChatbot } from './hooks/useLLMChatbot';
import { generateMessageId } from './utils/generateId';
import { logger } from './utils/logger';
import Toast from './components/Toast';
import './styles/toast.css';
import {
    MAX_PAGER_MESSAGES,
    WEBHOOK_DELAY_MS,
    COPY_FEEDBACK_DURATION_MS,
    TOAST_DURATION_MS
} from './utils/constants';

const EXAMPLE_MESSAGES = [
    { id: generateMessageId(), sender: 'Alice', content: "Hey! How's the project?", timestamp: '14:32', type: 'received' },
    { id: generateMessageId(), sender: 'Bob', content: 'Running late to meeting', timestamp: '14:45', type: 'received' },
    { id: generateMessageId(), sender: 'ChatBot', content: 'Temperature: 72°F, Humidity: 45%', timestamp: '15:00', type: 'bot' },
    { id: generateMessageId(), sender: 'Manager', content: 'Send status report ASAP', timestamp: '15:15', type: 'received' },
    { id: generateMessageId(), sender: 'System', content: 'Network connectivity restored', timestamp: '15:30', type: 'bot' },
    { id: generateMessageId(), sender: 'Alice', content: 'Meeting at 4pm confirmed', timestamp: '15:45', type: 'received' },
    { id: generateMessageId(), sender: 'DevOps', content: 'Server deployment successful', timestamp: '16:00', type: 'received' },
    { id: generateMessageId(), sender: 'ChatBot', content: 'Reminder: Team standup in 15 mins', timestamp: '16:15', type: 'bot' },
    { id: generateMessageId(), sender: 'Bob', content: 'Code review completed', timestamp: '16:30', type: 'received' },
    { id: generateMessageId(), sender: 'Security', content: 'Password expiry notice: 7 days', timestamp: '16:45', type: 'received' }
];

function App() {
    const [mode, setMode] = useState('pager');
    const { isConnected: llmConnected, isInitializing: llmInitializing, isGenerating: llmGenerating, generateResponse } = useLLMChatbot(mode);
    const [messages, setMessages] = useState(EXAMPLE_MESSAGES);
    const [inputMessage, setInputMessage] = useState('');
    const [webhookStatus, setWebhookStatus] = useState('connected');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [webhookConfig, setWebhookConfig] = useState({
        outgoingUrl: '',
        authToken: '',
        enableAuth: false
    });
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState(null);
    const messagesEndRef = useRef(null);
    const modalTriggerRef = useRef(null); // Store element that opened modal for focus return

    const showToast = useCallback((message, type = 'info', duration = TOAST_DURATION_MS) => {
        setToast({ message, type, duration });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle Escape key to close modal
    useEffect(() => {
        if (!showSettings) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowSettings(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showSettings]);

    // Focus management for modal
    useEffect(() => {
        if (showSettings) {
            // Store the element that opened the modal
            modalTriggerRef.current = document.activeElement;

            // Focus the first focusable element in the modal
            setTimeout(() => {
                const modal = document.querySelector('.settings-modal');
                const firstFocusable = modal?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
                firstFocusable?.focus();
            }, 0);
        } else if (modalTriggerRef.current) {
            // Return focus to the element that opened the modal
            modalTriggerRef.current.focus();
            modalTriggerRef.current = null;
        }
    }, [showSettings]);

    const handleSendMessage = useCallback(() => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            id: generateMessageId(),
            sender: 'You',
            content: inputMessage,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'sent',
            status: 'sending'
        };

        // React 18 automatically batches these state updates in event handlers
        // This prevents multiple re-renders and improves performance
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setWebhookStatus('sending');
        setHasNewMessage(true);

        // Simulate webhook delivery
        const messageToSend = inputMessage;
        setTimeout(() => {
            setMessages(prev => prev.map((msg, idx) => 
                idx === prev.length - 1 ? { ...msg, status: 'delivered' } : msg
            ));
            setWebhookStatus('connected');

            // Trigger chatbot response
            handleChatbotResponse(messageToSend);
        }, WEBHOOK_DELAY_MS);
    }, [inputMessage]);

    const handleChatbotResponse = useCallback(async (userMessage) => {
        setIsTyping(true);

        try {
            // Generate response using LLM
            const response = await generateResponse(userMessage);

            setIsTyping(false);

            const botMessage = {
                id: generateMessageId(),
                sender: 'ChatBot',
                content: response,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'bot'
            };

            setMessages(prev => [...prev, botMessage]);
            setHasNewMessage(true);
        } catch (error) {
            logger.error('Chatbot error:', error);
            setIsTyping(false);
            
            // Fallback message on error
            const errorMessage = {
                id: generateMessageId(),
                sender: 'ChatBot',
                content: '[ERROR] Failed to generate response. Check LM Studio connection.',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    }, [generateResponse]);

    const handleClearMessages = useCallback(() => {
        setMessages([]);
        setHasNewMessage(false);
    }, []);

    const handleCopyWebhookUrl = useCallback(async () => {
        const backendWebhookUrl = `${window.location.origin}/api/webhook`;
        try {
            await navigator.clipboard.writeText(backendWebhookUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
        } catch (error) {
            logger.error('Failed to copy to clipboard:', error);
            showToast('Failed to copy URL. Please copy manually.', 'error');
        }
    }, [showToast]);

    const handleSaveWebhookConfig = useCallback((e) => {
        e.preventDefault();
        setShowSettings(false);
    }, []);

    // Memoize mode switching callbacks
    const handleModeChangeToPager = useCallback(() => setMode('pager'), []);
    const handleModeChangeToFax = useCallback(() => setMode('fax'), []);
    const handleOpenSettings = useCallback(() => setShowSettings(true), []);
    const handleCloseSettings = useCallback(() => setShowSettings(false), []);
    const handleMarkAsRead = useCallback(() => setHasNewMessage(false), []);
    const handleScrollToTop = useCallback(() => window.scrollTo(0, 0), []);
    const handleScrollToBottom = useCallback(() => window.scrollTo(0, document.body.scrollHeight), []);

    // Memoize input handlers
    const handleInputChange = useCallback((e) => setInputMessage(e.target.value), []);
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Memoize recent messages for pager view
    const recentPagerMessages = useMemo(() => {
        return messages.slice(-MAX_PAGER_MESSAGES);
    }, [messages]);

    // Memoize message numbering info
    const messageNumberingInfo = useMemo(() => {
        const startIndex = Math.max(0, messages.length - MAX_PAGER_MESSAGES);
        return { startIndex, total: messages.length };
    }, [messages.length]);

    const renderPagerView = () => (
        <div className="pager-device">
            <div className="pager-label">
                ━━━ RETROPAGER 9000 ━━━ MADE IN JAPAN ━━━
            </div>
            
            <div className="pager-screen">
                <div className="pager-display">
                    {messages.length === 0 ? (
                        <div>NO MESSAGES</div>
                    ) : (
                        recentPagerMessages.map((msg, idx) => (
                            <div key={msg.id} className="pager-message">
                                <div>
                                    {msg.type === 'bot' && <span className="bot-prefix">[BOT] </span>}
                                    MSG #{messageNumberingInfo.startIndex + idx + 1} FROM: {msg.sender}
                                </div>
                                <div>TIME: {msg.timestamp}</div>
                                <div>TEXT: {msg.content}</div>
                                {msg.status && (
                                    <div className="message-status">
                                        [{msg.status.toUpperCase()}]
                                    </div>
                                )}
                                <div>━━━━━━━━━━━━━━━━━━━━━</div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="typing-indicator">
                            <span className="bot-prefix">[LLM] </span>{llmGenerating ? 'GENERATING' : 'TYPING'}
                            <span className="typing-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="pager-controls">
                <button className="pager-btn" onClick={handleScrollToTop} aria-label="Scroll to top">▲ UP</button>
                <button className="pager-btn" onClick={handleModeChangeToFax} aria-label="Switch to fax mode">📠 FAX</button>
                <button className="pager-btn" onClick={handleScrollToBottom} aria-label="Scroll to bottom">▼ DOWN</button>
                <button className="pager-btn" onClick={handleClearMessages} aria-label="Clear all messages">✕ CLEAR</button>
                <button className="pager-btn" onClick={handleOpenSettings} aria-label="Open settings menu">⚙ MENU</button>
                <button className="pager-btn" onClick={handleMarkAsRead} aria-label="Mark messages as read">✓ READ</button>
            </div>

            <div className="input-area">
                <div className="input-container">
                    <input
                        type="text"
                        className="message-input"
                        placeholder="Type message..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="send-btn" onClick={handleSendMessage}>
                        SEND
                    </button>
                </div>
                <div className="webhook-status">
                    <span className={`alert-led ${hasNewMessage ? 'active' : ''}`}></span>
                    {webhookStatus === 'sending' ? (
                        <>
                            <div className="webhook-spinner"></div>
                            <span>WEBHOOK: TRANSMITTING...</span>
                        </>
                    ) : (
                        <>
                            <div className="webhook-indicator"></div>
                            <span>WEBHOOK: CONNECTED | LLM: {llmInitializing ? 'INIT...' : llmConnected ? 'ONLINE' : 'OFFLINE'}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="device-label">
                MODEL: RP-9000 | SN: 19891225 | FCC ID: RETRO2025
            </div>
        </div>
    );

    const renderFaxView = () => (
        <div className="fax-device">
            <div className="fax-header">
                <span className={`alert-led ${hasNewMessage ? 'active' : ''}`}></span>
                FACSIMILE TRANSCEIVER | AWS KIRO WEBHOOK ENABLED
            </div>

            <div className="fax-paper-slot">
                <div className="fax-paper">
                    {webhookStatus === 'sending' && <div className="scanning-line"></div>}
                    
                    {messages.length === 0 ? (
                        <div className="fax-empty-state">
                            NO FAX RECEIVED
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={msg.id} className="fax-message">
                                <div className="fax-header-line">
                                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                </div>
                                <div className="fax-header-line">
                                    FROM: {msg.sender.toUpperCase()}
                                    <br />
                                    DATE: {new Date().toLocaleDateString()} {msg.timestamp}
                                    <br />
                                    PAGE: {idx + 1} OF {messages.length}
                                    {msg.type === 'bot' && ' | TYPE: AUTOMATED'}
                                </div>
                                <div className="fax-header-line">
                                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                </div>
                                <div className="fax-message-content">
                                    {msg.content}
                                </div>
                                {msg.status && (
                                    <div className="fax-status">
                                        STATUS: {msg.status.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="fax-message" style={{color: '#666'}}>
                            <div className="fax-header-line">
                                {llmGenerating ? 'LLM GENERATING RESPONSE...' : 'INCOMING TRANSMISSION...'}
                            </div>
                            <div className="typing-dots">
                                PRINTING<span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="input-area">
                <div className="input-container">
                    <input
                        type="text"
                        className="message-input"
                        placeholder="Type message to send..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="send-btn" onClick={handleSendMessage}>
                        TRANSMIT
                    </button>
                </div>
                <div className="webhook-status">
                    {webhookStatus === 'sending' ? (
                        <>
                            <div className="webhook-spinner"></div>
                            <span>TRANSMITTING VIA WEBHOOK...</span>
                        </>
                    ) : (
                        <>
                            <div className="webhook-indicator"></div>
                            <span>LINE READY | LLM: {llmInitializing ? 'INIT...' : llmConnected ? 'ONLINE' : 'OFFLINE'}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="pager-controls">
                <button className="pager-btn" onClick={handleModeChangeToPager} aria-label="Switch to pager mode">📟 PAGER</button>
                <button className="pager-btn" onClick={handleClearMessages} aria-label="Clear all messages">🗑 CLEAR</button>
                <button className="pager-btn" onClick={handleOpenSettings} aria-label="Open settings menu">⚙ MENU</button>
                <button className="pager-btn" onClick={handleMarkAsRead} aria-label="Mark messages as read">✓ READ</button>
            </div>

            <div className="device-label">
                FAX-2000 | THERMAL PRINTER | 9600 BAUD MODEM
            </div>
        </div>
    );

    return (
        <div className="app-container">
            <div className="header">
                <h1>⚡ RETRO MESSENGER ⚡</h1>
                <div className="subtitle">
                    Modern Messaging Reimagined with 1980s Tech
                </div>
            </div>

            <div className="device-container">
                <div className="mode-switcher">
                    <button 
                        className={`mode-btn pager ${mode === 'pager' ? 'active' : ''}`}
                        onClick={handleModeChangeToPager}
                        aria-label="Switch to pager mode"
                    >
                        📟 Pager Mode
                    </button>
                    <button 
                        className={`mode-btn fax ${mode === 'fax' ? 'active' : ''}`}
                        onClick={handleModeChangeToFax}
                        aria-label="Switch to fax mode"
                    >
                        📠 Fax Mode
                    </button>
                </div>

                {mode === 'pager' ? renderPagerView() : renderFaxView()}
            </div>

            <div className="powered-by">
                🎃 Kiroween Hackathon 2025 | Powered by <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer">AWS Kiro</a> Webhooks &amp; Chatbots
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={hideToast}
                />
            )}

            {showSettings && (
                <div 
                    className="settings-modal-overlay" 
                    onClick={handleCloseSettings}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-modal-title"
                >
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-header">
                            <h2 id="settings-modal-title">⚙ WEBHOOK CONFIGURATION</h2>
                            <button 
                                className="settings-close" 
                                onClick={handleCloseSettings}
                                aria-label="Close settings"
                            >
                                ×
                            </button>
                        </div>

                        <form className="settings-form" onSubmit={handleSaveWebhookConfig}>
                            <div className="settings-section">
                                <h3>🤖 LLM Status</h3>
                                <div className="llm-status-display">
                                    <div className={`llm-status-indicator ${llmConnected ? 'connected' : 'disconnected'}`}>
                                        {llmInitializing ? '⏳ Initializing...' : llmConnected ? '✓ Connected to LM Studio' : '✗ LM Studio Offline'}
                                    </div>
                                    {!llmConnected && !llmInitializing && (
                                        <p className="settings-description" style={{color: '#ff6b6b'}}>
                                            Start LM Studio and load a model to enable AI responses.
                                            <br />
                                            <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer" style={{color: '#00ff41'}}>
                                                Download LM Studio →
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>Your Webhook Endpoint</h3>
                                <p className="settings-description">
                                    Use this URL to receive messages from external services
                                </p>
                                <div className="settings-endpoint">
                                    <input
                                        type="text"
                                        className="settings-input"
                                        value={`${window.location.origin}/api/webhook`}
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        className="settings-copy-btn"
                                        onClick={handleCopyWebhookUrl}
                                    >
                                        {copied ? '✓ Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="settings-section">
                                <label className="settings-label">
                                    Outgoing Webhook URL
                                </label>
                                <input
                                    type="text"
                                    className="settings-input"
                                    value={webhookConfig.outgoingUrl}
                                    onChange={(e) => setWebhookConfig({...webhookConfig, outgoingUrl: e.target.value})}
                                    placeholder="https://example.com/receive"
                                />
                                <p className="settings-description">
                                    URL where your messages will be sent
                                </p>
                            </div>

                            <div className="settings-section">
                                <h3>Authentication</h3>
                                <label className="settings-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={webhookConfig.enableAuth}
                                        onChange={(e) => setWebhookConfig({...webhookConfig, enableAuth: e.target.checked})}
                                    />
                                    <span>Enable Authentication</span>
                                </label>

                                {webhookConfig.enableAuth && (
                                    <div className="settings-auth-token">
                                        <label className="settings-label">
                                            Authentication Token
                                        </label>
                                        <input
                                            type="password"
                                            className="settings-input"
                                            value={webhookConfig.authToken}
                                            onChange={(e) => setWebhookConfig({...webhookConfig, authToken: e.target.value})}
                                            placeholder="Enter your auth token"
                                        />
                                        <p className="settings-description">
                                            Bearer token for webhook authentication
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="settings-actions">
                                <button type="submit" className="settings-save-btn">
                                    Save Configuration
                                </button>
                                <button
                                    type="button"
                                    className="settings-cancel-btn"
                                    onClick={handleCloseSettings}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
