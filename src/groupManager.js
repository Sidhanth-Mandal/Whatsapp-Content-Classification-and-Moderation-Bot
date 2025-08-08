const fs = require('fs');
const path = require('path');

class GroupManager {
    constructor(dataFile = 'data/enabled_groups.json') {
        this.dataFile = dataFile;
        this.enabledGroups = this.loadEnabledGroups();
        
        // Ensure data directory exists
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    loadEnabledGroups() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                console.log(`Loaded ${Object.keys(data).length} enabled groups`);
                return data;
            }
        } catch (error) {
            console.error('Error loading enabled groups:', error);
        }
        
        console.log('Creating new enabled groups file');
        return {};
    }

    saveEnabledGroups() {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.enabledGroups, null, 2));
        } catch (error) {
            console.error('Error saving enabled groups:', error);
        }
    }

    addGroup(groupId, groupName = null) {
        this.enabledGroups[groupId] = {
            name: groupName || 'Unknown Group',
            addedAt: new Date().toISOString(),
            addedBy: 'System'
        };
        
        this.saveEnabledGroups();
        console.log(`Added group to enabled list: ${groupId}`);
        return true;
    }

    removeGroup(groupId) {
        if (this.enabledGroups[groupId]) {
            delete this.enabledGroups[groupId];
            this.saveEnabledGroups();
            console.log(`Removed group from enabled list: ${groupId}`);
            return true;
        }
        return false;
    }

    isGroupEnabled(groupId) {
        return this.enabledGroups.hasOwnProperty(groupId);
    }

    getEnabledGroups() {
        return this.enabledGroups;
    }

    getGroupCount() {
        return Object.keys(this.enabledGroups).length;
    }

    formatGroupsList() {
        const groups = Object.keys(this.enabledGroups);
        
        if (groups.length === 0) {
            return "📋 *Enabled Groups*\n\nNo groups are currently enabled.";
        }

        let groupsList = "📋 *Enabled Groups*\n\n";
        
        groups.forEach((groupId, index) => {
            const group = this.enabledGroups[groupId];
            groupsList += `${index + 1}. **${group.name}**\n`;
            groupsList += `   ID: \`${groupId}\`\n`;
            groupsList += `   Added: ${new Date(group.addedAt).toLocaleDateString()}\n\n`;
        });
        
        groupsList += `*Total: ${groups.length} enabled groups*`;
        
        return groupsList;
    }

    updateGroupName(groupId, newName) {
        if (this.enabledGroups[groupId]) {
            this.enabledGroups[groupId].name = newName;
            this.saveEnabledGroups();
            return true;
        }
        return false;
    }
}

module.exports = GroupManager;