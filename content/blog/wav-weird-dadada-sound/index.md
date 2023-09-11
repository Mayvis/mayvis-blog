---
title: Wav weird dadada sound
date: "2023-09-11T12:00:00.000Z"
description: 最近在使用前台開發跟聲音有關的功能，要將聲音處理好後，傳到後台讓 AI 做解析，但在聲音處理方面上出了點問題，產出來的音檔一直會有 dadada 的聲音，使用 audacity 的的確確能看到有一個固定頻率的斷點，這邊記錄一下解決的過程。
tags: ["frontend", "backend", "react"]
---

### Audio example

可以聽一下聲音，聲音會有一個固定頻率的斷點，並發出 dadada 的聲音。

`audio: ../../../src/assets/wav-weird-dadada-sound.wav`

### Frontend

這邊是前台處理聲音的部分，使用 audioWorklet，來進行對聲音的處理，轉成 int16 的部分是可以省略的。

```ts
// convert processor
class ConvertProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return []
  }

  #audioBuffer: Int16Array

  constructor() {
    super()
    this.#audioBuffer = new Int16Array(0)
  }

  convertFloat32ToInt16(inputs: Float32Array[][]) {
    const inputChannelData = inputs[0][0]

    const data = Int16Array.from(inputChannelData, n => {
      const res = n < 0 ? n * 32768 : n * 32767 // convert in range [-32768, 32767]
      return Math.max(-32768, Math.min(32767, res)) // clamp
    })

    const combinedBuffer = new Int16Array(
      this.#audioBuffer.length + data.length
    )
    combinedBuffer.set(this.#audioBuffer, 0)
    combinedBuffer.set(data, this.#audioBuffer.length)

    this.#audioBuffer = combinedBuffer
  }

  sendBuffer() {
    if (this.#audioBuffer.length >= 3200) {
      this.port.postMessage({
        eventType: 'data',
        audioBuffer: this.#audioBuffer,
      })
      this.#audioBuffer = new Int16Array(0) // reset audio buffer
    }
  }

  process(inputs: Float32Array[][]) {
    if (inputs[0].length === 0) {
      console.error('From Convert Processor Worklet, input is null')
      return false
    }

    this.convertFloat32ToInt16(inputs)
    this.sendBuffer()

    return true
  }
}

registerProcessor('convert-processor', ConvertProcessor)

export {}
```

因為該專案使用 react，所以我簡單寫了一個 hook 來進行處理。

```ts
import { useEffect, useRef, useState, RefObject, useCallback } from 'react'
import ConvertProcessor from '../worker/ConvertProcessor?worker&url'

const SAMPLE_RATE = 16000
const CHANNEL = 1

const useBrowserMedia = (
  browserAudioDeviceRef: RefObject<HTMLSelectElement>
) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const [browserAudioDevices, setBrowserAudioDevices] = useState<
    MediaDeviceInfo[]
  >([])

  const getUserMediaPermission = async () => {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    })
  }

  const handleStream = async (stream: MediaStream, websocket: WebSocket) => {
    const audioContext = window.AudioContext || window.webkitAudioContext

    if (!audioContextRef.current) {
      audioContextRef.current = new audioContext({
        sampleRate: SAMPLE_RATE,
      })
    }

    const source = audioContextRef.current.createMediaStreamSource(stream)

    try {
      await audioContextRef.current.resume()

      await audioContextRef.current.audioWorklet.addModule(ConvertProcessor)
    } catch (error) {
      throw new Error(`handle stream error: ${error}`)
    }

    const processNode = new AudioWorkletNode(
      audioContextRef.current,
      'convert-processor',
      {
        channelCount: CHANNEL,
      }
    )

    processNode.port.onmessage = e => {
      if (e.data.eventType === 'data') {
        // sending audio buffer to backend
        websocket.send(e.data.audioBuffer.buffer)
      }
    }

    source.connect(processNode).connect(audioContextRef.current.destination)
  }

  const recordFromBrowser = async (deviceId: string, websocket: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {
            exact: deviceId,
          },
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      })

      await handleStream(stream, websocket)
    } catch (error) {
      console.log(`record from browser error: ${error}`)
    }
  }

  const stopRecordFromBrowser = () => {
    audioContextRef.current?.close()
    audioContextRef.current = null
  }

  // 獲取瀏覽器麥克風裝置
  useEffect(() => {
    async function getAudioDevices() {
      if (!stream.current) {
        stream.current = await getUserMediaPermission()
      }

      const devices = await navigator.mediaDevices.enumerateDevices()

      const audioInputDevices = devices.filter(
        device => device.kind === 'audioinput'
      )

      if (audioInputDevices.length === 0) return

      setBrowserAudioDevices(audioInputDevices)

      // 釋放掉 stream 因為只是一次性需獲取麥克風權限
      stream.current.getTracks().forEach(track => track.stop())
    }

    getAudioDevices()
  }, [])

  // 當瀏覽器麥克風裝置有變動時，自動選擇第一個裝置
  useEffect(() => {
    if (browserAudioDevices.length === 0 || !browserAudioDeviceRef.current)
      return

    browserAudioDeviceRef.current.value = browserAudioDevices[0].deviceId
  }, [browserAudioDevices, browserAudioDeviceRef])

  return {
    browserAudioDevices,
    recordFromBrowser,
    stopRecordFromBrowser,
  }
}

export default useBrowserMedia
```

### Backend

程式開始執行後，`websocket.send(e.data.audioBuffer.buffer)` 會將 buffer 透過 websocket 送往後台，並由後台做處理聲音的部分，這邊我檢查了前台的程式碼，是沒有太大問題的，算是滿標配的寫法，那原因應該就是出在後台的部分，下方是後台最終能正常儲存聲音的程式碼。

```ts
let fileName: string
let WAV_HEADER: Buffer

function startRecordFromBrowser(
  browserAudioBuffer: ArrayBuffer,
  asrWS: WebSocket,
  wss: Server<typeof WebSocket, typeof IncomingMessage>,
  delayTime: number,
  init: boolean = false
) {
  if (init) {
    createFolder(DIRECTORY)
    fileName = createFileName(DIRECTORY)

    // register file stream in init
    fileStream = fs.createWriteStream(fileName, { encoding: 'binary' })
    fileStream.on('ready', function () {
      console.warn('Ready to write browser record audio to file.')
    })
    fileStream.on('error', function (err) {
      console.warn(
        'An error occurred while writing browser record audio to file: ',
        err
      )
    })
    fileStream.on('finish', function () {
      console.warn('Finished writing browser record audio to file.')
    })

    WAV_HEADER = createWavHeader(browserAudioBuffer.byteLength)
  }

  const audioBufferWithoutWavHeader = Buffer.from(browserAudioBuffer)

  // store audio buffer without wav header
  audioBuffer = Buffer.concat([audioBuffer, audioBufferWithoutWavHeader])

  if (asrWS.readyState === WebSocket.OPEN) {
    asrWS.send(browserAudioBuffer)
  } else {
    console.warn('ASR WebSocket is not open, record close process.')
    fileStream?.end()
    sendCloseWebsocket(wss)
  }
}
```

```ts
const createWavHeader = (dataSize: number) => {
  const SAMPLE_RATE = 16000
  const CHANNEL = 1
  const header = Buffer.alloc(44)

  // Chunk ID "RIFF"
  header.write('RIFF', 0)
  // File size (36 + data size)
  header.writeUInt32LE(36 + dataSize, 4)
  // Format "WAVE"
  header.write('WAVE', 8)
  // Sub-chunk 1 ID "fmt "
  header.write('fmt ', 12)
  // Sub-chunk 1 size (16 for PCM)
  header.writeUInt32LE(16, 16)
  // Audio format (PCM)
  header.writeUInt16LE(1, 20)
  // Number of channels (1 for mono, 2 for stereo)
  header.writeUInt16LE(CHANNEL, 22)
  // Sample rate (e.g., 16000 Hz)
  header.writeUInt32LE(SAMPLE_RATE, 24)
  // Byte rate (SampleRate * NumChannels * BitsPerSample / 8)
  header.writeUInt32LE((SAMPLE_RATE * CHANNEL * 16) / 8, 28)
  // Block align (NumChannels * BitsPerSample / 8)
  header.writeUInt16LE((CHANNEL * 16) / 8, 32)
  // Bits per sample (e.g., 16 bits)
  header.writeUInt16LE(16, 34)
  // Sub-chunk 2 ID "data"
  header.write('data', 36)
  // Sub-chunk 2 size (data size)
  header.writeUInt32LE(dataSize, 40)

  return header
}
```

🚀最後發現那個 dadada 起怪的原因是因為我將 `browserAudioBuffer` 定義為 Buffer 的型別，而不是 ArrayBuffer 的型別，間接導致 wav header 在計算時出現錯誤，要使用 byteLength，而不是 length。

### Conclusion

其實這個問題花了我相當多的時間去 debug，也在複習了一次 ArrayBuffer (int16array, uint8array...etc，儲存 binary data 的容器，可以透過視圖進行操作) 及 Buffer (用於操作 ArrayBuffer 的視圖 DataView) 之間的差別。

更細節的部分可以參考這篇阮一峰寫的[文章](http://javascript.ruanyifeng.com/stdlib/arraybuffer.html)。
