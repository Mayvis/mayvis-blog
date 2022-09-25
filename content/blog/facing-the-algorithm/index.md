---
title: Facing the algorithm
date: "2022-09-25T12:00:00.000Z"
description: 當工程師也幾年了，在過程中，碰到越來越多複雜程式問題，也越來越常遇到無法透過第三方套件來進行實踐，畢竟功能較為獨特，大部分都必須一步一腳印地把功能刻出來，像是該如何實踐網頁的上一步，下一步(redo, undo)動作，如何搜尋文字並將其標註起來，文字編輯器(contenteditable)...等，今天文章想來講一下，搜尋文字並將其框選起來的功能。
tags: ["javascript", "frontend"]
---

### Preface

首先為何要實踐這個功能呢？現在網頁的一些元件越來越長，如果單純只是將東西渲染出來其實效能是還好的，但是如果每個都要能進行修改呢？或著長元件裡面每個元件都比較複雜的功能呢？畢竟越多複雜的功能，便會造成網頁越來越卡頓，而假設卡頓真的出現了，要如何優化呢？

在前端的技術中，有一個技術叫做 virtual scroller 的技術，簡單來講，就是滾到哪渲染到哪。沒在範圍內的元件就會進入回收的機制中，讓頁面因為只渲染一部分而變得更快，如果比較不理解，可以參考 google developer 於 2018 的 youtube 上的 [介紹](https://www.youtube.com/watch?v=UtD41bn6kJ0)。

<img src='../../../src/assets/virtual-scroller.png' alt='virtual scroller'>
<br>
<br>

好的，有得必有失，由於只渲染一部分，網頁內建的搜尋文字，就無法使用了😭，因為搜尋出來的結果不是真正的結果，這就是為何必須要實踐這個功能的原因，_題外話，專案我目前是一次性撈取所有的 json 檔案，如果使用情境是動態加載的，就必須搭配後端來獲取相關資料。_

### Mental models

我目前解決該問題的想法有兩種，一種是點擊下一步的當下計算結果，第二種是在你輸入搜尋文字的當下，就會將資料進行處理，就看你喜歡哪種模式了。

第一種的思路，程式結構會是這樣的：

```javascript
const arr = [
  { id: 1, text: 'hello world' },
  { id: 2, text: 'beautiful day' },
  { id: 3, text: 'nice view' },
  { id: 4, text: 'time to say hello' },
  { id: 5, text: 'hello world hello' }
]

const params = {
  keyword: 'hello',
  index: 0,
  pos: 0
}

// 有興趣的各位可以試試該如何實踐該項功能
function search() {
  //
}

// 觸發的當下才進行運算
search() // { pos: 0, text: 'hello world' }
search() // { pos: 12, text: 'time to say hello' }
search() // { pos: 0, text: 'hello world hello' }
search() // { pos: 12, text: 'hello world hello' }
```

第二種思路是，程式結構會是這樣的：

```javascript
const arr = [
  { id: 1, text: 'hello world' },
  { id: 2, text: 'beautiful day' },
  { id: 3, text: 'nice view' },
  { id: 4, text: 'time to say hello' },
  { id: 5, text: 'hello world hello' }
]

const params = {
  keyword: '',
}

// 可以撰寫一下如何使用 getResult 來取得結果
function getResult() {
  //
}

// 有興趣的各位可以試試該如何實踐該項功能，也可以趁機學習一下 Proxy 物件
const handler = {
  get(target, key) {
    //
  },
  set(target, key, value) {
    //
  }
}
const proxy = new Proxy(params, handler)
proxy.keyword = 'hello' // 修改 keyword 的值，觸發 proxy set 機制

// 可以使用 computed properties 產出下方的 array 而 search 只是去變更你是要第幾個而已
// 這樣的好處是，你可以在輸入文字的當下就進行處理，後續只要添加上一筆，下一筆的功能就可以了，不用再去處理資料
console.log(result)
// [
//   { index: 0, pos: 0, text: 'hello world' },
//   { index: 3, pos: 12, text: 'time to say hello' },
//   { index: 4, pos: 0, text: 'hello world hello' },
//   { index: 4, pos: 12, text: 'hello world hello' } 
// ]
```

### First solution

```javascript{11,16-35}
const arr = [
  { id: 1, text: 'hello world' },
  { id: 2, text: 'beautiful day' },
  { id: 3, text: 'nice view' },
  { id: 4, text: 'time to say hello' },
  { id: 5, text: 'hello world hello' }
]

const params = {
  keyword: 'hello',
  index: -1,
  pos: 0
}

function search() {
  const len = arr.length
  if (len === 0) return []

  for (let i = 0; i < len; i++) {
    if (i > params.index) {
      // using indexOf second startIndex params to find the next keyword
      const res = arr[i].text.indexOf(params.keyword, params.pos)
      const endPos = res + params.keyword.length
      if (res !== -1) {
        // change params to next startIndex position
        params.pos = endPos

        return { pos: res, text: arr[i].text, index: i }
      } else {
        // if can't find text, then we change the index and position for next iteration
        params.index = i
        params.pos = 0
      }
    }
  }
}

// 觸發的當下才進行運算
search() // { index: 0, pos: 0, text: 'hello world' },
search() // { index: 3, pos: 12, text: 'time to say hello' }
search() // { index: 4, pos: 0, text: 'hello world hello' }
search() // { index: 4, pos: 12, text: 'hello world hello' } 
```

### Second solution

第二種情形步驟是要去監控 params.keyword 的修改，接著先產出含有 keyword 的陣列，程式碼如下：

```javascript{15-34,38-50}
const arr = [
  { id: 1, text: 'hello world' },
  { id: 2, text: 'beautiful day' },
  { id: 3, text: 'nice view' },
  { id: 4, text: 'time to say hello' },
  { id: 5, text: 'hello world hello' }
]

const params = {
  keyword: '',
}

// 順帶一提，你也可以使用遞迴的方式來實踐該功能，不一定要使用 while
function getResult() {
  if (arr.length === 0) return []

  let flag = true
  let count = 0
  let pos = 0
  while(flag) {
    const data = arr[count]
    if (!data) {
      flag = false
      break
    }
    const index = data?.text.indexOf(proxy.keyword, pos)
    if (index !== -1) {
      result.push({ index: count, pos: index, text: data.text })
      pos = index + proxy.keyword.length
    } else {
      pos = 0;
      count++
    }
  }
}

const handler = {
  get(target, key) {
    return target[key]
  },
  set(target, key, value) {
    if (key in target) {
      target[key] = value

      // side effect 實作
      if (key === 'keyword') {
        getResult()
      }
    }
  },
}

const result = []
// Proxy 監控的對象必須為物件
const proxy = new Proxy(params, handler)

proxy.keyword = 'hello'

console.log(result)
// [ 
//   { index: 0, pos: 0, text: 'hello world' },
//   { index: 3, pos: 12, text: 'time to say hello' },
//   { index: 4, pos: 0, text: 'hello world hello' },
//   { index: 4, pos: 12, text: 'hello world hello' } 
// ]
```

最後再寫一個如何在 array 進行上一步下一步的功能，便可以將功能實作完成。

### Selection the text

首先由於你已經知道如何找到該文字，那麼接下來就是如何用 JavaScript 選取該文字，目前查找到最好的教學是這個 [連結](https://javascript.info/selection-range)，可以參考一下。一般情況，你必須使用 `Selection` 及 `Range` 來達成。但因為我們是選取 input 內的字詞，可以直接使用 `setSelectionRange` 來達成，_這邊需要注意假使 virtual scroller 由於回收機制，尚未將資料渲染出來，你可能會抓取不到 dom，可以用 `promise` 搭配 `setTimeout` 來解決該問題。_

```javascript
async function selectText(start, end) {
  await new Promise((resolve) => {
    resolve(setTimeout(() => {
      const dom = document.querySelector(`#input-${id}`)
      dom.setSelectionRange(start, end)
      dom.focus()
    }, 400))
  })
}
```

### Conclusion

我自己在撰寫該專案時，其實是使用 Vue，它有很棒的 computed properties 功能及其 cache 的機制，來增進效能，並不會直接使用到 Proxy 物件，但我想也可以作為參考，因為其實 Vue3 底層其實就是運用 Proxy 物件，而 Vue2 是使用 Object.defineProperty 的功能來進行實作，React 的話可能要親自實作 computed properties 的機制，可以參考 Robin Wieruch 的 [文章](https://www.robinwieruch.de/react-computed-properties/)，我記得 Kent C. Dodds 也有寫過一篇，但我找不到了，如果有人知道可以到 github 發 issue 告訴我，謝謝。

如果有興趣可以試著再把第一種解法的上一步寫出來，我只做了下一步的功能，這就留給讀者各位啦，對不起我太懶😉，關鍵點應該是倒著 loop 回來。

_解決問題的方式有很多種，我的不見得是最佳解，也許有更好的解法，或許是使用正則表達式，或許是某個特殊的演算法，可以增進些許效能...等，希望讀者會有所收穫。_

最後，話說 virtual scroller 這技術，據說好像是某些公司面試的考題，或許有機會也來寫一篇相關的文章🧐。
