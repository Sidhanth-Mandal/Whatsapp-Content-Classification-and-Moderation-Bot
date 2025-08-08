const axios = require('axios');
require('dotenv').config();

class MessageClassifier {
    constructor() {
        this.groqApiKey = process.env.GROQ_API_KEY;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        
        if (!this.groqApiKey) {
            throw new Error('GROQ_API_KEY not found in environment variables');
        }
    }

    
    async classifyMessage(messageContent) {
        try {

            const bannedWordsRegex = /\b(fuck|bitch|slut|cunt|nigger)\b/i;  // case-insensitive and word-boundary-safe
            
            if (bannedWordsRegex.test(messageContent)) {
                return 'Other-soc-related';
            }
            
                const prompt = this.buildClassificationPrompt(messageContent);
            
            const response = await axios.post(this.apiUrl, {
                model: 'llama-3.1-8b-instant', // Using Llama as it's available on Groq
                messages: [
                    {
                        role: 'system',
                        content: 'You are a message classifier. You must respond with EXACTLY one of these categories: Funny, Plain, Helpful, Curious, Super Offensive. No additional text or explanation.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            }, {
                headers: {
                    'Authorization': `Bearer ${this.groqApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const classification = response.data.choices[0].message.content.trim();
            
            // Validate the classification
            const validCategories = ['Funny', 'Plain', 'Helpful', 'Curious', 'Super Offensive'];
            if (!validCategories.includes(classification)) {
                console.warn(`Invalid classification received: ${classification}, defaulting to Plain`);
                return 'Plain';
            }
            
            return classification;
            
        } catch (error) {
            console.error('Error classifying message:', error.response?.data || error.message);
            // Return 'Plain' as default on error
            return 'Plain';
        }
    }

    buildClassificationPrompt(messageContent) {
        return `Classify the following message into one of these categories:

Categories:
- Funny: Jokes, memes, humorous content, funny observations
- Plain: Normal conversation, neutral statements, everyday chat
- Helpful: Advice, assistance, informative content, solutions
- Curious: Questions, expressions of wonder, seeking information
- Super Offensive: Extremely abusive content that includes hate speech, serious threats, targeted harassment, or severely inappropriate language. Ignore light sarcasm, jokes, friendly banter, or minor arguments.

Message to classify: "${messageContent}"

Respond with ONLY the category name:`;
    }
}

module.exports = MessageClassifier;