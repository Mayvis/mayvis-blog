---
title: AudioWorklet export wav file
date: "2022-09-10T12:00:00.000Z"
description: 延續上次語音辨識的主題，此次遇到的問題是即使我們有使用之前製作的 Volume Meter 讓客戶自己能檢測麥克風聲音是否有輸入至後台，但我們從客戶後台拿到的數據仍是錯誤的，所以我的主管希望能透過前端產生一個 wav 檔案，來與後台的數據做比對，看看錯誤的原因在哪裡，接著我們就來實作吧。
tags: ["javascript"]
---

### Preface

一般來說談到錄音很多人一開始都會想直接使用 `MediaRecorder` 來實踐，但是有一個很悲劇的點在於，轉換格式有限制，這點可以透過 `MediaRecorder.isTypeSupported()` 來檢查，像是轉換成 audio/wav 檔案可能只支援在 firefox 瀏覽器...之類的，所以最終方案我只能放棄使用 `MediaRecorder` 轉而處理 raw 檔案來進行實踐。

### Limit raw data length send to ASR server

在之前 32 bits 轉 16 bits 的章節中，我們已經知道如何將 32 bits 的數據轉換成 16bits，但其實我們還有進行額外的處理，像是我們會限制每次傳輸至 ASR 語音辨識的數據量必須是固定的，而這要怎進行實踐呢？

也就是當長度到 3200 時，我們會將 raw data 使用 AudioWorklet `postMessage` 送出，接著清空該 audioBuffer。

```javascript{19-28}
class ConvertBitsProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return []
  }

  constructor() {
    super()
    this.audioBuffer = []
  }

  convertToFloat32ToInt16(inputs) {
    const inputChannelData = inputs[0][0]

    const data = Int16Array.from(inputChannelData, n => {
      const res = n < 0 ? n * 32768 : n * 32767 // convert in range [-32768, 32767]
      return Math.max(-32768, Math.min(32768, res)) // clamp
    })

    if (this.audioBuffer.length >= 3200) {
      this.port.postMessage({
        eventType: "data",
        audioBuffer: this.audioBuffer,
      })
      this.audioBuffer = []
    } else {
      // ref: https://stackoverflow.com/questions/14071463/how-can-i-merge-typedarrays-in-javascript
      this.audioBuffer = Int16Array.from([...this.audioBuffer, ...data])
    }
  }

  process(inputs) {
    if (inputs[0].length === 0) {
      console.error("From Convert Bits Worklet, input is null")
      return false
    }

    this.convertToFloat32ToInt16(inputs)

    return true
  }
}
```

### Handle raw data from AudioWorklet

在程式內便可以透過監聽 onMessage event 來取得 raw data，接著我們就可以進行處理了，下方是範例程式碼。

```javascript{21-27,29-38}
const chunks = []
async function handleStream() {
  const AudioContext = window.AudioContext || window.webkitAudioContext

  if (!audioContext) {
    audioContext = new AudioContext({
      sampleRate: 16000,
    })
  }

  const source = audioContext.createMediaStreamSource(stream)

  try {
    await audioContext.resume()

    await audioContext.audioWorklet.addModule("convert-bits-worklet.js")
  } catch (error) {
    throw new Error(`AudioContext error: ${error}`)
  }

  const processNode = new AudioWorkletNode(
    audioContext,
    "convert-bits-processor",
    {
      channelCount: 1,
    }
  )

  processNode.port.onmessage = e => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      if (e.data.eventType === "data") {
        websocket.send(e.data.audioBuffer)

        // 將 chunks 駐存起來以便輸出成 wav 檔案
        chunks.push(e.data.audioBuffer)
      }
    }
  }

  source.connect(processNode).connect(audioContext.destination)
}
```

### Handle wav file header

此部分是參考網路上提供的資訊所建置，下方兩個函示能產生 wav 檔案的 header 的相關資訊並儲存在 ArrayBuffer 內。

創建過程中你必須知道 chunks 的資料長度，channel 是單聲道還是雙聲道，sampleRate 是多少，依照你音檔的格式來進行輸入，以這個專案來講我們是使用 16000 的 sampleRate，單聲道...等。

```javascript
/**
 * 將資料寫進 DataView 內
 *
 * @param {DataView} dataView - dataView object to write a string.
 * @param {number} offset - offset in bytes
 * @param {string} string - string to write
 */
function writeString(dataView, offset, string) {
  for (let i = 0; i < string.length; i++) {
    dataView.setUint8(offset + i, string.charCodeAt(i))
  }
}

/**
 * 取得 wav file header 的資訊
 */
function getWAVHeader() {
  const BYTES_PER_SAMPLE = Int16Array.BYTES_PER_ELEMENT
  /**
   * Get stored encoding result with Wave file format header
   * Reference: http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
   */
  // Create header data
  const dataLength = chunks.reduce((acc, cur) => acc + cur.byteLength, 0)
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  // RIFF identifier 'RIFF'
  writeString(view, 0, "RIFF")
  // file length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + dataLength, true)
  // RIFF type 'WAVE'
  writeString(view, 8, "WAVE")
  // format chunk identifier 'fmt '
  writeString(view, 12, "fmt ")
  // format chunk length
  view.setUint32(16, 16, true)
  // sample format (raw)
  view.setUint16(20, 1, true)
  // channel count
  view.setUint16(22, channel, true)
  // sample rate
  view.setUint32(24, sampleRate, true)
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * BYTES_PER_SAMPLE * channel, true)
  // block align (channel count * bytes per sample)
  view.setUint16(32, BYTES_PER_SAMPLE * channel, true)
  // bits per sample
  view.setUint16(34, 8 * BYTES_PER_SAMPLE, true)
  // data chunk identifier 'data'
  writeString(view, 36, "data")
  // data chunk length
  view.setUint32(40, dataLength, true)

  return header
}
```

### Export WAV file

最後透過程式將檔案轉換成 blob 進行下載。

```javascript
function exportFile() {
  if (chunks.length !== 0) {
    // 將 header 與 chunks 合併
    const wavRawData = [getWAVHeader(), ...chunks]

    const link = document.createElement("a")
    const blob = new Blob(wavRawData, { type: "audio/wav" })
    const audioURL = URL.createObjectURL(blob)
    link.style.display = "none"
    link.href = audioURL
    link.download = "sample.wav"
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(audioURL)
    }, 100)

    chunks = []
  }
}
```

### Conclusion

工具型的產品及專案，時常需要處理客戶因為不知名的原因所產生的問題，上次寫的 volume meter 就是為了讓客戶能自己檢測麥克風是否是正常而建立的，將聲量圖形化展示的功能；而這次新功能則是透過前台產出音檔，為了確認客戶拋到我們系統後台的檔案數據是否正確，以此來判斷到底是對方有問題還是我們的系統接收的時候有問題，將兩邊資料進行比對。

相比於 2c，2b 在某些情況會比較複雜一點，比如你不知道客戶那邊的狀態是怎樣，客戶是否有照步驟進行操作，客戶的工程師是否有該方面相關知識，且能勝任處理問題...等，而當問題發生後，你必須提供方案讓客戶能夠自行檢測，亦或著客戶需將資料提供給我們，讓我們能知道問題的所在。
