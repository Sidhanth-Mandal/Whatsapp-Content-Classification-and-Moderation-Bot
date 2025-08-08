const fs = require('fs');
const path = require('path');

class UserStatsManager {
    constructor(dataFile = 'data/user_stats.json') {
        this.dataFile = dataFile;
        this.data = this.loadData();
        
        // Ensure data directory exists
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                console.log('User stats loaded successfully');
                return data;
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
        
        console.log('Creating new user stats file');
        return {};
    }

    saveData() {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving user stats:', error);
        }
    }

    initializeUser(userId) {
        if (!this.data[userId]) {
            this.data[userId] = {
                totalMessages: 0,
                categories: {
                    Funny: 0,
                    Plain: 0,
                    Helpful: 0,
                    Curious: 0
                },
                warnings: [],
                appreciations: []
            };
        }
    }

    updateMessageStats(userId, category) {
        this.initializeUser(userId);
        
        this.data[userId].totalMessages++;
        
        if (this.data[userId].categories.hasOwnProperty(category)) {
            this.data[userId].categories[category]++;
        }
        
        this.saveData();
        console.log(`Updated stats for ${userId}: ${category}`);
    }

    addWarning(userId, reason) {
        this.initializeUser(userId);
        
        const warning = {
            reason,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        this.data[userId].warnings.push(warning);
        this.saveData();
        
        console.log(`Added warning to ${userId}: ${reason}`);
        return warning;
    }

    removeWarning(userId) {
        this.initializeUser(userId);
        
        if (this.data[userId].warnings.length > 0) {
            const removedWarning = this.data[userId].warnings.pop();
            this.saveData();
            console.log(`Removed warning from ${userId}`);
            return removedWarning;
        }
        
        return null;
    }

    addAppreciation(userId, reason) {
        this.initializeUser(userId);
        
        const appreciation = {
            reason,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        this.data[userId].appreciations.push(appreciation);
        this.saveData();
        
        console.log(`Added appreciation to ${userId}: ${reason}`);
        return appreciation;
    }

    removeAppreciation(userId) {
        this.initializeUser(userId);
        
        if (this.data[userId].appreciations.length > 0) {
            const removedAppreciation = this.data[userId].appreciations.pop();
            this.saveData();
            console.log(`Removed appreciation from ${userId}`);
            return removedAppreciation;
        }
        
        return null;
    }

    getUserStats(userId) {
        this.initializeUser(userId);
        return this.data[userId];
    }

    getAllStats() {
        return this.data;
    }

    formatUserStats(userId, phoneNumber = null) {
        const stats = this.getUserStats(userId);
        const displayName = phoneNumber || userId.split('@')[0];
        
        return `📊 *Stats for ${displayName}*\n\n` +
               `📱 Total Messages: ${stats.totalMessages}\n\n` +
               `📈 *Message Categories:*\n` +
               `😄 Funny: ${stats.categories.Funny}\n` +
               `💬 Plain: ${stats.categories.Plain}\n` +
               `🤝 Helpful: ${stats.categories.Helpful}\n` +
               `🤔 Curious: ${stats.categories.Curious}\n\n` +
               `⚠️ Warnings: ${stats.warnings.length}\n` +
               `👏 Appreciations: ${stats.appreciations.length}`;
    }

    formatAllStats() {
        const allUsers = Object.keys(this.data);
        
        if (allUsers.length === 0) {
            return "📊 *All User Stats*\n\nNo users found.";
        }

        let statsText = "📊 *All User Stats*\n\n";
        
        // Create header
        statsText += "```\n";
        statsText += "User".padEnd(15) + " | " + 
                    "Msgs".padEnd(5) + " | " +
                    "F".padEnd(3) + " | " +
                    "P".padEnd(3) + " | " +
                    "H".padEnd(3) + " | " +
                    "C".padEnd(3) + " | " +
                    "W".padEnd(3) + " | " +
                    "A".padEnd(3) + "\n";
        statsText += "-".repeat(50) + "\n";
        
        // Add user data
        allUsers.forEach(userId => {
            const stats = this.data[userId];
            const displayName = userId.split('@')[0].substring(0, 14);
            
            statsText += displayName.padEnd(15) + " | " +
                        stats.totalMessages.toString().padEnd(5) + " | " +
                        stats.categories.Funny.toString().padEnd(3) + " | " +
                        stats.categories.Plain.toString().padEnd(3) + " | " +
                        stats.categories.Helpful.toString().padEnd(3) + " | " +
                        stats.categories.Curious.toString().padEnd(3) + " | " +
                        stats.warnings.length.toString().padEnd(3) + " | " +
                        stats.appreciations.length.toString().padEnd(3) + "\n";
        });
        
        statsText += "```\n\n";
        statsText += "*Legend:* F=Funny, P=Plain, H=Helpful, C=Curious, W=Warnings, A=Appreciations";
        
        return statsText;
    }

    getTopUsers(category = 'totalMessages', limit = 10) {
        const users = Object.keys(this.data);
        
        return users
            .map(userId => ({
                userId,
                value: category === 'totalMessages' 
                    ? this.data[userId].totalMessages 
                    : this.data[userId].categories[category] || 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, limit);
    }
}

module.exports = UserStatsManager;