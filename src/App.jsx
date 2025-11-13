import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useLLMChatbot } from './hooks/useLLMChatbot';

const EXAMPLE_MESSAGES = [
    { sender: 'Alice', content: "Hey! How's the project?", timestamp: '14:32', type: 'received' },
    { sender: 'Bob', content: 'Running late to meeting', timestamp: '14:45', type: 'received' },
    { sender: 'ChatBot', content: 'Temperature: 72°F, Humidity: 45%', timestamp: '15:00', type: 'bot' },
    { sender: 'Manager', content: 'Send status report ASAP', timestamp: '15:15', type: 'received' },
    { sender: 'System', content: 'Network connectivity restored', timestamp: '15:30', type: 'bot' },
    { sender: 'Alice', content: 'Meeting at 4pm confirmed', timestamp: '15:45', type: 'received' },
    { sender: 'DevOps', content: 'Server deployment successful', timestamp: '16:00', type: 'received' },
    { sender: 'ChatBot', content: 'Reminder: Team standup in 15 mins', timestamp: '16:15', type: 'bot' },
    { sender: 'Bob', content: 'Code review completed', timestamp: '16:30', type: 'received' },
    { sender: 'Security', content: 'Password expiry notice: 7 days', timestamp: '16:45', type: 'received' }
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
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            sender: 'You',
            content: inputMessage,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'sent',
            status: 'sending'
        };

        setMessages([...messages, newMessage]);
        setInputMessage('');
        setWebhookStatus('sending');
        setHasNewMessage(true);

        // Simulate webhook delivery
        setTimeout(() => {
            setMessages(prev => prev.map((msg, idx) => 
                idx === prev.length - 1 ? { ...msg, status: 'delivered' } : msg
            ));
            setWebhookStatus('connected');

            // Trigger chatbot response
            handleChatbotResponse(inputMessage);
        }, 1500);
    };

    const handleChatbotResponse = async (userMessage) => {
        setIsTyping(true);

        try {
            // Generate response using LLM
            const response = await generateResponse(userMessage);

            setIsTyping(false);

            const botMessage = {
                sender: 'ChatBot',
                content: response,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'bot'
            };

            setMessages(prev => [...prev, botMessage]);
            setHasNewMessage(true);
        } catch (error) {
            console.error('Chatbot error:', error);
            setIsTyping(false);
            
            // Fallback message on error
            const errorMessage = {
                sender: 'ChatBot',
                content: '[ERROR] Failed to generate response. Check LM Studio connection.',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleClearMessages = () => {
        setMessages([]);
        setHasNewMessage(false);
    };

    const handleCopyWebhookUrl = async () => {
        const backendWebhookUrl = `${window.location.origin}/api/webhook`;
        try {
            await navigator.clipboard.writeText(backendWebhookUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy URL. Please copy manually.');
        }
    };

    const handleSaveWebhookConfig = (e) => {
        e.preventDefault();
        setShowSettings(false);
    };

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
                        messages.slice(-5).map((msg, idx) => (
                            <div key={idx} className="pager-message">
                                <div>
                                    {msg.type === 'bot' && <span className="bot-prefix">[BOT] </span>}
                                    MSG #{messages.length - 5 + idx + 1} FROM: {msg.sender}
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
                <button className="pager-btn" onClick={() => window.scrollTo(0, 0)}>▲ UP</button>
                <button className="pager-btn" onClick={() => setMode('fax')}>📠 FAX</button>
                <button className="pager-btn" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>▼ DOWN</button>
                <button className="pager-btn" onClick={handleClearMessages}>✕ CLEAR</button>
                <button className="pager-btn" onClick={() => setShowSettings(true)}>⚙ MENU</button>
                <button className="pager-btn" onClick={() => setHasNewMessage(false)}>✓ READ</button>
            </div>

            <div className="input-area">
                <div className="input-container">
                    <input
                        type="text"
                        className="message-input"
                        placeholder="Type message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                        <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                            NO FAX RECEIVED
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className="fax-message">
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
                                <div style={{marginTop: '15px', marginBottom: '15px'}}>
                                    {msg.content}
                                </div>
                                {msg.status && (
                                    <div style={{fontSize: '10px', color: '#666'}}>
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
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                <button className="pager-btn" onClick={() => setMode('pager')}>📟 PAGER</button>
                <button className="pager-btn" onClick={handleClearMessages}>🗑 CLEAR</button>
                <button className="pager-btn" onClick={() => setShowSettings(true)}>⚙ MENU</button>
                <button className="pager-btn" onClick={() => setHasNewMessage(false)}>✓ READ</button>
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
                        onClick={() => setMode('pager')}
                    >
                        📟 Pager Mode
                    </button>
                    <button 
                        className={`mode-btn fax ${mode === 'fax' ? 'active' : ''}`}
                        onClick={() => setMode('fax')}
                    >
                        📠 Fax Mode
                    </button>
                </div>

                {mode === 'pager' ? renderPagerView() : renderFaxView()}
            </div>

            <div className="powered-by">
                🎃 Kiroween Hackathon 2025 | Powered by <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer">AWS Kiro</a> Webhooks &amp; Chatbots
            </div>

            {showSettings && (
                <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-header">
                            <h2>⚙ WEBHOOK CONFIGURATION</h2>
                            <button className="settings-close" onClick={() => setShowSettings(false)}>×</button>
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
                                    onClick={() => setShowSettings(false)}
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
