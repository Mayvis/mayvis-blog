---
title: Cookie vs LocalStorage vs SessionStorage
date: "2022-09-21T12:00:00.000Z"
description: 在操作網頁時，我們常常需要儲存使用者的資訊，像是使用者的登入狀態、使用者的偏好設定...等，而這些資訊我們會將其儲存在 Cookie，LocalStorage 或是 SessionStorage 中，那麼這些功能究竟有什麼差別呢？
tags: ["javascript"]
---

### What is Cookie

_Cookie 我個人認為比較偏向是伺服器與瀏覽器之間的溝通。_

1. Cookie 只能儲存少量的資料，最高只可存 **4096 bytes**。
2. Cookie 提供了一些原生的設定如下，這些設定會在你發送 request 至 server 時帶上。
   - `Domain` 和 `Path`，定義了 Cookie 的範圍，告訴瀏覽器 Cookie 屬於哪個網站。
   - `Expires` 和 `Max-Age`，定義了 Cookie 瀏覽器應該刪除 Cookie 的時間。
   - `Secure` 和 `HttpOnly`，前面旨在將 Cookie 加密，使瀏覽器僅能通過加密的方式連接使用 Cookie，後者則是要求瀏覽器不能通過 HTTP 或 HTTPS 以外的渠道使用 Cookie。
3. 由於會攜帶在 HTTP 中，保存過多數據會帶來效能問題。
4. 關閉瀏覽器後失效。

可以使用原生 `document.cookie` 來撰寫 cookie，但現在已經有更方便的套件，可以使用像是 js-cookie，react-cookie，next-cookie...等套件，來操作 Cookie，這些套件都是經過封裝，並提供了更方便的操作方式。

適合場景：儲存用戶訊息，讀取判斷用戶是否登錄...等。

```js
const expiredAt = new Date(9999, 0, 1).toUTCString()
document.cookie = `name=Mayvis; expires=${expiredAt}; path=/; domain=mayvisblog.com; secure; httponly`
```

### What is LocalStorage

_LocalStorage 的資料緩存是保存在物理硬碟中，數據不會隨著網頁窗口關閉或著瀏覽器關閉而消失，除非手動刪除。_

1. LocalStorage 可以儲存大量的資料，不同瀏覽器儲存大小皆有不同，但大致最高可存 **5MB - 10MB**。
2. 儲存方式為 key-value，key 為 string，value 為 string。
3. 該資料不會過期，除非手動刪除，否則永久保存。
4. 僅在瀏覽器保存，不參與 Server 溝通。
5. 關閉瀏覽器，資料仍會保存著。

相關 API 使用方法可以參考 [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)。

適合場景：網站個人偏好設定、管理購物車，或著網頁遊戲產生較大的數據...等。

```js
localStorage.setItem("name", "Mayvis")
localStorage.removeItem("name")
```

### What is SessionStorage

_SessionStorage 的資料是保存在網頁窗口的進程內存貨線程內存中的，當網頁視窗關閉的時候(on tab close)，SessionStorage 的資料將會被清除。_

1. 同 LocalStorage 可以儲存大量資料，不同瀏覽器儲存大小皆有不同，但大致最高可存 **5MB**。
2. 儲存方式為 key-value，key 為 string，value 為 string。
3. 資料僅在同一個視窗(tab)中有效，不同視窗(tab)之間的資料是隔離的。
4. 資料在關閉視窗(tab)後會被清除。
5. 僅在瀏覽器保存，不參與 Server 溝通。

相關 API 使用方法可以參考 [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)。

適合場景：同一個視窗，較複雜的表單，有很多 Modal 之類的跳窗，建置時，為提升用戶體驗，往往會需要將使用者輸入的資料 cache 住...等。

```js
sessionStorage.setItem("name", "Mayvis")
sessionStorage.removeItem("name")
```

## Conclusion

|                    | Cookies            | LocalStorage | SessionStorage |
| :----------------- | :----------------- | :----------- | :------------- |
| Capacity           | 4kb                | 5mb - 10mb   | 5mb            |
| Browsers           | HTML4/HTML5        | HTML5        | HTML5          |
| Accessible from    | Any window         | Any window   | Same tab       |
| Expires            | Manually set       | Never        | On tab close   |
| Storage Location   | Browser and server | Browser only | Browser only   |
| Sent with requests | Yes                | No           | No             |

工程師在撰寫程式碼或使用工具時，要盡可能地去理解功能為何，為何要使用該功能，確保應用場景是合適的，這也是為什麼我想要撰寫這篇文章的緣故，因為的的確確容易會搞混，希望各位閱讀完該文章後，能增強你對 Cookie，LocalStorage 及 SessionStorage 的理解。
