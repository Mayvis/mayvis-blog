---
title: CSR, SSR, SSG
date: "2022-07-09T12:00:00.000Z"
description: 會想寫這篇，主要是想記錄一下，自己對於這些技術的概念，以及它們的作用；畢竟自己在公司比較偏向做後台管理介面及工具，基本上就是 CSR 用一用就好，也不太用去管網站 SEO 方面的優化，WebAssembly，Meta...等，但如果之後想要做 2c 方面的網站，可能就要使用到 SSR 和 SSG 的概念。
tags: ["concept"]
---

### Preface

此篇記錄一下自己對於 CSR，SSR，SSG 的相關知識，最近也在自學 React framework Next.js，增加自己對網站 2c 方面的相關知識，努力胡搞瞎搞中 🤪。

### CSR

CSR (Client Side Rendering)，客戶端渲染，簡單講就是，將渲染的過程通通交給瀏覽器去做處理，使用此種方式 SEO 會比較差一點，原因在於當使用者點進去該網頁時，瀏覽器才開始加載 JavaScript 的程式碼，一般來說適合 SaaS 的產品，網站工具，不需要 SEO 的 SPA 活動網站及後台管理頁面...等。

下方是一個簡單的範例，請參考：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    <div id="root"></div>
  </body>
  <script src="./bundle.min.js"></script>
</html>
```

##### 此種方式的優點在於：

1. 作用都於客戶端瀏覽器那邊才開始執行，對伺服器的負荷較小。
2. 第一次加載時速度比較慢，但是當加載完成時，速度是非常快的，使用者也可以使用 lazy loading 的技術或也可稱作 code splitting 減少第一次加載的時間，需要加載時才進行加載。
3. 由於幾乎都是透過 JavaScript 在操作前端 DOM 所以彈性上也比較好。
4. 若客戶 SPA 的網站需要較好的 SEO，React 可以使用 react-spa-prerender...等而 Vue 可以使用 prerender-spa-plugin...等預渲染套件，最後透過調適 webpack 來做優化。
5. 對第三方 JavaScript 套件兼容性較好。_(friendly compatible with third-party JavaScript code.)_
6. 如果不需要 SEO ，此種方式在開發上是最便捷且快速的。

##### 此種方式的缺點在於：

1. 載入時間會依據 bundle 的 JavaScript 增長。
2. 由於加載跟渲染都是在客戶端進行，對手機環境較不友善。
3. 儘管 Google Search Team 有對 CSR 加強 SEO，提供 _Second Wave Indexing_ 的技術，等待 JavaScript 的內容加載完成，未完成時會被丟入 rendering queue 中等待，但相比之下 SEO 還是比較差一點，不過後續可以期待 Googlebot Crawler 越來越好。

### SSR

SSR (Server Side Rendering)，伺服器渲染，簡單講就是，將產出來的資料在伺服器中先預處理並解析 HTML，完成後在傳送至客戶端，此種方式 SEO 是好的，因為 Googlebot 在解析網站時是可以得到網站頁面渲染的全部資訊而不用像 CSR，需等待 JavaScript 的載入完成才開始渲染。

SSR 會在伺服器啟動時運作，也就是我們俗稱的 runtime，當客戶端發送 html request 的請求進來，伺服器會依據請求的路徑及參數，打到相對應的 API 路徑，建構完後， HTML 才會回傳至客戶端，該特性，使其保有部分 CSR 的彈性，但我們後續介紹的 SSG 就必須在重新 rebuild 才可以達到相對應的效果。

下方是一個簡單的範例，請參考：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    <div id="root">
      <div class="container">
        <h1 class="title">hello world</h1>
        ...
      </div>
    </div>
  </body>
  <script src="./bundle.min.js"></script>
</html>
```

##### 此種方式的優點在於：

1. Googlebot Crawler 易理解，對 SEO 友善。
2. 由於在伺服器端渲染並解析 HTML，渲染速度快，且後續動態操作仍是交由 JavaScript 處理。
3. 由於渲染速度快，使用者瀏覽網站的體驗是好的。
4. 在手機上體驗較好，畢竟渲染步驟在伺服器端實踐，手機上不用額外處理。

##### 此種方式的缺點在於：

1. 由於在伺服器解析，如果網站資源較多或網站人流量較大時，會造成伺服器的負擔。
2. 當伺服器負擔較大時，會間接導致使用者瀏覽網站載入的速度較慢，影響使用者體驗。
3. 對第三方 JavaScript 套件兼容性較差。 _(may not compatible with third-party JavaScript code.)_
4. 若頁面的組成的來源不經常變動，會建議轉成 SSG，減少伺服器的負擔。

### SSG

SSG (Static Side Generation)，靜態網頁生成，簡單講就是，SSG 會在伺服器 build time 時產出 static HTML 及相對應資料的 json 資料，由於是靜態且是預先建立好的，所以可以被 CDN 的服務快取住，使用者瀏覽網站的體驗是好的；缺點是，假設行銷人員在後臺上架新的商品，由於網站在 build time 建構時已被寫死，所以上架的新商品並不會即時顯示在網站內，每次上架或更新資訊都必須 rebuild，不適合時常須更新的網站，像作者我現在寫部落格的網站，就是使用 Gatsby.js 的 SSG 功能進行建構，會在 public 資料夾內，產出一堆文章的 index.html 😅。

補充：目前 React 相關的框架 Next.js、Gatsby 有提供 SSG 功能，Remix 目前只有 SSR 的功能；而 Vue 可使用 Nuxt.js 提供的 SSG 功能。

##### 此種方式的優點在於：

1. Googlebot Crawler 易理解，對 SEO 友善。
2. 由於渲染速度快，使用者瀏覽網站的體驗是好的。
3. 在手機上體驗較好，畢竟渲染步驟在伺服器端實踐，手機上不用額外處理。

##### 此種方式的缺點在於：

1. 由於已被寫死，所以後續的更動每次都需要重新 build，不適合時常須更新的網站。
2. 假設頁面數量很多，網站規模很大，build 網站的時間會相當的長，而這時，可能就需要了解到 ISR (Incremental Static Regeneration)，簡單講該方式就是設定一個會重新驗證的 revalidate key 值，如果有 request 進來，就會在所設定的快取時間之後，重新產生新的頁面，在快取時間結束內若有新的 request 進來，ISR 會先返回之前 build 好舊有的 HTML，接著在伺服器再重新建構該頁，等下一次的 request 進來，便會回傳最新的 HTML 以利更新；更詳細的資訊，可以參考 [Next.js Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)。

### Conclusion

上面是我對 CSR, SSR, SSG 的一些理解，有上網去參考了一些資料，自己也趁機學習一下，加深印象。

那其實我認為大部分工程師的癥結點會在於說，究竟該使用哪種技術來架設網站且需要有不錯的 SEO，如果是熟悉 React 的工程師可能就會使用 Next.js，熟悉 Vue 的工程師可能就會使用 Nuxt.js，又或著是你熟悉 PHP 想使用 Laravel；我個人認為這些都沒有對錯，用自己熟悉的就好，除非你家主管有強制要求 😱。
