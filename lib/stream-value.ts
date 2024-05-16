export class Streamer {
    private data: string;

    constructor(data: string) {
        this.data = data
    }

    async *stringToAsyncIterable(): AsyncIterable<string> {
        for (const char of this.data) {
            yield char;
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }
}
