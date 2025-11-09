# 🤖 WhatsApp Group Moderation Bot

A sophisticated WhatsApp bot built with Baileys that automatically classifies messages using AI (Qwen via Groq API), manages user statistics, and provides comprehensive admin commands for group moderation. The bot operates only in groups that are explicitly enabled by admins, ensuring privacy and control.

![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)
![Baileys](https://img.shields.io/badge/Baileys-6.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Commands](#-commands)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [API Integration](#-api-integration)

---

## ✨ Features

### 🔐 Group Management System
- **Selective Operation**: Bot only works in groups you explicitly enable
- **Admin Control**: Only group admins can enable/disable the bot
- **Easy Commands**: Simple `/enable` and `/disable` commands
- **Persistent Configuration**: Enabled groups survive bot restarts
- **Group Tracking**: View list of all enabled groups with `/listgroups`

### 🤖 AI-Powered Message Classification
- **5 Categories**: Funny, Plain, Helpful, Curious, Super Offensive
- **Powered by Qwen**: Uses advanced language models via Groq API
- **Automatic Moderation**: Offensive messages are deleted instantly
- **Smart Rate Limiting**: 1.2-second delay between API calls (60 req/min)
- **Fallback Handling**: Graceful error handling for API issues

### 📊 Comprehensive User Statistics
- **Message Tracking**: Total message count per user
- **Category Breakdown**: Detailed stats for each message type
- **Warning System**: Track user infractions with reasons
- **Appreciation System**: Recognize positive contributions
- **Persistent Storage**: All data saved in JSON format
- **Real-time Updates**: Stats update automatically with each message

### 🛡️ Admin Moderation Tools
- **Manual Warnings**: Give warnings with custom reasons
- **Warning Management**: Remove warnings when appropriate
- **Appreciation System**: Reward helpful users
- **User Mentions**: Tag users in commands with @mentions
- **Detailed Stats**: View comprehensive user profiles

### 📈 Statistics & Reporting
- **Individual Stats**: View detailed stats for any user
- **Group Overview**: See all users' stats in a formatted table
- **Historical Data**: Track user behavior over time
- **Export Ready**: Data stored in accessible JSON format

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **WhatsApp Account** - For the bot to connect
- **Groq API Key** - Get free API key from [Groq](https://groq.com)

**System Requirements:**
- Windows, macOS, or Linux
- At least 512MB RAM
- Stable internet connection
- Terminal/Command Prompt access

---

## 📥 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/whatsapp-moderation-bot.git
cd whatsapp-moderation-bot
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `@whiskeysockets/baileys` - WhatsApp Web API
- `@hapi/boom` - Error handling
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management
- `pino` - Logging
- `qrcode-terminal` - QR code display

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
BOT_NAME=WhatsApp Moderator Bot
DEBUG=false
```

**Getting Groq API Key:**
1. Visit [groq.com](https://groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into `.env` file

### Step 4: Create Data Directory

```bash
mkdir data
```

This directory will store:
- `user_stats.json` - User statistics
- `enabled_groups.json` - List of enabled groups

---

## 🚀 Usage

### Starting the Bot

**Option 1: Direct Start**
```bash
npm start
```

### First Time Setup

1. **Run the bot** - A QR code will appear in the terminal
2. **Open WhatsApp** on your phone
3. **Scan QR Code**:
   - Go to WhatsApp Settings
   - Tap "Linked Devices"
   - Tap "Link a Device"
   - Scan the QR code from terminal
4. **Wait for connection** - You'll see "Connected to WhatsApp!"

### Enabling Bot in a Group

1. **Add the bot's number to your WhatsApp group**
2. **Make sure you're a group admin**
3. **In the group, send:** `/enable`
4. **Bot responds:** "✅ Group Enabled Successfully!"
5. **The bot is now active** in this group

That's it! The bot will now:
- Monitor all messages in the group
- Classify messages automatically
- Track user statistics
- Delete offensive content
- Respond to commands

---

## 📝 Commands

### 🔐 Group Management Commands (Admin Only)

| Command | Alias | Description | Example |
|---------|-------|-------------|---------|
| `/addgroup` | `/enable` | Enable bot in current group | `/enable` |
| `/removegroup` | `/disable` | Disable bot in current group | `/disable` |
| `/listgroups` | - | Show all enabled groups | `/listgroups` |

### 🛡️ Moderation Commands (Admin Only)

| Command | Description | Example |
|---------|-------------|---------|
| `/warn @user [reason]` | Give a manual warning | `/warn @john Inappropriate language` |
| `/removewarn @user` | Remove a warning | `/removewarn @john` |
| `/appreciate @user [reason]` | Give appreciation | `/appreciate @sarah Great help!` |
| `/removeappreciation @user` | Remove appreciation | `/removeappreciation @sarah` |

### 📊 Statistics Commands (Everyone)

| Command | Description | Example |
|---------|-------------|---------|
| `/stats` | View your own stats | `/stats` |
| `/stats @user` | View another user's stats | `/stats @john` |
| `/allstats` | View all users' stats table | `/allstats` |
| `/help` | Show help message | `/help` |

### 📋 Command Examples

**Enable bot in group:**
```
User: /enable
Bot: ✅ Group Enabled Successfully!
     📝 Group: Tech Enthusiasts
     🤖 The bot will now monitor and classify messages
```

**Warn a user:**
```
Admin: /warn @john Using offensive language
Bot: ⚠️ Warning given to user.
     Reason: Using offensive language
     Total warnings: 1
```

**View user stats:**
```
User: /stats @john
Bot: 📊 Stats for John Doe
     📱 Total Messages: 156
     📈 Message Categories:
     😄 Funny: 45
     💬 Plain: 89
     🤝 Helpful: 18
     🤔 Curious: 4
     ⚠️ Warnings: 1
     👏 Appreciations: 3
```

**View all stats:**
```
User: /allstats
Bot: 📊 All User Stats
     User            | Msgs  | F   | P   | H   | C   | W   | A
     ---------------------------------------------------------------
     John            | 156   | 45  | 89  | 18  | 4   | 1   | 3
     Sarah           | 203   | 67  | 120 | 12  | 4   | 0   | 5
     Mike            | 89    | 23  | 50  | 10  | 6   | 0   | 2
```

---

## 🔄 How It Works

### Architecture Overview

```
┌─────────────────┐
│  WhatsApp User  │
└────────┬────────┘
         │ Sends Message
         ▼
┌─────────────────┐
│   Baileys API   │ ◄── Receives message via WebSocket
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Main Bot      │ ◄── Checks if group is enabled
└────────┬────────┘
         │
         ├─── If Command ───────┐
         │                      │
         │                      ▼
         │            ┌──────────────────┐
         │            │ Command Handler  │
         │            └──────────────────┘
         │
         ├─── If Regular Message ┐
         │                       │
         │                       ▼
         │            ┌──────────────────┐
         │            │  Message Queue   │ ◄── Rate limiting (1.2s)
         │            └─────────┬────────┘
         │                      │
         │                      ▼
         │            ┌──────────────────┐
         │            │   Groq API       │ ◄── AI Classification
         │            └─────────┬────────┘
         │                      │
         │                      ▼
         │            ┌──────────────────┐
         │            │ Classification   │
         │            │    Handler       │
         │            └─────────┬────────┘
         │                      │
         ├──────────────────────┘
         │
         ▼
┌─────────────────┐
│  Stats Manager  │ ◄── Updates user statistics
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   JSON Files    │ ◄── Persistent storage
└─────────────────┘
```

### Message Processing Flow

1. **Message Received** → Bot receives message via Baileys
2. **Group Check** → Verify if group is enabled
3. **Command Detection** → Check if message starts with `/`
4. **If Command:**
   - Admin verification
   - Command execution
   - Response sent
5. **If Regular Message:**
   - Add to processing queue
   - Wait for rate limit (1.2s)
   - Send to Groq API
   - Classify message
   - Update statistics
   - If offensive: Delete & warn user

### Rate Limiting System

The bot implements intelligent rate limiting to respect Groq's API limits:

- **Queue-based processing**: Messages queued for sequential handling
- **1.2-second delays**: Between each API call
- **60 requests/minute**: Compliant with Groq limits
- **No message loss**: All messages processed eventually
- **Status logging**: Queue status visible in console

### AI Classification Process

```javascript
User Message → Groq API → Qwen Model → Classification Result

Categories:
├── Funny: Jokes, memes, humor
├── Plain: Normal conversation
├── Helpful: Advice, assistance
├── Curious: Questions, seeking info
└── Super Offensive: Hate speech, threats
```

---

## 📁 Project Structure

```
whatsapp-moderation-bot/
│
├── 📄 index.js                    # Main bot entry point
│
├── 📁 src/                        # Source code directory
│   ├── messageClassifier.js      # AI classification via Groq API
│   ├── messageQueue.js           # Rate-limited message processing
│   ├── userStatsManager.js       # User statistics management
│   ├── commandHandler.js         # Command processing logic
│   └── groupManager.js           # Group enable/disable management
│
├── 📁 data/                       # Data storage (auto-created)
│   ├── user_stats.json           # User statistics database
│   └── enabled_groups.json       # Enabled groups configuration
│
├── 📁 auth_info_baileys/          # WhatsApp session (auto-created)
│   ├── creds.json                # Authentication credentials
│   └── ...                       # Other session files
│
├── 📄 package.json               # Node.js dependencies
├── 📄 package-lock.json          # Dependency lock file
├── 📄 .env                       # Environment variables (create this)
├── 📄 .gitignore                 # Git ignore rules
└── 📄 README.md                  # This file
```

### File Descriptions

**Core Files:**
- `index.js` - Main bot orchestration and message handling
- `package.json` - Project dependencies and scripts

**Source Modules:**
- `messageClassifier.js` - Integrates with Groq API for AI classification
- `messageQueue.js` - Manages rate-limited message processing
- `userStatsManager.js` - Handles user data and statistics
- `commandHandler.js` - Processes all bot commands
- `groupManager.js` - Manages enabled/disabled groups

**Data Files:**
- `user_stats.json` - Stores all user statistics
- `enabled_groups.json` - Lists active groups
- `auth_info_baileys/` - WhatsApp session data

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. QR Code Not Appearing

**Problem:** Terminal doesn't show QR code after starting bot

**Solutions:**
```bash
# Check if terminal supports Unicode
echo $TERM

# Try different terminal:
# - Windows: Use Windows Terminal or Git Bash
# - macOS: Use default Terminal or iTerm2
# - Linux: Use Gnome Terminal or Konsole

# Check Node.js version
node --version  # Should be v16+
```

#### 2. Bot Not Receiving Messages

**Problem:** Commands like `/enable` don't work

**Symptoms:**
- No console logs when sending messages
- Bot shows "Connected" but doesn't respond

**Solutions:**

**Check 1: Verify Connection**
```bash
# Look for this in console:
"Connected to WhatsApp!"
"Event listeners registered"
```

**Check 2: Send Test Message**
- Send "hello" in the group
- Check console for logs starting with 📥 or 📨
- If no logs appear, session might be invalid

**Check 3: Restart Bot**
```bash
# Stop bot (Ctrl+C)
# Delete session
rm -rf auth_info_baileys/

# Restart and scan QR again
npm start
```

**Check 4: Enable Debug Logs**
```bash
# Edit .env file
DEBUG=true

# Restart bot
npm start
```

#### 3. API Rate Limiting Errors

**Problem:** Too many API requests

**Symptoms:**
```
Error classifying message: 429 Too Many Requests
```

**Solutions:**
```javascript
// Increase delay in index.js (line ~17)
this.messageQueue = new MessageQueue(this.classifier, 2000); // 2 seconds

// Or reduce message volume in busy groups
```

#### 4. Permission Errors

**Problem:** "This command requires admin permissions"

**Causes:**
- You're not a group admin
- Bot can't verify admin status

**Solutions:**
1. Make yourself group admin
2. Check bot's WhatsApp account status
3. Re-add bot to group

#### 5. Classification Not Working

**Problem:** Messages not being classified

**Check:**
```bash
# Verify API key in .env
cat .env | grep GROQ_API_KEY

# Test API key manually
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.groq.com/openai/v1/models
```

**Solutions:**
1. Verify API key is correct
2. Check Groq API status
3. Review console logs for errors

#### 6. Data Not Persisting

**Problem:** Stats reset after bot restart

**Check:**
```bash
# Verify data directory exists
ls -la data/

# Check file permissions
ls -l data/user_stats.json

# Verify files are being written
tail -f data/user_stats.json
```

**Solutions:**
```bash
# Create data directory if missing
mkdir -p data

# Fix permissions
chmod 755 data/
chmod 644 data/*.json
```

#### 7. Memory Issues

**Problem:** Bot crashes with "Out of Memory"

**Solutions:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 index.js

# Or update package.json scripts:
"start": "node --max-old-space-size=4096 index.js"
```

### Debug Mode

Enable comprehensive logging:

```bash
# Edit .env
DEBUG=true

# Restart bot
npm start
```

You'll see detailed logs:
```
📥 Raw message event received
📝 Message object: {...}
🔍 Extracting content from message structure
✅ Found conversation message
📨 Processing message: "/enable"
👤 From: 1234567890@s.whatsapp.net
📍 Chat: 5678901234@g.us
👥 Is Group: true
🔧 Processing group management command
```

### Getting Help

If you're still experiencing issues:

1. **Check Console Logs** - Most errors are logged
2. **Review This Guide** - Most issues covered here
3. **GitHub Issues** - Search existing issues or create new one
4. **Groq Documentation** - For API-specific problems
5. **Baileys Documentation** - For WhatsApp API issues

---

## 🔌 API Integration

### Groq API Configuration

The bot uses Groq's inference API for fast AI processing:

**API Details:**
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Model**: `llama-3.1-8b-instant`
- **Rate Limit**: 60 requests per minute (free tier)
- **Response Time**: ~200-500ms per request

**Configuration in Code:**

```javascript
// src/messageClassifier.js
const response = await axios.post(this.apiUrl, {
    model: 'llama-3.1-8b-instant',
    messages: [
        {
            role: 'system',
            content: 'You are a message classifier...'
        },
        {
            role: 'user',
            content: prompt
        }
    ],
    max_tokens: 10,
    temperature: 0.1
});
```

### Classification Prompt

The bot uses a carefully designed prompt for accurate classification:

```
Classify the following message into one of these categories:

Categories:
- Funny: Jokes, memes, humorous content, funny observations
- Plain: Normal conversation, neutral statements, everyday chat
- Helpful: Advice, assistance, informative content, solutions
- Curious: Questions, expressions of wonder, seeking information
- Super Offensive: Hate speech, severe profanity, threats, harassment

Message to classify: "user message here"

Respond with ONLY the category name.
```

### Customizing Classification

To modify classification behavior:

1. **Edit categories** in `src/messageClassifier.js`:
```javascript
const validCategories = ['Funny', 'Plain', 'Helpful', 'Curious', 'Super Offensive'];
```

2. **Adjust prompt** in `buildClassificationPrompt()` method

3. **Change model** if needed:
```javascript
model: 'llama-3.1-70b-versatile', // More powerful model
```

---

## ⚙️ Configuration

### Environment Variables

All configuration in `.env` file:

```env
# Required
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Optional
BOT_NAME=My WhatsApp Bot
DEBUG=false
```

### Customization Options

**1. Rate Limiting:**
```javascript
// index.js - Line 17
this.messageQueue = new MessageQueue(this.classifier, 1200); // milliseconds
```

**2. Classification Model:**
```javascript
// src/messageClassifier.js - Line 15
model: 'llama-3.1-8b-instant', // Change to different model
```

**3. Data Storage Location:**
```javascript
// src/userStatsManager.js - Line 5
constructor(dataFile = 'data/user_stats.json')

// src/groupManager.js - Line 5
constructor(dataFile = 'data/enabled_groups.json')
```

**4. Logging Level:**
```javascript
// index.js - Line 42
logger: pino({ level: 'silent' }), // Change to 'info', 'debug', 'error'
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

### Getting Started

1. **Fork the repository**
```bash
# Click 'Fork' button on GitHub
```

2. **Clone your fork**
```bash
git clone https://github.com/yourusername/whatsapp-moderation-bot.git
cd whatsapp-moderation-bot
```

3. **Create a branch**
```bash
git checkout -b feature/amazing-feature
```

4. **Make your changes**
- Follow existing code style
- Add comments where needed
- Test thoroughly

5. **Commit changes**
```bash
git add .
git commit -m "Add amazing feature"
```

6. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

7. **Create Pull Request**
- Go to your fork on GitHub
- Click "New Pull Request"
- Describe your changes

---

## 📜 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 WhatsApp Moderation Bot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[Baileys](https://github.com/WhiskeySockets/Baileys)** - WhatsApp Web API implementation
- **[Groq](https://groq.com)** - Fast AI inference platform
- **[Qwen](https://qwenlm.github.io/)** - Language model for classification
- **[Anthropic](https://anthropic.com)** - AI assistance in development

---

## 📞 Support

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/yourusername/whatsapp-moderation-bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/whatsapp-moderation-bot/discussions)


## 📊 Stats

- **Total Lines of Code**: ~1,500
- **Number of Commands**: 11
- **Supported Message Types**: 5
- **API Response Time**: ~200-500ms
- **Messages Per Minute**: 50 (rate limited)

---

**Made with ❤️ for better WhatsApp group management**

**Star ⭐ this repo if you find it useful!**