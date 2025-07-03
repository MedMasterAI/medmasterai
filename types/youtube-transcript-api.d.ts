declare module 'youtube-transcript-api' {
  type TranscriptItem = {
    text: string
    start: number
    duration: number
  }

  class YouTubeTranscript {
    static getTranscript(id: string): Promise<TranscriptItem[]>
  }

  export default YouTubeTranscript
}
