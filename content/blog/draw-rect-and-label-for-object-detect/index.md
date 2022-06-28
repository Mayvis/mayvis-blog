---
title: Draw rect and label for object detect
date: "2022-06-28T12:00:00.000Z"
description: 在影像物件辨識的領域中，使用 opencv 將物件框起來是很常見的，但是仔細想想，假設客戶今天想過濾掉某個物件，又或著是想將物件融合起來，像是背著包包的人時，該怎麼辦呢？其實簡單講就是畫出來的框框不能直接輸出到影片中，而是要透過 json 的方式輸出給前端，這樣才能讓客戶可以透過前端的管理頁面自行操作。
tags: ["vue", "p5.js", "ai"]
---

### Preface

這項功能是最近被要求要撰寫的，所以就如火如荼地花了一些時間把功能用出來，扣除掉客戶想要能過濾物件之外，其實後台辨識主機在使用 opencv 繪製框框時是很耗效能的，於是在跟 PM 和後端工程師討論過後，我們將這部分功能轉嫁給前端瀏覽器，後台也不用額外儲存影片資料，減少儲存空間，以往可能要儲存 opencv 繪製完後的影片及原始影片，現在只要存取有抓到物件的原始影片及框框 json 的資訊，畢竟目前公司產品都是不上雲居多，需要定時清理，算是一石二鳥吧。

### Initialize the videojs component

此範例是使用 Vue3 TypeScript 搭配 p5.js 來進行繪製，當然你也可以使用純 canvas 搭配 requestAnimationFrame 來進行動態繪製框框，不過因為作者本人我比較懶，所以這次主要使用 p5.js。

首先需創建 Video.vue 的 component，程式碼如下，我們將 video current time, object json data, video status 以 props 的形式帶到 Track component。

```typescript
// Video.vue
<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import videojs from 'video.js'
import "video.js/dist/video-js.css"
import '@videojs/themes/dist/sea/index.css' // need to install @videojs/themes

// this part in real world need to be fetched from the server
import videoSrc from '../assets/video.mp4'
import videoJSON from '../assets/video.json'

let videoRef = videojs.Player | null = null
const videoStatus = ref<"paused" | "playing">("paused")
const currentTime = ref(0)

const OPTIONS = {
  control: true,
  sources: [
    {
      src: videoSrc,
      type: "video/mp4"
    }
  ]
}

// need to get the DOM, so you should use onMounted hook
onMounted(() => {
  // init the video.js
  videoRef = videojs(
    'js-video-player',
    OPTIONS,
    () => {
      const vRef = videoRef as videojs.Player

      vRef.on("timeupdate", () => {
        currentTime.value = vRef.currentTime() || 0
      })

      vRef.on("playing", () => {
        videoStatus.value = "playing"
      })

      vRef.on("playing", () => {
        videoStatus.value = "paused"
      })
    }
  )
})

onBeforeUnmount(() => {
  if (videoRef) {
    (videoRef as videojs.Player).dispose()
  }
})
</script>

<template>
  <div class="video-wrapper">
    <video id="js-video-player" class="video-js vjs-theme-sea">
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a
        web browser that
        <a href="https://videojs.com/html5-video-support/" target="_blank"
          >supports HTML5 video</a
        >
      </p>
    </video>

    <!-- 🚀 Create Track component and pass props to the Track component -->
    <Track
      :data="videoJSON"
      :current-time="currentTime"
      :video-status="videoStatus"
    />
  </div>
</template>

<style lang="scss" scoped>
.video-wrapper {
  position: relative;
}
</style>
```

### Start build our drawing track component

上方將 video component 的部分撰寫好後，便可以開始處理框框的繪製，下面僅僅是 sample code 如果需要有額外的功能，可以自行擴充及修改。

```typescript
<script setup lang="ts">
import { onMounted, ref } from "vue"
import P5 from "p5"

interface FrameType {
  FrameTime: string
  Objects: IObjectType[]
}

interface IDataType {
  Frame: FrameType[]
}

interface IObjectType {
  DLabel: string
  DBox: string
}

const props = defineProps<{
  data: IDataType
  currentTime: number
  videoStatus: "paused" | "playing"
}>()

const sketch = function (p5: P5) {
  const COLORS = [p5.color(255, 204, 0)] // you can also fetch border color from the server according DLabel information.

  pt.setup = () => {
    p5.createCanvas(1280, 720) // you can also get the parent DOM width and height by using getBoundingClientRect()

    // using this method can find the closest time from video current time in array
    function closest<T extends IDataType>(data: T): FrameType {
      return data.Frame.reduce((acc, cur) => {
        const curDiff = Math.abs(+cur.FrameTime - props.currentTime)
        const accDiff = Math.abs(+acc.FrameTime - props.currentTime)

        if (accDiff === curDiff) {
          return acc.FrameTime > cur.FrameTime ? acc : cur
        } else {
          return curDiff < accDiff ? cur : acc
        }
      })
    }

    p5.draw = () => {
      if (props.videoStatus === "playing") {
        p5.clear(0, 0, 0, 0) // clear the canvas first

        if (props.data.Frame) {
          const { Objects } = closest(props.data)

          // 🚀 below is the drawing sample code, you can change the drawing method to whatever you want.
          for (let i = 0; i < Objects.length; i++) {
            const { DBox, DLabel } = Objects[i]
            const box = DBox.split(" ").map(Number)

            p5.strokeWeight(1)
            p5.stroke(COLORS[0])
            p5.textSize(20)
            p5.fill(COLORS[0])
            p5.text(DLabel, box[0], box[1])

            p5.noFill()
            p5.strokeWeight(2)
            p5.stroke(COLORS[0])
            // x, y, w, h
            p5.rect(box[0], box[1], box[2] - box[0], box[3] - box[1])
          }
        }
      }
    }
  }
}

onMounted(() => {
  if (trackRef.value) {
    new P5(sketch, trackRef.value)
  }
})
</script>

<template>
  <div ref="trackRef" id="js-video-track"></div>
</template>

<style lang="scss" scoped>
#js-video-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // because we need to use canvas to cover video, pointer-event need to be set to none, that user can still control the video
}
</style>
```

### Conclusion

現在網頁越來越發達，很多事情及功能都可以透過網頁的方式來達到，尤其是網頁工具這塊，AI 方面...等的 SaaS 也越來越多，畢竟前端簡單的幾行程式碼，就可以為 server 增加些許的效能，此次只是單純分享 AI 工具的使用範例，畢竟自己有實際接觸到，也希望能夠幫助大家了解，前端工程師的範疇是很廣的。

雖然平時主要是以 Vue 開發居多，但後續自己也有在規劃寫一些 React 方面的文章，順便練一下自己生疏的 React，可能做個 React Gaming 101 之類的吧，感覺滿好玩的。

目前也正在用自己下班的時間幫醫生老哥開發一些工具，妥妥的廉價勞工工程師 🤪。
