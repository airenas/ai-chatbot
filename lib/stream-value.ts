export class Streamer {
    private data: string;

    constructor(data: string) {
        this.data = data
    }

    async *stringToAsyncIterable(): AsyncIterable<string> {
        const minDelay = 5;
        let delay = 5;
        const l = this.data.length
        for (let i = 0; i < this.data.length; i++) {
            yield this.data[i];
            if (i < 200) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else if (l - i < 200) {
                delay = Math.min(minDelay, delay + 0.1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                if (delay > 0.1) {
                    delay = Math.max(0.1, delay - 0.1);
                }
                if (delay > 0.1 || i % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }
}
