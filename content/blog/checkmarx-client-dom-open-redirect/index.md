---
title: Checkmarx Client DOM Open Redirect
date: "2025-06-02T12:00:00.000Z"
description: 今天來解決 Checkmarx Client DOM Open Redirect 網站源碼弱掃的 issue。
tags: ["checkmarx"]
---

### Preface

在開發前端 SPA 管理系統時，與第三方 SSO（Single Sign-On）整合是常見需求。此時，常會需要透過前端協助將使用者導向到其他網域。這類操作若未妥善處理，在使用像 Checkmarx 這類靜態檢測工具時，就可能被標記為 **Client DOM Open Redirect** 或 **Client DOM XSS** 的安全漏洞。

### What is Open Redirect

假設有一個網址是：

`https://facebooks.com?redirect=https://hacker.com`

使用者若未注意 facebooks 這個偽冒網域，很可能就會上當。若這個網站在接收到 redirect 參數後沒有妥善檢查，直接導向，就會讓使用者被轉送到 `https://hacker.com` 這樣的惡意站台，進一步進行釣魚攻擊。這就是典型的 **Client DOM Open Redirect**。

### What is Client DOM XSS

若應用允許使用者在 URL 中注入可執行的程式碼，例如：

`https://facebooks.com?exec=<script>console.log(1)</script>`

且前端或後端未妥善處理，就可能被觸發，導致攻擊者植入惡意腳本，這就是 **Client DOM XSS** 攻擊。

### How To Fix

所以比較好的做法是什麼呢？

透過後端導向(建議)✅，建議將跳轉邏輯移至後端，由伺服器發出 HTTP 302 redirect，並搭配白名單檢查可接受的 URL 來源：

```ts
app.get("/sso", (req, res) => {
  const redirect = req.query.redirect
  const allowedOrigins = ["https://qoo.com", "https://lol.com"]

  try {
    const url = new URL(redirect)
    // 當然你也可以做更嚴謹的驗證，這邊就請依據自己的需求去做修改
    if (allowedOrigins.includes(url.origin)) {
      return res.redirect(302, redirect)
    }
  } catch (e) {}

  res.status(400).send("Invalid redirect URL")
})
```

透過前端去導向，則需對參數預處理及設定白名單

```ts
// 這三種語法都能執行 javaScript，因此是不安全的
window.location.href = "javascript:console.log(1)"
window.location.assign("javascript:console.log(1)")
window.location.replace("javascript:console.log(1)")
```

```ts
function redirect() {
  // ssoLoginRedirectURL 建議從伺服器取得
  const redirectURL = new URL(ssoLoginRedirectURL)

  // 僅允許特定參數，避免 XSS，當然由於你允許了這些參數，後端也建議做好處理
  const allowParams = ["sso-token"]
  const currentParams = new URLSearchParams(location.search)

  for (const key of currentParams.keys()) {
    if (!allowParams.includes(key)) {
      currentParams.delete(key)
    }
  }

  // URLSearchParams.toString() 會自動做 encodeURIComponent 處理
  redirectURL.search = currentParams.toString()

  // ⚠️ Checkmarx 建議：請避免使用 window.location.href
  // 改用 assign 或 replace 以減少誤判
  window.location.assign(redirectURL.toString())
}
```

### Location 差異

| 方法    | 新頁面 | 影響歷史紀錄 | 備註                                                 |
| ------- | ------ | ------------ | ---------------------------------------------------- |
| href    | ✅ 是  | ✅ 是        | 靜態分析工具容易誤判為 Open Redirect 或 XSS 攻擊途徑 |
| assign  | ✅ 是  | ✅ 是        | 推薦使用方式，風險較低                               |
| replace | ✅ 是  | ❌ 否        | 推薦使用方式，風險較低                               |

**補充**：`assign` 及 `replace` 也有針對錯誤額外做處理。

如果呼叫 `assign` 或 `replace` 的 JavaScript 程式碼的來源（origin） 和 Location 物件所描述的頁面來源不同，就會拋出 SecurityError。這通常發生在程式碼來自不同的網域，也就是跨域（Cross-Origin）情況，及如果不是合格的網址，也會跳錯誤。

所以相比於 href 直接調用，`assign` 及 `replace` 安全性也相對比較高。

### Conclusion

- **後端轉址** 是最推薦的方式，可完全避免前端風險。
- **前端轉址** 若無法避免，請加入 URL 白名單檢查、允許參數清單，並過濾 javascript: 等可執行內容，避免產生 XSS 或 Open Redirect 風險。
