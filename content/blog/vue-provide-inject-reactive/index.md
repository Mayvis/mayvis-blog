---
title: Vue Provide Inject Reactivity
date: "2022-06-02T12:00:00.000Z"
description: 當網站越來越龐大，元件之間的耦合也會越來越多，測試也會越來越難複雜及難寫；今天我想來探討一下 Vue3 的 provide、inject 功能，及如何使他們能 reactivity，因為這是前端時常會遇到的問題。
tags: ["vue", "frontend"]
---

## The way you need to think

下方文章我會使用假設方式來進行敘述：

舉個範例，假設我有一個 table 他必須依照某個 form 的參數去做變動，你在第一時間可能會想出這樣的結構，但是這樣做究竟好嗎？

用這個角度來做思考，預設 form 裡面的邏輯很複雜，欄位很多，需要驗證很多欄位，某些欄位變動後可能需要戳 API ，亦或著是 input 需要 throttle ...等的功能來做不同的優化，而 table 這邊需要顯示的欄位也相當的多，這頁就會變得越來越長。

```jsx
<div>
  <form>...</form>
  <table>...</table>
</div>
```

### First refactor

鑑於上面的描述，所以我將 form 跟 table 切割成兩個不同的元件，但是問題來了，如果不使用 pinia 或 vuex 集中控管，要如何將 `<SearchForm />` 裡面的參數帶到 `<ResultTable />` 中呢？

如果較熟悉 React 的，可能馬上就知道答案了，答案是，你必須要再父層去定義傳到個物件的參數，接著用 props 的方式傳遞下去，在 Vue 亦同，差別在於後續必須使用 defineEmits 的方式 dispatch 事件回到父層，最終將資料丟回來進行修改並使 `<ResultTable />` 重新渲染，看起來是不錯的方案。

```typescript
<script setup lang="ts">
import { reactive } from 'vue'
import SearchForm from './SearchForm.vue'
import ResultForm from './ResultTable.vue'
import { ISearchType } from './types'

const searchParams = reactive<ISearchType>({...})
</script>

<template>
  <div>
    <SearchForm :searchParams={searchParams} />
    <ResultTable :searchParams={searchParams} />
  </div>
</template>
```

### Second refactor

但是假設今天 `<SearchForm />` 元件結構非常的深呢？在 React 中有個詞彙叫做 Prop drilling ，也就是當元件很深，你必須不斷地用 props 的方式向下傳遞，而 React 提供最基礎的解決方式就是使用 Context (這裡不探討 Redux, Apollo...等，額外的方式)，那在 Vue 中該如何處理該情境呢？

這時我們就必須探討到 Vue3 替代 React Context 的方案 provide 及 inject，只需在父層定義 provide 並在子層需要的地方進行 inject 就可以進行使用了，所以我們繼續將程式碼進行修改。

我們將程式改寫成以下，但是這麼做還有一個問題就是 `<ResultTable />` 不會重新渲染，儘管你在 `<SearchParams />` 元件有使用 v-model 雙向綁定。所以問題來了，那要如何做到將參數 reactivity 呢？

```typescript
// 父層
<script setup lang="ts">
import { reactive } from 'vue'
import SearchForm from './SearchForm.vue'
import ResultForm from './ResultTable.vue'
import { ISearchType } from './types'

const searchParams = reactive<ISearchType>({...})

provide('searchParams', searchParams)
</script>

<template>
  <div>
    <SearchForm />
    <ResultTable />
  </div>
</template>
```

```typescript
// SearchParams.vue
<script setup lang="ts">
import { reactive } from 'vue'
import { ISearchType } from './types'

const searchParams = inject<ISearchType>('searchParams')
</script>

<template>
  <form>
    <input v-model="searchParams.name">
  </form>
</template>
```

```typescript
// ResultTable.vue
import { reactive } from 'vue'
import { ISearchType } from './types'

const searchParams = inject<ISearchType>('searchParams')
</script>

<template>
  <table />
</template>
```

### Third refactor

其實很簡單，將 inject 的值帶入 computed 就好，接著再透過 watch 來做 side effect 的事件，因為 API 資料抓取的步驟是在 `<ResultData />` 內執行比較符合邏輯。

```typescript
// ResultTable.vue
import { reactive, computed } from 'vue'
import { ISearchType } from './types'

const data = ref<IData>([])

const searchParams = inject<ISearchType>('searchParams')

// 加入該行使 search 參數能響應式更新
const search = computed(() => searchParams)

// 透過 watch 來做 side effect 的事件
watch(search, async () => {
  await handleGetData() // 抓取資料
}, { deep: true })

async function handleGetData() {
  const { data: result } = await getData()
  data.value = result
}
</script>

<template>
  <table :data="data" />
</template>
```

### Small complain

Vue 官網其實也有相關敘述，但我個人認為不夠清晰，這個是[官網連結](https://vuejs.org/guide/components/provide-inject.html)，在官網範例中，provide 跟 v-model 剛好是在同一層，所以可以用 computed 包裝好再丟到 provide 內，不會有任何問題，但其實我個人實際撰寫時很少會將 v-model 跟 provide 放在同一個元件內，使用情境較少，若照官網寫法但是是將 v-model 放在子層，則會有問題。

### Conclusion

過程中你也可以搭配像是 `readonly`...等的 Vue 的函示來讓情境更為準確，做個總結，如果是小網站的話，我個人還是喜歡直接使用將所有東西都放在同一個元件內，在後續的迭代中，假設要寫測試，或出現問題才會做修正或重構，在做更精確的將元件分割，我個人比較不喜歡一開始就把事情複雜化，我個人比較喜歡當事情發生在去做處理，套句 Ryan Florence React Router 的作者在某一次 ReactConf 上所述：I don't really like to talk about the clean code, I like code that works.，最後希望讀者們都能有所收穫。

小記：從去年開始陸陸續續接觸 TypeScript、Vue3 到慢慢將公司某些前端專案從 Vue2 更新到 Vue3 TypeScript，到近幾個月又慢慢的開始玩一些我荒廢已久的 React，使用看看 Apollo...等，一些我之前接觸過，但遺忘很久的東西，總之擔任軟體工程師就是不停的學習唄。
