const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const MessageClassifier = require('./src/messageClassifier');
const UserStatsManager = require('./src/userStatsManager');
const CommandHandler = require('./src/commandHandler');
const MessageQueue = require('./src/messageQueue');
const GroupManager = require('./src/groupManager');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.classifier = new MessageClassifier();
        this.statsManager = new UserStatsManager();
        this.groupManager = new GroupManager();
        this.commandHandler = new CommandHandler(this.statsManager, this.groupManager);
        this.messageQueue = new MessageQueue(this.classifier, 1200); // 1.2 second delay
        
        this.setupMessageQueue();
    }

    setupMessageQueue() {
        // Handle classification results from the queue
        this.messageQueue.on('classified', async (data) => {
            const { messageData, classification } = data;
            await this.handleClassification(messageData, classification);
        });

        this.messageQueue.on('error', (error) => {
            console.error('Message queue error:', error);
        });
    }

    async start() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
            
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: true,
                logger: pino({ level: 'silent' }),
                browser: ['WhatsApp Bot', 'Chrome', '1.0.0']
            });

            this.sock.ev.on('creds.update', saveCreds);
            this.sock.ev.on('connection.update', this.handleConnectionUpdate.bind(this));
            this.sock.ev.on('messages.upsert', this.handleMessages.bind(this));

            console.log('WhatsApp bot started successfully!');
        } catch (error) {
            console.error('Error starting bot:', error);
        }
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n--- Scan QR Code ---');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            
            if (shouldReconnect) {
                this.start();
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        }
    }

    async handleMessages(m) {
        const message = m.messages[0];
        if (!message || message.key.fromMe) return;

        const messageContent = this.extractMessageContent(message);
        if (!messageContent) return;

        const sender = message.key.remoteJid;
        const senderId = message.key.participant || sender;
        const isGroup = sender.endsWith('@g.us');

        console.log(`📨 Message received: "${messageContent}" from ${senderId} in ${isGroup ? 'group' : 'private'}: ${sender}`);

        // Only process messages from enabled groups or direct messages for group management commands
        if (isGroup && !this.groupManager.isGroupEnabled(sender)) {
            console.log(`🚫 Group not enabled: ${sender}`);
            // Check if it's a group management command
            if (messageContent.startsWith('/addgroup') || messageContent.startsWith('/enable') || 
                messageContent.startsWith('/removegroup') || messageContent.startsWith('/disable') || 
                messageContent.startsWith('/listgroups')) {
                console.log(`🔧 Processing group management command: ${messageContent}`);
                const isAdmin = await this.checkIfAdmin(senderId, sender);
                console.log(`👤 User ${senderId} is admin: ${isAdmin}`);
                await this.commandHandler.handleCommand(this.sock, message, messageContent, isAdmin);
            }
            return; // Ignore all other messages in non-enabled groups
        }

        // Check if it's a command
        if (messageContent.startsWith('/')) {
            console.log(`⚡ Processing command: ${messageContent}`);
            const isAdmin = await this.checkIfAdmin(senderId, sender);
            console.log(`👤 User ${senderId} is admin: ${isAdmin}`);
            await this.commandHandler.handleCommand(this.sock, message, messageContent, isAdmin);
            return;
        }

        // For direct messages, only process group management commands
        if (!isGroup) {
            console.log(`💬 Ignoring direct message: ${messageContent}`);
            return;
        }

        console.log(`✅ Adding message to classification queue: ${messageContent.substring(0, 50)}...`);

        // Add message to classification queue
        const messageData = {
            content: messageContent,
            sender: senderId,
            chatId: sender,
            messageId: message.key.id,
            isGroup,
            message
        };

        this.messageQueue.addMessage(messageData);
    }

    async handleClassification(messageData, classification) {
        const { content, sender, chatId, messageId, isGroup, message } = messageData;

        if (classification === 'Super Offensive') {
            await this.handleOffensiveMessage(message, sender, chatId);
            return;
        }

        // Update user stats for non-offensive messages
        this.statsManager.updateMessageStats(sender, classification);
    }

    async handleOffensiveMessage(message, sender, chatId) {
        try {
            // Delete the message
            await this.sock.sendMessage(chatId, { delete: message.key });
            
            // Add warning to user
            this.statsManager.addWarning(sender, 'Automated: Offensive message detected');
            
            // Send warning message
            const warningText = `⚠️ Warning: Your message was deleted for being offensive. This is an automated warning.`;
            await this.sock.sendMessage(chatId, { text: warningText });
            
            console.log(`Deleted offensive message from ${sender}`);
        } catch (error) {
            console.error('Error handling offensive message:', error);
        }
    }

    extractMessageContent(message) {
        if (message.message?.conversation) {
            return message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            return message.message.extendedTextMessage.text;
        }
        return null;
    }

    async checkIfAdmin(userId, chatId) {
        try {
            if (!chatId.endsWith('@g.us')) return false; // Not a group
            
            const groupMetadata = await this.sock.groupMetadata(chatId);
            const participant = groupMetadata.participants.find(p => p.id === userId);
            
            return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
}

// Start the bot
const bot = new WhatsAppBot();
bot.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down bot...');
    process.exit(0);
});