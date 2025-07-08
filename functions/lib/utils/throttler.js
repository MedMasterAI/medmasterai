export const API_TOKENS_PER_MINUTE = Number(process.env.API_TOKENS_PER_MINUTE || '60');
export class Throttler {
    constructor(tokensPerMinute = API_TOKENS_PER_MINUTE) {
        this.tokensPerMinute = tokensPerMinute;
        this.queue = [];
        this.tokens = tokensPerMinute;
        setInterval(() => {
            this.tokens = this.tokensPerMinute;
            this.release();
        }, 60000);
    }
    async acquire() {
        if (this.tokens > 0) {
            this.tokens--;
            return;
        }
        return new Promise(resolve => this.queue.push(resolve));
    }
    release() {
        while (this.tokens > 0 && this.queue.length > 0) {
            this.tokens--;
            const resolve = this.queue.shift();
            if (resolve)
                resolve();
        }
    }
}
const instances = {};
export function getThrottler(name, tps = 1) {
    const tokensPerMinute = tps * 60;
    if (!instances[name]) {
        instances[name] = new Throttler(tokensPerMinute);
    }
    return instances[name];
}
//# sourceMappingURL=throttler.js.map