import React, { useEffect } from 'react';
import { MessageProvider, useMessages } from './contexts/MessageContext.jsx';
import { ConfigProvider, useConfig } from './contexts/ConfigContext.jsx';
import ModeToggle from './components/ModeToggle.jsx';

/**
 * Inner component that demonstrates message history preservation
 */
const MessageHistoryDemo = () => {
  const { messages, addMessage } = useMessages();
  const { preferences } = useConfig();

  useEffect(() => {
    // Add a test message on mount if no messages exist
    if (messages.length === 0) {
      addMessage({
        id: '1',
        content: 'Test message - this should persist across mode switches',
        timestamp: Date.now(),
        sender: 'System'
      });
    }
  }, []);

  const _handleAddMessage = () => {
    addMessage({
      id: Date.now().toString(),
      content: `Message added in ${preferences.mode} mode at ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      sender: 'User'
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Message History Preservation Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Mode: {preferences.mode}</h3>
        <ModeToggle />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={_handleAddMessage}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            background: '#00ff00',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Add Test Message
        </button>
      </div>

      <div style={{ 
        padding: '15px', 
        background: '#1a1a1a', 
        color: '#00ff00',
        borderRadius: '4px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ color: '#00ff00', marginTop: 0 }}>
          Message History ({messages.length} messages)
        </h3>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {messages.map((msg) => (
              <li key={msg.id} style={{ marginBottom: '10px', padding: '5px', background: '#0a0a0a' }}>
                <strong>[{new Date(msg.timestamp).toLocaleTimeString()}]</strong> {msg.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f0f0f0',
        borderRadius: '4px'
      }}>
        <h3>Verification Steps:</h3>
        <ol>
          <li>✅ Add messages using the button above</li>
          <li>✅ Switch between pager and fax modes using the toggle</li>
          <li>✅ Verify messages remain visible after mode switch</li>
          <li>✅ Reload the page and verify messages persist</li>
          <li>✅ Check that mode preference also persists after reload</li>
        </ol>
        <p><strong>Expected Result:</strong> Messages should remain in the list regardless of which mode is active, proving that MessageContext maintains state independently of ConfigContext mode preference.</p>
      </div>
    </div>
  );
};

/**
 * App test component with providers
 */
const AppTest = () => {
  return (
    <ConfigProvider>
      <MessageProvider>
        <MessageHistoryDemo />
      </MessageProvider>
    </ConfigProvider>
  );
};

export default AppTest;
