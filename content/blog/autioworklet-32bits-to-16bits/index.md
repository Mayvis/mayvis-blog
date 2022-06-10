---
title: AudioWorklet 32bits to 16bits
date: "2022-06-10T12:00:00.000Z"
description: 因為目前公司主要產品在做 AI 影像辨識及語音辨識部分的應用，那在語音辨識這塊，需要透過使用者操作網站透過麥克風及時將資料轉換成 Sample rate 16000 16bits 或 8bits 的音頻資料，並將其提供給公司的語音辨識系統，這篇文章就來講解如何透過 AudioWorklet 將音頻資料轉換成 16bits 的音頻資料。
tags: ["javascript"]
---

### Preface

首先，如果有時常接觸語音方面的 ，應該知道 w3c 有對語音方面的 API 進行過一系列的修正，將很大部分轉到 AudioWorklet 來做替代，尤其是：`createScriptProcessor`，可以參考 w3c 的文件：[連結](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor)。

### Build step by step

使用方式如下，你必須先註冊一個延伸的 AudioWorkletProcessor，基礎的架構會如下。

```javascript
// convert-bits-worklet.js
class ConvertBitsProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return []
  }

  constructor() {
    super()
  }

  process(inputs, outputs, parameters) {
    return true
  }
}

registerProcessor("convert-bits-processor", ConvertBitsProcessor)
```

接著你必須透過 AudioContext 去添加至程式中，可參考下方程式碼。**這邊要注意 addModule 路徑的問題，如果你是使用 Vue 或 React 需使用 webpack...等，去調整路徑的位置**，比較簡單的方式可以直接將 convert-bits-worklet.js 這檔案直接放置到跟 index.html 同樣的目錄底下，這樣就不用額外多做設定了。

```javascript
// record.js
const recordBtn = document.querySelector("#record-btn")

recordBtn.addEventListener("click", handleRecord)

function handleRecord() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia

  navigator.getUserMedia(
    {
      audio: true,
      video: false,
    },
    handleStream,
    console.error
  )
}

function handleStream() {
  const context = new AudioContext({
    sampleRate: 16000,
  })
  const source = context.createMediaStreamSource(stream)

  try {
    // 🚀 路徑問題需額外注意，不然程式會報錯，抓不到 convert-bits-worklet.js
    await this.audioContext.audioWorklet.addModule("./convert-bits-worklet.js")
  } catch (error) {
    console.error(error)
  }

  const processNode = new AudioWorkletNode(
    this.audioContext,
    "convert-bits-processor",
    {
      channelCount: 1,
    }
  )

  source.connect(processNode).connect(this.audioContext.destination)
}
```

inputs 輸出的會是一組左右聲道的音頻資料，如下所示：

[float32array(128), float32array(128)]

你可以透過 `inputs[0][0].BYTES_PER_ELEMENT` 知道每一個都為 4bytes 也就是 32bits，所以我們必須將這組資料轉換成 16bits 的音頻資料，可以參考下方程式碼。
間單來講就是將 float32array 轉換成 int16array，接著我們可以透過 this.port.postMessage 將資料輸出給 AudioWorkletNode 來做處理。

_Tip: 會做這件事情的主要原因是因為 AudioWorklet process 無法將 float32array 整組直接使用 int16array 替代，這邊會顯示該資料是 readonly 。_

```javascript
class ConvertBitsProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return []
  }

  constructor() {
    super()
  }

  convertToFloat32ToInt16(buffer) {
    return Int16Array.from(buffer, n => {
      const res = n < 0 ? n * 32768 : n * 32767 // convert in range [-32768, 32767]
      return Math.max(-32768, Math.min(32768, res)) // clamp
    })
  }

  process(inputs) {
    const val = this.convertToFloat32ToInt16(inputs[0][0])

    // 將資料輸出至 AudioWorkletNode
    this.port.postMessage({ eventType: "data", audioBuffer: val })

    return true
  }
}

registerProcessor("convert-bits-processor", ConvertBitsProcessor)
```

### Final

最後透過 AudioWorkletNode onmessage 事件來進行接收，將轉換完成的 16bits 資料輸出給後台辨識系統做處理。

```javascript
processNode.port.onmessage = e => {
  if (e.data.eventType === "data") {
    // 下方只是示意將資料輸出至 websocket，你可以改成你想要的方式
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(e.data.audioBuffer)
    }
  }
}
```

### Conclusion

因為這些資源在網路上是比較稀少的，那必須要多去嘗試及搜尋才知道怎樣做是合宜的，所以才有這篇文章的出現，畢竟自己實際在專案上處理過。

也可以自己去做延伸，像是假如這次不是透過麥克風來接收，而是透過檔案，像是 wav 檔，你就必須跳掉 44bytes 的 header，該如何去做實踐，這些都滿好玩的，可以自己親身去玩玩。
