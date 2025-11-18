// Message types
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date | string;
  status?: 'sending' | 'delivered' | 'failed' | 'read';
  webhookId?: string;
  type?: 'message' | 'system';
  images?: string[];
}

// Webhook types
export interface WebhookPayload {
  sender: string;
  content: string;
  timestamp: string;
  type: string;
}

export interface WebhookStatus {
  id: string;
  timestamp: string;
  status: 'pending' | 'sending' | 'delivered' | 'failed' | 'retrying';
  payload: WebhookPayload;
  endpoint: string;
  attempts: number;
  deliveredAt?: string;
}

export interface WebhookResult {
  success: boolean;
  webhook: WebhookStatus;
  message: string;
}

// Chatbot types
export interface ChatMessage {
  role: 'user' | 'chatbot' | 'system';
  content: string;
  timestamp: string | Date;
}

export interface ChatbotResponse {
  content: string;
  timestamp: string;
}

// Config types
export interface WebhookConfig {
  enabled: boolean;
  endpoint: string;
  authToken?: string;
  retryAttempts: number;
  timeout: number;
}

// Component prop types
export interface MessageDisplayProps {
  messages: Message[];
  mode: 'pager' | 'fax';
}

export interface StatusIndicatorProps {
  status: 'idle' | 'sending' | 'delivered' | 'failed';
  webhookId?: string;
}

// Mode types
export type InterfaceMode = 'pager' | 'fax';

// Connection status
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
