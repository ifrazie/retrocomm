# Product Overview

**Retro Messenger** is a nostalgic web application that reimagines modern messaging through the lens of 1980s-90s technology. It combines contemporary features like webhooks, AI chatbots, and end-to-end encryption with authentic retro aesthetics.

## Core Concept

Transform everyday messaging into an immersive experience that feels like using a classic pager or fax machine, while maintaining full modern functionality including:
- Real-time multi-user messaging
- AI-powered chatbot responses (via LM Studio)
- Webhook integration for external services
- End-to-end encryption (RSA-2048 + AES-256-GCM)
- Password-protected user accounts

## Key Features

### Dual Interface Modes
- **Pager Mode**: Green-on-black LCD display with physical button controls, shows last 5 messages
- **Fax Mode**: Thermal fax machine interface with dot-matrix styling and full message history

### Security & Authentication
- Zero-knowledge architecture - server never sees decrypted messages
- bcrypt password hashing with 10 rounds
- RSA-2048 public key infrastructure for secure key exchange
- AES-256-GCM encryption for message content
- PBKDF2 key derivation (100k iterations) for private key protection

### AI Integration
- LM Studio integration for intelligent, context-aware conversations
- Automatic fallback to simulated responses when offline
- Mode-specific AI personality (adapts to pager/fax context)
- Maintains conversation history for multi-turn dialogues

### Webhook System
- Configurable outgoing webhook endpoints
- Bearer token authentication support
- Unique incoming webhook URLs per session
- Visual transmission status indicators

## Target Audience

- Developers interested in retro-themed applications
- Users nostalgic for vintage technology
- Hackathon participants (Kiroween 2025 submission)
- Anyone seeking a unique messaging experience

## Design Philosophy

Combine cutting-edge technology (E2EE, LLMs, webhooks) with nostalgic aesthetics to create engaging, memorable user experiences that spark joy while maintaining modern security and functionality standards.
