class StreamerAudioProcessor extends AudioWorkletProcessor {
    constructor (options) {
      super()
      const sampleRate = options.processorOptions.sampleRate
      const bufferInSec = options.processorOptions.bufferInSec
      this.bufferSize = Math.round((sampleRate / 128 * bufferInSec)) // 128 default received buffer for process method
      console.log(`processor's buffer: ${this.bufferSize}`)
      this.buffer = new Array(this.bufferSize)
      this.bufferIndex = 0
    }
  
    process (inputs, outputs, parameters) {
      // console.log('on process')
      const input = inputs[0]
      if (input[0] === undefined) {
        console.log('no data')
        return false
      }
      this.buffer[this.bufferIndex] = inputs[0][0].slice()
      this.bufferIndex++
      if (this.bufferIndex >= this.bufferSize) {
        const data = this.buffer.reduce((acc, ca) => { return acc.concat(Array.from(ca)) }, [])
        this.port.postMessage({ type: 'audioData', data })
        this.bufferIndex = 0
      }
      return true
    }
  }
  
  registerProcessor('recorder-audio-processor', StreamerAudioProcessor)
  