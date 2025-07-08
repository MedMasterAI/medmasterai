export const API_TOKENS_PER_MINUTE = Number(process.env.API_TOKENS_PER_MINUTE || '60')

export class Throttler {
  private tokens: number
  private queue: Array<() => void> = []

  constructor(private tokensPerMinute: number = API_TOKENS_PER_MINUTE) {
    this.tokens = tokensPerMinute
    setInterval(() => {
      this.tokens = this.tokensPerMinute
      this.release()
    }, 60000)
  }

  async acquire(): Promise<void> {
    if (this.tokens > 0) {
      this.tokens--
      return
    }
    return new Promise(resolve => this.queue.push(resolve))
  }

  private release() {
    while (this.tokens > 0 && this.queue.length > 0) {
      this.tokens--
      const resolve = this.queue.shift()
      if (resolve) resolve()
    }
  }
}

const instances: Record<string, Throttler> = {}

export function getThrottler(name: string, tps = 1): Throttler {
  const tokensPerMinute = tps * 60
  if (!instances[name]) {
    instances[name] = new Throttler(tokensPerMinute)
  }
  return instances[name]
}
