---
title: Vue Admin Template
date: "2022-05-27T12:00:00.000Z"
description: 目前公司有許多後台管理的頁面，大部分都由小弟我使用 vue 來進行建置；而說到後台管理頁面，今天想來聊聊這部分，以及我在撰寫時遇到的眉眉角角。
tags: ["vue", "frontend"]
---

### Preface

現今有很多後端管理頁面的面板可以拿來做使用，前先年我都使用 element-ui 搭配 vue2 來進行建置，基本上就是從 element ui admin 來進行修改，但是隨著近幾年 TypeScript 越來越夯，我也被其能提供完整的提示信息給折服，所以目前公司專案我都改使用 TypeScript 來進行 coding，外加近期 vite 配 vue3 在開發上實在是很舒服。

這邊舉幾個，我比較喜歡的幾個 Vue 後端管理介面：

1. [naive ui admin](https://github.com/jekip/naive-ui-admin)

   尤雨溪推薦過 naive-ui 這組件，那我也於今年開始使用，如果喜歡 TypeScript 的工程師，非常推薦使用，入手難度比較高，作者封裝了很多東西，像是 js-cookie 作者改使用自行封裝的 Storage Class，Axios transformer...等。

2. [element ui admin](https://github.com/PanJiaChen/vue-element-admin)

   把這個擺在第二，是因為我相信有在用 Vue2 和 JavaScript 做後台管理介面的，很多都是臨摹這位作者的，我認為相當的有學習價值，可惜作者未打算升級至 vue3 及搭配 element plus，作者有在其他平台發布手摸手教學，可以[參考](https://juejin.cn/post/6844903476661583880)。

3. [element plus admin](https://github.com/jzfai/vue3-admin-plus)

   如果喜歡使用 element-ui 及 vue3，可以在網路上搜尋這關鍵字，基本上就是從原先的 element ui admin 升級上來，畢竟組件相同，只是改使用 element plus 組件(element ui vue3 的版本)，支援 TypeScript，可以自行至 Github 搜尋。

### Extract what you need

我相信工程師就是遇到問題，然後去解決問題，你可以自己思考如何獲得解答，也可以上網尋求解答，這就是為什麼我在前言把我最常使用的管理介面提出來，在撰寫後端模板時上面幾個有很好的參考價值。

### Dynamic Vue Router

做後台管理頁面其實比較麻煩的就是，動態路由這部分，路由必須是角色登入後，才能進行創建，而 Vue Router 也有支持這項功能，基本上教學可以觀看這幾篇[文章](https://juejin.cn/post/6844903478880370701)，並搭配 element ui admin 的程式碼，下面是路由守衛 Dynamic Vue Router 小小的範例。

Vue Router 這邊有小小的 warning bug，你使用 `next({ ...to, replace: true })`，去處理動態路由，雖然程式仍可以正常運行，但瀏覽器仍會有警示，警示訊息是：

> [Vue Router warn]: No match found for location with path "/page"

```typescript
// vue-router version: 4
import { usePermissionStoreHook } from "./../store/modules/permission"
import { Router, RouteRecordRaw } from "vue-router"
import { getToken } from "@/utils/auth"
import { useUserStoreHook } from "@/store/modules/user"
import { IUserInfoResponse } from "@/api/user/types"

const WHITE_LIST = ["/login"]

export function createRouterGuard(router: Router) {
  const userStore = useUserStoreHook()
  const permissionStore = usePermissionStoreHook()

  router.beforeEach(async (to, from, next) => {
    window.$loadingBar.start()

    const hasToken = getToken()
    const hasRole = userStore.getRole

    if (hasToken) {
      if (to.path === "/login") {
        next({ path: "/" })
        window.$loadingBar.finish()
      } else {
        if (hasRole) {
          next()
        } else {
          try {
            const { perm: permission, role } =
              (await userStore.getUserInfo()) as IUserInfoResponse

            const accessRoutes = (await permissionStore.generateRoutes(
              permission,
              role
            )) as RouteRecordRaw[]

            await new Promise<void>(resolve => {
              accessRoutes.forEach(accessRoute => {
                router.addRoute(accessRoute)
              })
              resolve()
            })

            const redirectPath = from.query.redirect || to.path
            const redirect = decodeURIComponent(redirectPath as string)
            const nextData =
              to.path === redirect
                ? { ...to, replace: true }
                : { path: redirect }

            next(nextData)
          } catch (error) {
            await userStore.reset()
            window.$message.error(error as string)
            next(`/login?redirect=${to.path}`)
            window.$loadingBar.finish()
          }
        }
      }
    } else {
      if (WHITE_LIST.indexOf(to.path) !== -1) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
        window.$loadingBar.finish()
      }
    }
  })

  router.afterEach(() => {
    window.$loadingBar.finish()
  })

  router.onError(error => {
    console.log("路由錯誤", error)
  })
}
```

### Pinia is your new friend

目前公司多數 Vue3 專案，有使用集中管理的 Vuex，我都慢慢地移除，並使用 Pinia。它簡化了許多事情，像是 mutation 的步驟可以直接省略，各個 Pinia Store 也可以單獨被提出來做使用...等，下面是小小的範例。

```typescript
// src/store/index.ts
import { createPinia } from "pinia"

const store = createPinia()

export default store
```

```typescript
// src/store/module/user
import { getUserInfo } from "@/api/user"
import { IUserInfoResponse } from "@/api/user/types"
import store from "@/store"
import { defineStore } from "pinia"

interface IUserState {
  role: string
}

export const useUserStore = defineStore({
  id: "user",
  state: (): IUserState => {
    return {
      role: "",
    }
  },
  getters: {
    getRole(): string {
      return this.role
    },
  },
  actions: {
    getUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then(response => {
            const { data } = response
            const { role } = data as IUserInfoResponse

            // 這遍省略 mutation 的步驟
            this.role = role

            resolve({ role })
          })
          .catch(error => {
            reject(error)
          })
      })
    },
  },
})

// 如果要在 vue 組件以外做使用，需要使用該方式。
export function useUserStoreWidthOut() {
  return useUserStore(store)
}
```

### Conclusion

其實後端管理介面滿好玩的，你可以處理到一些比較需要規劃性質的東西，熟悉 naive-ui，element-plus 之類方便的組件，比較奇怪需要驗證的路由、複雜的表單、各式各樣的圖表，配合使用 echart.js, chart.js...等。
