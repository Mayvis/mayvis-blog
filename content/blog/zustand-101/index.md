---
title: Zustand 101
date: "2024-10-30T12:00:00.000Z"
description: 距離上次寫文章，又過了一陣子，主要是公司最近一兩個月實在是滿忙的，一坐起來，不是去廁所的路上就是下班，這次想說來寫一下 zustand，一個管理狀態的 lib，現在在 React 群裡，是真心滿夯的，畢竟就真的很簡單可以做使用，相較於 react-redux。
tags: ["react"]
---

### Preface

React 相較於 Vue，在集合管理狀態這邊，他有更多的選項，Vue3 目前官方僅推薦 pinia，vuex 則是可以使用在 Vue2 上，React 則多了 react-redux、recoil、zustand、mobx...等，每個都有每個的特色，可以依據自己的需求去選擇。

這篇文章會著重在 zustand 上，如果是中小型專案，沒有需要太複雜的狀態管理，zustand 目前我認為是最容易運維的。

### Create a store

下方是一個很簡單的登入範例，zustand 有一個亮點就是在處理 promise 這塊，他是可以直接兼容的，不用像 react-redux 還要使用 thunk API，題外話，基本上體感寫起來很像 Vue3 的 pinia。

```ts
import { create } from "zustand"
import { type LoginData } from "@/api/user-type"

export interface UserState {
  token: string
  name: string
  nickname: string
  login: (by: LoginData) => Promise<void>
  getInfo: () => Promise<void>
  logout: () => void
}

export const useUserStore = create<UserState>(set => ({
  token: "",
  name: "",
  nickname: "",
  login: async (data: LoginData) => {
    //...
  },
  getInfo: async () => {
    //...
  },
  logout: () => {
    set({
      token: "",
      name: "",
      nickname: "",
    })
  },
}))
```

```tsx
import { useUserStore } from "@/store"

function App() {
  const { token, name, nickname, logout, login, getInfo } = useUserStore()

  // your login process...

  return <div>...</div>
}

export default App
```

假設你的 store 也有儲存在 cookie，或著 localstorage，這邊可以這樣在做修改。

```ts
import { getToken, setToken, removeToken } from "@/lib/auth"

export const useUserStore = create<UserState>(set => ({
  token: getToken() || "",
  name: "",
  nickname: "",
  login: async (data: LoginData) => {
    //...

    setToken(token, expiration)
  },
  getInfo: async () => {
    //...
  },
  logout: () => {
    removeToken()

    set({
      token: "",
      name: "",
      nickname: "",
    })
  },
}))
```

### Using with devtool

zustand 是可以直接使用 react-redux 的瀏覽器套件，但需要額外再 create 內在包一層。

```ts
import { devtools } from "zustand/middleware"
// import { toast } from "sonner"

export const useUserStore = create<UserState>()(
  devtools(
    set => ({
      token: getToken() || "",
      name: "",
      nickname: "",
      login: async (data: LoginData) => {
        try {
          const { token, expiration } = await loginUser(data) // login user

          setToken(token, expiration)
          set({ token }, false, "login/success")
        } catch (error) {
          console.error(error)

          // 示意：也可以使用 toast 去告知使用者
          // toast.error("登入失敗", {
          //   description: "請檢查帳號密碼是否正確",
          //   closeButton: true,
          // })
        }
      },
      getInfo: async () => {
        try {
          const { data } = await getUserInfo() // fetch user info

          const { name, nickname } = data

          set(
            {
              name,
              nickname,
            },
            false,
            "getInfo/success"
          )
        } catch (error) {
          console.error("getInfo error: ", error)

          // 示意：也可以使用 toast 去告知使用者
          // toast.error("驗證失敗", {
          //   description: "請重新登入",
          //   closeButton: true,
          // })
        }
      },
      logout: () => {
        removeToken()

        set(
          {
            token: "",
            name: "",
            nickname: "",
          },
          false,
          "logout/success"
        )
      },
    }),
    { name: "UserStore", enabled: import.meta.env.MODE === "development" }
  )
)
```

### Immutable middleware

如果你的狀態是槽狀的 Array，很多組，例如：

```ts
const store = [
  {
    product: "Game",
    size: {
      xl: {
        price: 1000,
        sale: 50,
        detail: [
          {
            //...
          },
        ],
      },
      lg: {
        price: 500,
        sale: 70,
        detail: [
          {
            //...
          },
        ],
      },
      ml: {
        price: 200,
        sale: 80,
        detail: [
          {
            //...
          },
        ],
      },
      sm: {
        price: 100,
        sale: 80,
        detail: [
          {
            //...
          },
        ],
      },
    },
  },
  //...
]
```

且你恰好知道 immutable.js 這技術，這時你就可以做使用，由於 structure sharing (結構共享) 的特性，可以增加效能，做到部分更新。

```ts
// zustand 可使用 immer 來達到 immutable 的效果，需安裝 immer 套件
import { immer } from "zustand/middleware/immer"

export const useUserStore = create<UserState>()(
  immer(set => ({
    data: [...],
    increaseXLSale: (sale: number) => {
      set((state) => {
        state[0].size.xl.sale += sale
      })
    },
    decreaseXLSale: (sale: number) => {
      set((state) => {
        state[0].size.xl.sale -= sale
      })
    }
  }))
)
```

在 javascript 內，Object 及 Array，儲存的都是記憶體的位置 (reference)，不是真正的值，所以當你要對 Array 進行修改時，你在 react 基本上都會使用 spread operator 或著 map 去
淺拷貝這個 Array，如果資料結過比較深跟複雜，你則需要使用深拷貝，一旦要更新，就必須整個複製一份，這是相當消耗效能的，所以 Facebook 的工程師就提出了，immutable.js 這概念，他會
一層一層往上找，只對父層的支點做拷貝，流程可以參考如下，我在網路上找到的結構共享的示意圖：

<img src='../../../src/assets/zustand-101.gif' alt='immutable'>
<br />

參考：[官網](https://immutable-js.com/)

有興趣的讀者可以實際去上手玩玩看

```ts
const map1 = Immutable.Map({ a: 1, b: 2, c: 3 })
const map2 = map1.set("b", 50) // 由於 immutable 的特性，所以會返回一個全新的物件，並不會影響到先前的物件
map1.get("b") // 2
map2.get("b") // 50
```

這篇文章也有介紹 [immutable.js vs immer](https://blog.logrocket.com/immer-and-immutable-js-how-do-they-compare/)

### Advance Usage

當然還有些進階用法，假如你的 zustand，需要同時跟 useContext 內的資料進行共享，這時 zustand 也可以搭配 useContext 來做使用，這部分範例 [參考](https://awesomedevin.github.io/zustand-vue/docs/advanced/react-context)

```tsx
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

const store = createStore(...)

const StoreContext = createContext()

function App() (
  <StoreContext.Provider value={store}>
    ...
  </StoreContext.Provider>
)

function Component() {
  const store = useContext(StoreContext)
  const slice = useStore(store, selector)

  ruturn {
    <div>...</div>
  }
}
```

亦或著，你想在 react 外部做使用，

```ts
import { useUserStore } from "@/store/user"

const someFn = () => {
  useUserStore.getState().doSomething()

  //...
}
```

搭配 useRef 及 useEffect，做訂閱型的狀態更新，這部分範例是 [參考](https://awesomedevin.github.io/zustand-vue/docs/advanced/react-context)

```tsx
const useScratchStore = create(set => ({ scratches: 0, ... }))

function Component() {
  // 獲得初始狀態
  const scratchRef = useRef(useScratchStore.getState().scratches)

  // 掛載時連到 store，卸載時斷開，並透過 useEffect 獲取變化
  useEffect(() => useScratchStore.subscribe(
    state => (scratchRef.current = state.scratches)
  ), [])

  return (
    <div>...</div>
  )
}
```

### Conclusion

上面是我個人對 zustand 的理解，寫成筆記記錄一下，方便自己回顧，有些新的功能如果我有做到使用，我也會在補齊上去，javascript 的水真的很深啊。
