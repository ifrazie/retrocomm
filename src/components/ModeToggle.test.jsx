import React from 'react';
import { MessageProvider } from '../contexts/MessageContext.jsx';
import { ConfigProvider } from '../contexts/ConfigContext.jsx';
import ModeToggle from './ModeToggle.jsx';

/**
 * Test component to verify message history preservation across mode switches
 * This component demonstrates that MessageContext maintains messages independently
 * of the mode preference in ConfigContext
 */
const ModeToggleTest = () => {
  return (
    <ConfigProvider>
      <MessageProvider>
        <div style={{ padding: '20px' }}>
          <h2>Mode Toggle Test</h2>
          <p>This test verifies that:</p>
          <ul>
            <li>Mode can be switched between pager and fax</li>
            <li>Mode preference persists to LocalStorage</li>
            <li>MessageContext maintains messages across mode switches</li>
          </ul>
          
          <div style={{ marginTop: '20px' }}>
            <ModeToggle />
          </div>
          
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
            <h3>Test Instructions:</h3>
            <ol>
              <li>Toggle between pager and fax modes</li>
              <li>Verify the slider animates smoothly (500ms transition)</li>
              <li>Check browser LocalStorage for 'retro_messenger_config'</li>
              <li>Verify preferences.mode updates correctly</li>
              <li>Reload the page and verify mode persists</li>
            </ol>
          </div>
        </div>
      </MessageProvider>
    </ConfigProvider>
  );
};

export default ModeToggleTest;
