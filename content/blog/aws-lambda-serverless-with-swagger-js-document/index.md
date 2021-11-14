---
title: AWS lambda serverless with swagger js document
date: "2021-11-14T12:00:00.000Z"
description: 手把手解釋及使用 AWS lambda serverless with swagger js document 來處理你在使用 aws serverless 時，同時可以透過 jsDoc 來產生API文件。
tags: ["aws", "server", "backend"]
---

古人云：「工欲善其事，必先利其器」。我認為不論是任何工程師，都在找尋最適合自己的工具。
而現在由於專案越來越複雜，彼此之間分工合作大大小小的事情也越趨茁壯，放在網頁工程師的範疇的話，簡單講就是前端做前端的事情，後端做後端的事情，彼此之間不互相干涉，而當雙方要進行溝通時，文件就成了一個良好且必須的媒介。

所以撰寫好的 API 文件就成為一個好的後端必備的，那這篇文章我將介紹如何使用 serverless lambda 搭配 express 及 swagger ... 等套件來產生文件，方便在接案時，客戶若需我們接案方提供 API 文件的要求。

### Why I choose this way to achieve the goal

目前就我研究過的現成套件，都無法成功 host swagger 至 aws serverless lambda 上面，很大的原因就是 AWS serverless lambda 是透過所謂的 aws api gateway 這服務來 host 你的 API，但是一般來說 swagger 會需要自己 host 一個 port，網路上能查詢到解決這問題的資源也相當的少。

我最終在 aws 上找到這 [連結](https://serverlessrepo.aws.amazon.com/applications/ap-south-1/324900372515/aws-api-gateway-swagger-ui)，並將其改寫，使其可配合 swagger-jsdoc 並可簡單成功嫁接到 aws gateway 讓他能 host。

### Preparatory work

這邊會列出此次demo所使用的所有套件，方便您進行安裝。

```bash
# serverless part
npm i serverless-http

# express and swagger part
npm i express swagger-jsdoc swagger-ui-express cors
npm i -D @types/express @types/swagger-jsdoc @types/swagger-ui/express @types/cors
```

### Real Work

首先先創建 serverless http 的街口，並在 serverless.yml 內進行定義

```javascript
// 路徑為 src/api/index.js
const serverless = require("serverless-http");

module.exports.handler = serverless(require("./api"));
```

```yml
# serverless.yml
functions:
  api:
    handler: src/api/index.handler
    events:
      - http: ANY /
      - http: "ANY /{proxy+}"
    timeout: 15
```

第二步驟，創建 api bootstrap 並定義好 swaggerUI 及 swaggerJSDoc。 這樣設定再之後上 aws lambda 後，便可透過 https://<aws.lambda.url>/swagger/api-docs 來瀏覽文件。

```javascript
// 路徑為 src/api/api.js
const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const app = express();

// middle
app.use(cors())
app.use(express.json());

// swgger part
const swaggerDefinition = {
  swagger: "2.0",
  info: {
    title: "Serverless swagger jsdoc template",
    description: "Serverless swagger jsdoc template documentation",
    version: "1.0.0",
  },
}
const options = {
  swaggerDefinition,
  apis: ["./src/api/routes/*.js"]
}
const swaggerDoc = swaggerJSDoc(options);

app.use("/swagger",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDoc, {
    swaggerOptions: {
      url: 'api-docs'
    }
  })
);

// routes
app.use("/", routes);

module.exports = app;
```

第三步驟，創建 routes folder 並定義 swagger js document 文件相關的設定。

```javascript
// 創建 routes folder 路徑為 src/api/routes/index.js
const router = require('express').Router();

/**
 * @swagger
 * /api/v1/test:
 *   get:
 *     tags:
 *       - test
 *     name: Test
 *     summary: Test API
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Connection has been established successfully.
 */
router.get("/api/v1/test", async (req, res) => {
  res.status(200).json({message: "ok"});
});

module.exports = router;
```

### Conclusion

🆘這邊要注意，再搭配 serverless-webpack 時，會失效🆘，目前我還未釐清為何不行搭配 webpack 來進行使用，又或著是我寫法上有錯誤，如果有人有解法也歡迎寄信給我來討論。

~~目前我認為應該是因為 webpack 會移除 @swagger 的 comment 及路徑也會有所不同，但我有嘗試處理過，還是不行😅，之後若知道該如何處理會在更新這篇文章。~~

後來確認過是因為 swagger-ui-express 的問題，使用 webpack 之後會產生的問題，官方 [issue](https://github.com/scottie1984/swagger-ui-express/issues/90) 在這。最主要的原因就是 "swagger-ui-express uses the filesystem at runtime"，但我目前就算用 CopyWebpackPlugin 雖然本地端可以成功，但推上 aws 後還是沒辦法正常執行，之後若知道該如何處理會在更新這篇文章。🥲

github 連結在這 [連結](https://github.com/Mayvis/monoame-serverless-template)。

最後，希望讀者能從這篇文章有所收益。那我也會持續增進自己的技術。
