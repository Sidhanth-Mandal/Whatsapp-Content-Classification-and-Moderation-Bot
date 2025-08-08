const EventEmitter = require('events');

class MessageQueue extends EventEmitter {
    constructor(classifier, delayMs = 1200) {
        super();
        this.classifier = classifier;
        this.delayMs = delayMs;
        this.queue = [];
        this.processing = false;
        this.lastProcessTime = 0;
    }

    addMessage(messageData) {
        this.queue.push(messageData);
        console.log(`Added message to queue. Queue length: ${this.queue.length}`);
        
        if (!this.processing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        
        while (this.queue.length > 0) {
            const messageData = this.queue.shift();
            
            try {
                // Ensure we wait at least delayMs between API calls
                const now = Date.now();
                const timeSinceLastCall = now - this.lastProcessTime;
                
                if (timeSinceLastCall < this.delayMs) {
                    const waitTime = this.delayMs - timeSinceLastCall;
                    console.log(`Rate limiting: waiting ${waitTime}ms before next classification`);
                    await this.sleep(waitTime);
                }

                console.log(`Processing message: "${messageData.content.substring(0, 50)}..."`);
                
                const startTime = Date.now();
                const classification = await this.classifier.classifyMessage(messageData.content);
                const endTime = Date.now();
                
                console.log(`Classification result: ${classification} (took ${endTime - startTime}ms)`);
                
                this.lastProcessTime = Date.now();
                
                // Emit the classification result
                this.emit('classified', {
                    messageData,
                    classification
                });
                
            } catch (error) {
                console.error('Error processing message in queue:', error);
                this.emit('error', error);
                
                // Continue processing other messages even if one fails
                this.lastProcessTime = Date.now();
            }
        }
        
        this.processing = false;
        console.log('Queue processing completed');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getQueueLength() {
        return this.queue.length;
    }

    isProcessing() {
        return this.processing;
    }

    clearQueue() {
        this.queue = [];
        console.log('Queue cleared');
    }
}

module.exports = MessageQueue;