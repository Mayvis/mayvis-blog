---
title: Project Vue to React
date: "2024-04-12T12:00:00.000Z"
description: 最近這幾個月又是處在很忙的一個狀態，除了日常運維之外，一部分是在忙著把公司核心的前端頁面從 Vue 改成 React，所以這篇文章來打一下，我的一些想法。
tags: ["vue", "react", "frontend"]
---

### Motivation

首先，為何要將主核心網站從 Vue 換成 React 呢？關於這點，再於我們公司案子越來越多，所接觸的客戶也越來越多，自然而然會牽扯到一些政治上面的問題，儘管 Vue 已經將程式碼開源，且政府也有[行政院公文](https://drive.google.com/file/d/1btV2EYbtTqtOsN_yFT2r3Z4HuztTYa-l/view?fbclid=IwAR36ipk1PiYbJ2ZjIA9d3JN1ysPBckiTMX-NUkVXZtSYMUwql9aA6K_7uyE_aem_AaiZZgrIbaxOBPxGe1NVAobpzl-17ij5oSAIvjJLNinTeObqRuoejJgeovph9hAuv-o6iQ37B4gQCr8aYKIMZj5S)說解除列管，但公司站在保險一點的角度，還是得減少政治敏感度的問題，所以沒辦法就只能做修改。

下面是我個人的看法，有好有壞，基本上我兩個都滿喜歡的，也都有做使用。

### Choose UI library

我們公司的產品，很大一部分都是工具及管理頁面，基本上都會搭配一些 UI 的組件庫，像是 Vue2 主要搭配 Element UI，Vue3 搭配 Naive UI 或 Element Plus，坦白說這些都是很好的元件庫，但是同時這些也都是"大陸方公司“進行開發的，像是 Naive UI 背後的工程師是一家大陸 AI 的公司在運營吧，Element Plus 也是...等。

換到 React 後，會面臨組件庫的困境，其實我個人目前用下來，最好寫的其實是 Antd 組件庫，但是這組件庫是大陸的，所以無法使用，MUI 我直接跳過了，樣式太美系，MUI Joy UI 是可以考慮的一個選項，但考量到樣式客製化很麻煩，Mantine 也是樣式很麻煩他必須另外寫 CSS 去改樣式，Chakra UI 跟 shadcn/ui 這兩個是我的首選，選 Chakra UI 配合 styled component 其實在開發後台的體驗是非常好的，我個人也比較偏愛 styled component，但 Chakra 缺點就是他元件偏少，像是 Date Picker，Date Time Picker...等，沒錯，我覺得 React 最為人詬病的就是除了 Antd，其他的元件庫都會缺些東西，這得要去習慣，你必須額外去安裝像是 react-hook-form，zod，react-table...等。

React 推 Headless UI 的設計理念一陣子了，只有基礎樣式及功能，需要自己處理的事情會更多，但同時也代表這些東西掌握在自己手上，我這邊最終選定是 shadcn/ui 搭配 Tailwind CSS，體驗一把 className 地獄。

### Choose State Management

在 Vue2 中，你可以搭配官方選定的 Vuex，Vue3 則可以搭配 Inject 及 Pinia，來做貯存，這也是官方推薦的。

在 React 中，你的選擇就多了 Redux(with RTK)，Zustand，Mobx，Recoil 及 React 原生 Provider...等，我個人認為，這部分學習曲線比較高，假如你想要在 Redux 使用 async 你還必須去裝 thunkAPI...等，我這邊是選擇使用 Redux，他是 Dan Abramov 基於 Flux 架構開發的狀態管理系統，主要架構在這四點 Dispatcher、Action、Store、View，簡單解釋就是，Dispatch 會派發 Action，接著會依據這個 Action 的 type 及其 payload 來做相對應的 Store 狀態更新，這邊我們會稱為 Reducer，結束後更新視圖。

至於為何不使用 Zustand，在於當商業模式越趨複雜的話，比較嚴謹的架構，在網站建構時會是我的首選，但也不排除後期頁面邏輯越趨複雜，局部管理，之後會使用 Zustand。

我個人滿佩服 React 社群在這部分的貢獻，可以依據自己要的方案去做選擇，大部分也都有圖例，可以快速地去瞭解該方案是否對於現行的網站更合適。

### TypeScript Support

基本上我個人目前是將專案都盡量用 TypeScript 做撰寫，其實這部分我認為 Vue 跟 React 都是不錯的，但在體感上，個人覺得 React 略勝一點點，畢竟體感上真的是在寫 JavaScript，Vue 的模板的開發模式其實也是滿清晰的，所以這也就單純我個人喜好。我自己使用下來 Vue3 用 TypeScript 在撰寫時有個致命缺點就是，vscode 卡頓頻繁程度相比於 React 是多很多的，這部分也可能是我 2019 mbp 不給力，尚未將我的 mbp 換成 arm 架構的，還在用 intel，使用 16GB 記憶體也會略顯不夠，外加我個人還要處理 docker，下次換電腦可能會直上 32GB 記憶體吧。

### Template

這部分也是很多工程師會拿來討論的，React 體感寫起來基本上就是在寫 js，但是 Vue 是使用 template，你必須要去記像是 `v-for` `v-if` 等，template 的相關用法，所以自然而然，網路上有一部分人說 template 這種寫法不直觀，但我個人認為有點小偏頗，template 就是前端必須去接觸的一個技能，而這部分也是滿成熟的，你用 Angular 也是使用 template 的寫法，你今天想做全端使用 php laravel，他的 blade 機制基本上也是 template，甚至是你用 nodejs 後台寄信，handlebars 這種 lib 也都是 template...等，太多情境會使用到，所以我覺得算是網頁工程師必須學習的技能之一。

### Building frontend Tool

公司的網站有一部分是工具，在撰寫網頁型工具時，時常會有些較複雜的功能需要去做實踐，有時甚至還必須使用到演算法，坦白說我個人比較喜愛 Vue，寫起來會比較直觀，下限會比較低，而 React 有時可能要寫的比較抽象會比較好，需要對 JavaScript 有更深一層理解的人來寫會比較合適，下限會比較高，這部分有改過菜鳥寫的 React 程式碼的工程師大概就會知道，基本上有機會會砍掉 1/3 甚至 1/2 以上的程式碼，在優化時，腦子也會時常跳出這 useEffect 是用來幹嘛的？基本上，原則是能不用則不用，一定要用就希望一定要加註解，提高易讀性，React 官方有一篇文章 [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) 可以詳讀，我個人，也會習慣性寫個 useRenderCount 之類的 hook 去看一下為什麼這邊多渲染了幾次，看是否需要加，useMemo，memo，useCallback 之類的，除此之外，React 的 bug 在有些情況會相對比較難找出來，像是 StrictMode 有加沒事，反而拔掉後有事之類的 bug，當初發生問題的程式碼大致如下：

```tsx
import { FC } from "react"

const Foo: FC = () => {
  const [foo, setFoo] = useState()
  const [bar, setBar] = useState()

  const someFn = () => {
    // don't do this, if your setBar need to use prevFoo value, you can just use foo variable
    setFoo(prevFoo => {
      setBar(/* */) // this cause bug

      return { ...prevFoo, ...something }
    })
  }

  return <Bar />
}
```

在開發前端工具且使用 React，我會比較推薦有個有經驗的指導者來審程式碼會比較好，主要是可以發現一些在開發上的盲點，旁觀者清，至於能力夠好的工程師就挑你習慣的就好，坦白說，沒差。

上訴所提到的抽象，開發完後，會有點像是定義個輪廓，元件就處理完了，會有點類似下面開發的模式：

```tsx
import { FC } from 'react'
import Emoji, { Schema: EmojiSchema } from "./Emoji"

const Hello: FC = () => {
  // you can also wrap it with useMemo
  const EmojiSchema: EmojiSchema = {
    foo: "",
    bar: "",
    sayHi: () => {},
  }

  return <Emoji schema={emojiSchema} />
}
```

假如你一定要使用 useEffect 我個人時常會搭配 useRef 去做一些額外的控制，不過這也取決於你的 side effect 是否比較複雜，有點類似下面的模板，如果有複數個 state 混在一起可以再搭配 useReducer。

```tsx
import { FC, useState } from "react"

enum HistoryEvent {
  ADD = "add",
  DELETE = "delete",
  EDIT = "edit",
}

type HistoryFoo = {
  event: HistoryEvent.ADD
  value: Foo
}

type HistoryBar = {
  event: HistoryEvent.EDIT
  value: Bar
}

type HistoryValue = HistoryFoo | HistoryBar

// in this situation, normally is an union type
type History = Foo | Bar

const Foo: FC = () => {
  const [foo, setFoo] = useState({})
  const historyRef = useRef<HistoryEvent>()

  const handleUpdate = () => {
    historyRef.current = {
      /* history */
    }

    setFoo(/* foo */)
  }

  // side effect
  useEffect(() => {
    if (someRef === HistoryEvent.EDIT) {
      // ex: maybe trigger something
    } else if (someRef === HistoryEvent.ADD) {
      // ex: maybe focus to something
    } else {
      // ex: maybe scroll to somewhere
    }

    return () => {
      //
    }
  }, [foo, setFoo])

  return <Bar foo={foo} />
}
```

### Rules

在開發專案時，兩者所要制定的規則 React 會比較多一點，像是如下：

```tsx
import { useCallback, useState, FC } from "react"

interface FooProps {
  id: number
}

const Foo: FC<FooProps> = ({ id }) => {
  const [bar, setBar] = useState(false)

  // using chaining
  const handleClick = useCallback(
    (id: string) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        // you can do another thing in here

        setBar(/* some kind value */)
      }
    },
    [setBar]
  )

  return (
    <>
      {/* you can choose what you like when coding onClick */}
      <button
        onClick={e => {
          // you can do another thing in here

          setBar(/* some kind value */)
        }}
      >
        Click
      </button>
      <button onClick={handleClick(id)}>Click</button>
    </>
  )
}
```

雖然效能提升不了多少，但整潔度我認為是有的，又或著 HOC 命名開頭都是 with 像是 withUserConfig...之類的，這部分可以看團隊想走哪種方式來做規範，主要會以統一性及易讀性為主。

### React Weired Part

如果讀者有去了解一下 React 的源碼，他其實是有做一些 trade off 的，最經典的例子就是 `setState(1)` 兩次，他會重新渲染兩次，儘管兩個值相等，直到第三次觸發也是 `setState(1)`，這次他才不會觸發重新渲染，坦白說，這邊會讓開發者感到非常困惑，為何同值你還要重新渲染？

這部分的操作在 React 叫做 eagerState，我本人也有在 React 的 issue 上加入討論 [link](https://github.com/facebook/react/issues/28779)，我非常建議可以稍微去看一下那些工程師做的解釋，不過這部分其實也是屬於比較少見及發生的情況，畢竟你為何要更新同樣的值？如果相同為何不 return 掉？

總而言之，這奇怪的情況在 Vue 及 Angular 是沒有的，根本原因在於 React 跟前面所提及的二者是不同的開發體系跟方式，React 在架構上是使用 Fiber，讀者可以去了解一下。

### Ask question

我相信在實作時，或多或少都會有實踐上的問題，現在相較於以前方便太多，問題可以直接丟給 ChatGPT 去做詢問，但坦白說你們公司若走得比較前面的話，隨便舉個例子，像是有做 Chrome 套件，如果有接觸這塊的話，應該會知道 Manifest v2 已經要準備汰換了，v3 是最新的，你問 ChatGPT v3 的問題，會出現鬼打牆的情況，畢竟 ChatGPT 在我寫這篇文章時只到 2022 年而已，如果你在 React 或 Vue 也有類似的問題出現，你就必須去詢問社群的人。

個人經驗是 Vue 的社群會比較友善，而且回覆速度會比較快，React 社群的確很龐大，但是不知道為什麼我覺得沒有那麼友善，且回覆時間通常比較長，有時會拿到比較制式化的回覆，再來是 React 比較多已經沒有在運維的 library，又或著很多可能還在使用 class component 或著 @flow (可以把它想成是 React 版本的 TypeScript)，這也間接代表說你的問題可能會更多，同時你也有可能會需要學習上述二者，至於 Vue2 Vue3 兩個基本可以看作另一套，但 Vue2 已經於 2023 年底 EOL，印象中可以付費讓核心成員協助你，但大致上還是會希望你直接使用 Vue3。

### Conclusion

基本上，我個人其實覺得兩個寫起來差不多，大專案用 React，小專案用 Vue 這說詞，我覺得有點偏頗，我比較相信這種說法，一個好的工程師，請依據自己的需求去做使用才是正解，舉個例子：像是你今天有頁面要渲染大量資料且無法使用 Virtual Scroller，我會建議你選 Vue，Vue 在渲染這塊的效率是比較高的，如果今天你有需求要做動畫，尤其是接案，活動類的，我也會推薦你用 Vue，原生的還是比較香...等。

React 在運營的成本上也會提升不少，除了開發運維的時間成本會拉長，人力成本也是需要考量的，大多數 React 工程師價碼較高，相較於 Vue，但如果公司工程部門的體制很完善，且工程師也都是有經驗或經過篩選的，我覺得使用 React 是一個不錯的選擇，他在某些方面可以把東西寫得很精緻，會有越寫越舒服的既視感，又或著是公司今天有做 APP 跨平台的考量，React Native 也會香很多，新版本 [React 19](https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024) 也提升了很多，以往需要自己調控的東西，變成 React 在 Compile 階段時幫你做到，讓前端開發者又減少了更多心智負擔。
