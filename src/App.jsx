import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import { useLLMChatbot } from './hooks/useLLMChatbot';
import { generateMessageId } from './utils/generateId';
import { logger } from './utils/logger';
import Toast from './components/Toast';
import LoginScreen from './components/LoginScreen';
import UserSelector from './components/UserSelector';
import PagerView from './components/PagerView';
import FaxView from './components/FaxView';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsModal from './components/SettingsModal';
import { authService } from './services/AuthService';
import { messagingService } from './services/MessagingService';
import './styles/toast.css';
import {
    MAX_PAGER_MESSAGES,
    WEBHOOK_DELAY_MS,
    TOAST_DURATION_MS,
    CHATBOT_USERNAME,
    MODE_PAGER,
    MODE_FAX
} from './utils/constants';

function App() {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Recipient selection state
    const [selectedRecipient, setSelectedRecipient] = useState(CHATBOT_USERNAME);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showUserSelector, setShowUserSelector] = useState(false);

    // Existing state
    const [mode, setMode] = useState(MODE_PAGER);
    const { isConnected: llmConnected, isInitializing: llmInitializing, isGenerating: llmGenerating, generateResponse } = useLLMChatbot(mode);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [webhookStatus, setWebhookStatus] = useState('connected');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [toast, setToast] = useState(null);
    const [webhookConfig, setWebhookConfig] = useState({
        outgoingUrl: '',
        enableAuth: false,
        authToken: ''
    });
    const messagesEndRef = useRef(null);
    const modalTriggerRef = useRef(null); // Store element that opened modal for focus return
    const copyTimerRef = useRef(null); // Store timer for cleanup

    const showToast = useCallback((message, type = 'info', duration = TOAST_DURATION_MS) => {
        setToast({ message, type, duration });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    // Check for existing session on mount
    // Note: For security, we require re-login after page refresh to decrypt messages
    // This ensures the private key is only in memory during active sessions
    useEffect(() => {
        const checkSession = async () => {
            if (authService.isAuthenticated()) {
                // Clear session on page load - require fresh login for E2EE
                authService.clearSession();
                showToast('Please log in to access encrypted messages', 'info');
            }
        };

        checkSession();
    }, [showToast]); // showToast is memoized with useCallback, so this is safe

    // Listen for incoming messages
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubscribe = messagingService.onMessage((message) => {
            const newMessage = {
                id: message.messageId,
                sender: message.from,
                content: message.content,
                timestamp: new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                type: 'received',
                status: message.status
            };

            setMessages(prev => [...prev, newMessage]);
            setHasNewMessage(true);
            showToast(`New message from ${message.from}`, 'info', 2000);
        });

        return () => unsubscribe();
    }, [isAuthenticated, showToast]);

    // Load available users
    const loadAvailableUsers = useCallback(async () => {
        try {
            const users = await authService.getUsers();
            // Add ChatBot as a special recipient
            setAvailableUsers([
                { username: CHATBOT_USERNAME, online: true, lastSeen: null },
                ...users
            ]);
        } catch (error) {
            logger.error('Failed to load users:', error);
        }
    }, []);

    // Handle login/registration
    const handleLogin = useCallback(async (username, password, isRegistration = false) => {
        try {
            let result;
            if (isRegistration) {
                result = await authService.register(username, password);
            } else {
                result = await authService.login(username, password);
            }
            
            setCurrentUser({
                userId: result.userId,
                username: result.username,
                sessionId: result.sessionId
            });
            setIsAuthenticated(true);
            
            // Connect to messaging service
            messagingService.connect();
            
            // Load available users (and their public keys)
            loadAvailableUsers();
            
            showToast(
                isRegistration 
                    ? `Welcome to Retro Messenger, ${result.username}! 🔒 E2EE enabled.` 
                    : `Welcome back, ${result.username}! 🔒 E2EE enabled.`,
                'success'
            );
        } catch (error) {
            logger.error('Authentication failed:', error);
            showToast(error.message || 'Authentication failed. Please try again.', 'error');
            throw error;
        }
    }, [showToast, loadAvailableUsers]);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await authService.logout();
            messagingService.disconnect();
            
            setIsAuthenticated(false);
            setCurrentUser(null);
            setMessages([]);
            setSelectedRecipient(CHATBOT_USERNAME);
            setAvailableUsers([]);
            
            showToast('Logged out successfully', 'success');
        } catch (error) {
            logger.error('Logout failed:', error);
        }
    }, [showToast]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Cleanup copy timer on unmount
    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

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

    // Focus management and trap for modal
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

            // Focus trap: keep focus within modal
            const handleTab = (e) => {
                if (e.key !== 'Tab') return;

                const modal = document.querySelector('.settings-modal');
                if (!modal) return;

                const focusableElements = modal.querySelectorAll(
                    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            };

            document.addEventListener('keydown', handleTab);
            return () => {
                document.removeEventListener('keydown', handleTab);
                // Also restore focus if unmounting while modal is open
                if (modalTriggerRef.current) {
                    modalTriggerRef.current.focus();
                }
            };
        } else if (modalTriggerRef.current) {
            // Return focus to the element that opened the modal
            modalTriggerRef.current.focus();
            modalTriggerRef.current = null;
        }
    }, [showSettings]);

    const handleChatbotResponse = useCallback(async (userMessage) => {
        setIsTyping(true);

        try {
            // Generate response using LLM
            const response = await generateResponse(userMessage);

            setIsTyping(false);

            const botMessage = {
                id: generateMessageId(),
                sender: CHATBOT_USERNAME,
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
                sender: CHATBOT_USERNAME,
                content: '[ERROR] Failed to generate response. Check LM Studio connection.',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    }, [generateResponse]);

    const handleSendMessage = useCallback(async () => {
        // Prevent multiple simultaneous sends
        if (isSending) return;
        
        if (!inputMessage.trim()) {
            showToast('Please enter a message', 'error');
            return;
        }

        if (!selectedRecipient) {
            showToast('Please select a recipient', 'error');
            return;
        }
        
        setIsSending(true);

        const messageContent = inputMessage;
        const tempId = generateMessageId();
        
        // Add optimistic message to UI
        const optimisticMessage = {
            id: tempId,
            sender: 'You',
            recipient: selectedRecipient,
            content: messageContent,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'sent',
            status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setInputMessage('');
        setWebhookStatus('sending');

        // Check if sending to ChatBot (for LLM responses)
        if (selectedRecipient === CHATBOT_USERNAME) {
            // Trigger chatbot response (LLM or fallback)
            setTimeout(() => {
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'delivered' } : msg
                ));
                setWebhookStatus('connected');
                setIsSending(false);
                handleChatbotResponse(messageContent);
            }, WEBHOOK_DELAY_MS);
        } else {
            // Send to real user via backend
            try {
                const result = await messagingService.sendMessage(selectedRecipient, messageContent);
                
                // Update message with real ID and status
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { 
                        ...msg, 
                        id: result.messageId,
                        status: result.status,
                        timestamp: new Date(result.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    } : msg
                ));
                setWebhookStatus('connected');
                setIsSending(false);
                showToast(`Message sent to ${selectedRecipient}!`, 'success', 2000);
            } catch (error) {
                logger.error('Failed to send message:', error);
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'failed' } : msg
                ));
                setWebhookStatus('connected');
                setIsSending(false);
                showToast(error.message || 'Failed to send message', 'error');
            }
        }
    }, [inputMessage, selectedRecipient, showToast, handleChatbotResponse, isSending]);

    const handleClearMessages = useCallback(() => {
        setMessages([]);
        setHasNewMessage(false);
    }, []);

    const handleCopyWebhookUrl = useCallback(async () => {
        const backendWebhookUrl = `${window.location.origin}/api/webhook`;
        try {
            await navigator.clipboard.writeText(backendWebhookUrl);
            showToast('Webhook URL copied to clipboard!', 'success', 2000);
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
    const handleModeChangeToPager = useCallback(() => setMode(MODE_PAGER), []);
    const handleModeChangeToFax = useCallback(() => setMode(MODE_FAX), []);
    const handleOpenSettings = useCallback(() => setShowSettings(true), []);
    const handleCloseSettings = useCallback(() => setShowSettings(false), []);
    const handleScrollToTop = useCallback(() => window.scrollTo(0, 0), []);
    const handleScrollToBottom = useCallback(() => window.scrollTo(0, document.body.scrollHeight), []);
    
    // User selector handlers
    const handleOpenUserSelector = useCallback(() => {
        loadAvailableUsers(); // Refresh user list
        setShowUserSelector(true);
    }, [loadAvailableUsers]);
    
    const handleCloseUserSelector = useCallback(() => setShowUserSelector(false), []);
    
    const handleSelectRecipient = useCallback((username) => {
        setSelectedRecipient(username);
        showToast(`Recipient set to: ${username}`, 'success', 2000);
    }, [showToast]);

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

    // Memoize settings modal props to prevent unnecessary re-renders
    const settingsModalProps = useMemo(() => ({
        showSettings,
        currentUser,
        llmConnected,
        llmInitializing,
        webhookConfig
    }), [showSettings, currentUser, llmConnected, llmInitializing, webhookConfig]);

    // Show login screen if not authenticated
    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="app-container">
            <div className="header">
                <h1>⚡ RETRO MESSENGER ⚡</h1>
                <div className="subtitle">
                    Modern Messaging Reimagined with 1980s Tech - Multiuser Edition
                </div>
            </div>

            <div className="device-container">
                <div className="mode-switcher">
                    <button 
                        className={`mode-btn pager ${mode === MODE_PAGER ? 'active' : ''}`}
                        onClick={handleModeChangeToPager}
                        aria-label="Switch to pager mode"
                    >
                        📟 Pager Mode
                    </button>
                    <button 
                        className={`mode-btn fax ${mode === MODE_FAX ? 'active' : ''}`}
                        onClick={handleModeChangeToFax}
                        aria-label="Switch to fax mode"
                    >
                        📠 Fax Mode
                    </button>
                </div>

                <ErrorBoundary>
                    {mode === MODE_PAGER ? (
                        <PagerView
                            messages={messages}
                            recentPagerMessages={recentPagerMessages}
                            messageNumberingInfo={messageNumberingInfo}
                            isTyping={isTyping}
                            llmGenerating={llmGenerating}
                            hasNewMessage={hasNewMessage}
                            webhookStatus={webhookStatus}
                            currentUser={currentUser}
                            llmInitializing={llmInitializing}
                            llmConnected={llmConnected}
                            inputMessage={inputMessage}
                            selectedRecipient={selectedRecipient}
                            messagesEndRef={messagesEndRef}
                            onScrollToTop={handleScrollToTop}
                            onModeChangeToFax={handleModeChangeToFax}
                            onScrollToBottom={handleScrollToBottom}
                            onClearMessages={handleClearMessages}
                            onOpenSettings={handleOpenSettings}
                            onOpenUserSelector={handleOpenUserSelector}
                            onInputChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <FaxView
                            messages={messages}
                            isTyping={isTyping}
                            llmGenerating={llmGenerating}
                            hasNewMessage={hasNewMessage}
                            webhookStatus={webhookStatus}
                            currentUser={currentUser}
                            llmInitializing={llmInitializing}
                            llmConnected={llmConnected}
                            inputMessage={inputMessage}
                            selectedRecipient={selectedRecipient}
                            messagesEndRef={messagesEndRef}
                            onModeChangeToPager={handleModeChangeToPager}
                            onClearMessages={handleClearMessages}
                            onOpenSettings={handleOpenSettings}
                            onOpenUserSelector={handleOpenUserSelector}
                            onInputChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            onSendMessage={handleSendMessage}
                        />
                    )}
                </ErrorBoundary>
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

            <SettingsModal
                {...settingsModalProps}
                onClose={handleCloseSettings}
                setWebhookConfig={setWebhookConfig}
                onLogout={handleLogout}
                onSaveWebhookConfig={handleSaveWebhookConfig}
                onCopyWebhookUrl={handleCopyWebhookUrl}
            />

            {showUserSelector && (
                <UserSelector
                    users={availableUsers}
                    currentRecipient={selectedRecipient}
                    onSelectUser={handleSelectRecipient}
                    onClose={handleCloseUserSelector}
                />
            )}
        </div>
    );
}

export default App;
