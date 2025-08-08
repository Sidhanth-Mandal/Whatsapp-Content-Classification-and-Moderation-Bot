class CommandHandler {
    constructor(statsManager, groupManager) {
        this.statsManager = statsManager;
        this.groupManager = groupManager;
        this.commands = {
            // Group management commands (admin only)
            '/addgroup': this.handleAddGroupCommand.bind(this),
            '/removegroup': this.handleRemoveGroupCommand.bind(this),
            '/listgroups': this.handleListGroupsCommand.bind(this),
            
            // Moderation commands (admin only)
            '/warn': this.handleWarnCommand.bind(this),
            '/removewarn': this.handleRemoveWarnCommand.bind(this),
            '/appreciate': this.handleAppreciateCommand.bind(this),
            '/removeappreciation': this.handleRemoveAppreciationCommand.bind(this),
            '/stats': this.handleStatsCommand.bind(this),
            '/allstats': this.handleAllStatsCommand.bind(this),
            '/help': this.handleHelpCommand.bind(this)
        };
    }

    async handleCommand(sock, message, commandText, isAdmin) {
        const parts = commandText.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log(`Command received: ${command} from ${message.key.participant || message.key.remoteJid}`);

        if (!this.commands[command]) {
            await this.sendReply(sock, message, "❌ Unknown command. Use /help to see available commands.");
            return;
        }

        // Check admin permissions for admin-only commands
        const adminCommands = ['/warn', '/removewarn', '/appreciate', '/removeappreciation', '/addgroup', '/removegroup', '/listgroups','/stats','/allstats','/help`'];
        if (adminCommands.includes(command) && !isAdmin) {
            await this.sendReply(sock, message, "❌ This command requires admin permissions.");
            return;
        }

        try {
            await this.commands[command](sock, message, args);
        } catch (error) {
            console.error(`Error handling command ${command}:`, error);
            await this.sendReply(sock, message, "❌ An error occurred while processing the command.");
        }
    }

    async handleAddGroupCommand(sock, message, args) {
        const chatId = message.key.remoteJid;
        
        if (!chatId.endsWith('@g.us')) {
            await this.sendReply(sock, message, "❌ This command can only be used in groups.");
            return;
        }

        try {
            // Get group metadata to get the group name
            const groupMetadata = await sock.groupMetadata(chatId);
            const groupName = groupMetadata.subject;
            
            if (this.groupManager.isGroupEnabled(chatId)) {
                await this.sendReply(sock, message, "ℹ️ This group is already enabled for the bot.");
                return;
            }
            
            this.groupManager.addGroup(chatId, groupName);
            await this.sendReply(sock, message, 
                `✅ **Group Enabled Successfully!**\n\n` +
                `📝 Group: ${groupName}\n` +
                `🤖 The bot will now monitor and classify messages in this group.\n` +
                `📊 User statistics will be tracked.\n` +
                `🛡️ Offensive messages will be automatically moderated.`
            );
        } catch (error) {
            console.error('Error adding group:', error);
            await this.sendReply(sock, message, "❌ Error enabling group. Please try again.");
        }
    }

    async handleRemoveGroupCommand(sock, message, args) {
        const chatId = message.key.remoteJid;
        
        if (!chatId.endsWith('@g.us')) {
            await this.sendReply(sock, message, "❌ This command can only be used in groups.");
            return;
        }

        if (!this.groupManager.isGroupEnabled(chatId)) {
            await this.sendReply(sock, message, "ℹ️ This group is not currently enabled for the bot.");
            return;
        }

        const removed = this.groupManager.removeGroup(chatId);
        if (removed) {
            await this.sendReply(sock, message, 
                `✅ **Group Disabled Successfully!**\n\n` +
                `🚫 The bot will no longer monitor this group.\n` +
                `📊 Existing user statistics are preserved.\n` +
                `💡 Use /addgroup to re-enable the bot in this group.`
            );
        } else {
            await this.sendReply(sock, message, "❌ Error disabling group. Please try again.");
        }
    }

    async handleListGroupsCommand(sock, message, args) {
        const groupsList = this.groupManager.formatGroupsList();
        await this.sendReply(sock, message, groupsList);
    }

    async handleWarnCommand(sock, message, args) {
        if (args.length < 1) {
            await this.sendReply(sock, message, "Usage: /warn @user [reason]");
            return;
        }

        const mentionedJid = this.extractMentionedUser(message);
        if (!mentionedJid) {
            await this.sendReply(sock, message, "❌ Please mention a user to warn.");
            return;
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';
        const warning = this.statsManager.addWarning(mentionedJid, `Manual warning: ${reason}`);
        
        const userStats = this.statsManager.getUserStats(mentionedJid);
        await this.sendReply(sock, message, 
            `⚠️ Warning given to user.\nReason: ${reason}\nTotal warnings: ${userStats.warnings.length}`
        );
    }

    async handleRemoveWarnCommand(sock, message, args) {
        const mentionedJid = this.extractMentionedUser(message);
        if (!mentionedJid) {
            await this.sendReply(sock, message, "❌ Please mention a user to remove warning from.");
            return;
        }

        const removedWarning = this.statsManager.removeWarning(mentionedJid);
        if (removedWarning) {
            const userStats = this.statsManager.getUserStats(mentionedJid);
            await this.sendReply(sock, message, 
                `✅ Warning removed from user.\nRemaining warnings: ${userStats.warnings.length}`
            );
        } else {
            await this.sendReply(sock, message, "❌ No warnings found for this user.");
        }
    }

    async handleAppreciateCommand(sock, message, args) {
        if (args.length < 1) {
            await this.sendReply(sock, message, "Usage: /appreciate @user [reason]");
            return;
        }

        const mentionedJid = this.extractMentionedUser(message);
        if (!mentionedJid) {
            await this.sendReply(sock, message, "❌ Please mention a user to appreciate.");
            return;
        }

        const reason = args.slice(1).join(' ') || 'Great contribution!';
        const appreciation = this.statsManager.addAppreciation(mentionedJid, reason);
        
        const userStats = this.statsManager.getUserStats(mentionedJid);
        await this.sendReply(sock, message, 
            `👏 Appreciation given to user!\nReason: ${reason}\nTotal appreciations: ${userStats.appreciations.length}`
        );
    }

    async handleRemoveAppreciationCommand(sock, message, args) {
        const mentionedJid = this.extractMentionedUser(message);
        if (!mentionedJid) {
            await this.sendReply(sock, message, "❌ Please mention a user to remove appreciation from.");
            return;
        }

        const removedAppreciation = this.statsManager.removeAppreciation(mentionedJid);
        if (removedAppreciation) {
            const userStats = this.statsManager.getUserStats(mentionedJid);
            await this.sendReply(sock, message, 
                `✅ Appreciation removed from user.\nRemaining appreciations: ${userStats.appreciations.length}`
            );
        } else {
            await this.sendReply(sock, message, "❌ No appreciations found for this user.");
        }
    }

    async handleStatsCommand(sock, message, args) {
        let targetUserId;
        
        // Check if a user is mentioned
        const mentionedJid = this.extractMentionedUser(message);
        if (mentionedJid) {
            targetUserId = mentionedJid;
        } else {
            // Show stats for the command sender
            targetUserId = message.key.participant || message.key.remoteJid;
        }

        const statsText = this.statsManager.formatUserStats(targetUserId);
        await this.sendReply(sock, message, statsText);
    }

    async handleAllStatsCommand(sock, message, args) {
        const statsText = this.statsManager.formatAllStats();
        await this.sendReply(sock, message, statsText);
    }

    async handleHelpCommand(sock, message, args) {
        const helpText = `🤖 *WhatsApp Bot Commands*\n\n` +
                        `*Group Management (Admin):*\n` +
                        `/addgroup - Enable bot in current group\n` +
                        `/removegroup - Disable bot in current group\n` +
                        `/listgroups - List all enabled groups\n\n` +
                        `*Moderation Commands (Admin):*\n` +
                        `/warn @user [reason] - Give a manual warning\n` +
                        `/removewarn @user - Remove a warning\n` +
                        `/appreciate @user [reason] - Give appreciation\n` +
                        `/removeappreciation @user - Remove appreciation\n\n` +
                        `*Stats Commands (Everyone):*\n` +
                        `/stats [@user] - Show stats (your own or mentioned user)\n` +
                        `/allstats - Show all users' stats table\n` +
                        `/help - Show this help message\n\n` +
                        `*Auto Features:*\n` +
                        `• Bot only works in enabled groups\n` +
                        `• Messages are automatically classified\n` +
                        `• Offensive messages are auto-deleted with warning\n` +
                        `• Stats are tracked for all message types\n\n` +
                        `*Note:* Bot must be enabled in a group using /addgroup before it will monitor messages.`;

        await this.sendReply(sock, message, helpText);
    }

    extractMentionedUser(message) {
        // Check for mentioned users in the message
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            return message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        
        // Fallback: extract from quoted message if replying
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return message.message.extendedTextMessage.contextInfo.participant;
        }
        
        return null;
    }

    async sendReply(sock, message, text) {
        try {
            await sock.sendMessage(message.key.remoteJid, { 
                text: text,
                quoted: message 
            });
        } catch (error) {
            console.error('Error sending reply:', error);
        }
    }
}

module.exports = CommandHandler;