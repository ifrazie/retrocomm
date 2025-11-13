/**
 * Example: Using the LLM Chatbot Service
 * 
 * This example demonstrates how to use the LLMChatbotService
 * to generate AI responses in your application.
 */

import { llmChatbot } from '../src/services/LLMChatbotService.js';

async function main() {
  console.log('🤖 LLM Chatbot Example\n');
  
  // Step 1: Connect to LM Studio
  console.log('Connecting to LM Studio...');
  const connected = await llmChatbot.connect();
  
  if (!connected) {
    console.log('❌ Failed to connect to LM Studio');
    console.log('Make sure LM Studio is running and a model is loaded.');
    console.log('Falling back to simulated responses...\n');
  } else {
    console.log('✅ Connected to LM Studio\n');
  }
  
  // Step 2: Set the mode (pager or fax)
  console.log('Setting mode to PAGER...');
  llmChatbot.setMode('pager');
  
  // Step 3: Generate responses
  console.log('\n--- Example Conversations ---\n');
  
  const messages = [
    'Hello! What time is it?',
    'Can you give me a status report?',
    'HELP',
    'Tell me about this device'
  ];
  
  for (const message of messages) {
    console.log(`👤 User: ${message}`);
    const response = await llmChatbot.generateResponse(message);
    console.log(`🤖 Bot: ${response}\n`);
  }
  
  // Step 4: Switch to fax mode
  console.log('--- Switching to FAX mode ---\n');
  llmChatbot.setMode('fax');
  
  const faxMessage = 'Send me a transmission report';
  console.log(`👤 User: ${faxMessage}`);
  const faxResponse = await llmChatbot.generateResponse(faxMessage);
  console.log(`🤖 Bot: ${faxResponse}\n`);
  
  // Step 5: Check connection status
  console.log(`Connection Status: ${llmChatbot.isLLMConnected() ? 'ONLINE' : 'OFFLINE'}`);
  
  // Step 6: Clear history
  console.log('Clearing conversation history...');
  llmChatbot.clearHistory();
  console.log('✅ History cleared\n');
  
  console.log('Example complete!');
}

// Run the example
main().catch(console.error);
