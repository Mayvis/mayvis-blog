---
title: Dockerize Nginx with SSL certification for React App
date: "2022-10-13T12:00:00.000Z"
description: 這篇文章主要在介紹在各個服務容器化得當下，該如何使用 nginx 並且添加自簽的 ssl 認證來部署 react app，使用 docker 及 docker compose。
tags: ["react", "docker"]
---

### Preface

相信各位網頁工程師當久了，多少會遇到要將服務容器化的需求，所以這篇文章就來簡單介紹，如何在各個服務容器化得當下，有效建立 nginx 並且添加自簽的 ssl 認證來部署 react app，使用 docker 及 docker-compose，此篇文章會希望你對 docker 有一定程度的理解，如果不懂的話，可以參考一些 docker 的基礎教學文章。

### Project structure

下方為我的前端專案架構，該專案使用 vite build，build 完之後會產生 dist 的資料夾檔案，我們會將該檔案移入 nginx 的 html 資料夾中。

```
.
├── public/
├── node_modules/
├── src
│   ├── App.tsx
│   ├── main.tsx
│   └── components/
├── types/
├── _data
│   └── members.yml
├── .git
├── .gitignore
├── .prettierrc
├── .prettierignore
├── .editorconfig
├── .eslintignore
├── .eslintrc.json
├── .env.development
├── README.md
├── package.json
├── pnpm-lock.yaml
├── nginx.conf
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── key.pem
├── cert.pem
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── index.html
```

### Nginx

下方提供一個簡單的 nginx.conf 的範例，請依自己的需求進行修改，像是 cors 的部分，可以使用 nginx 的 proxy_pass 來解決，或著某些頁面需要導向另一個頁面都可以透過 nginx 來進行設定...等。

```nginx.conf
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
  }
}
server {
  listen 443 ssl;
  server_name localhost;

  # 憑證與金鑰的路徑
  ssl_certificate /etc/nginx/cert.pem;
  ssl_certificate_key /etc/nginx/key.pem;

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
  }
}
```

自簽 ssl 憑證的部分我就不額外多做介紹，如果不知道如何產生的話，可以查詢 openssl 相關的文章來做，你也可以在容器內加入 cron job 來定期更新憑證。

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365
```

### Dockerize

首先先將不需要引入 docker 的檔案加入到 .dockerignore 中，避免 docker build 的時候，將不必要的檔案一起 build 進去。

```.dockerignore
.git
.gitignore
.DS_Store
.vscode
node_modules/
```

接著創建好 docker-compose.yml 檔案，並依據自己的需求跟規劃來進行建制，下方是一個簡單的範例，我們將 9090 的 port 號映射到有 ssl 的 443 port 號上面，使網頁能被正常預覽。

```docker-compose.yml
version: '3.9'
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_APP_URL: https://domain:8888
    ports:
      - 9090:443
```

最後創建 Dockerfile 檔案，並依據自己的需求跟規劃來進行建制，像是這專案是使用 pnpm，但以往我都使用 yarn 居多，所以流程多少有些不同，又或著是你可以使用 docker stage 的方式，先創建一個 node 的 image 將 react 專案 build 好後，再 COPY 複製到 nginx 的 image 內，並最終創建一個 container，且更為乾淨，那下方是兩個簡單的範例。

#### Single stage 範例

其實在測試時，我是先使用 Single stage 的方式來建制的，原因是他相較於 multiple stage 快很多😅，畢竟我只是要測試看看是否能跑起來及跑起來的結果對不對而已，來來回回等 multiple stage 建置好也須花費不少時間，所以滿推薦在 dev 時使用此方式。

```Dockerfile
# using nginx:alpine image
FROM nginx:1.23.1-alpine

RUN mkdir -p /usr/src/app

# setting working directory
WORKDIR /usr/src/app

# pass args into Dockerfile env variable
ARG VITE_APP_URL
ENV VITE_APP_URL=$VITE_APP_URL

# install dependencies
RUN apk update && apk add --update nodejs npm

# if you facing "When using COPY with more than one source file, the destination must be a directory and end with a /"
# COPY package*.json pnpm-lock.yaml .npmrc ./ <== add slash in the end
COPY package*.json pnpm-lock.yaml .npmrc .
RUN npm i -g pnpm && pnpm i --frozen-lockfile
COPY . .
RUN pnpm run build

# update nginx html
RUN rm -r /usr/share/nginx/html
COPY /usr/src/app/dist /usr/share/nginx/html

# remove the default nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

# replace with our own nginx.conf
COPY nginx.conf /etc/nginx/conf.d/

# copy the SSL certificate key to nginx
COPY cert.pem /etc/nginx/cert.pem
COPY key.pem /etc/nginx/key.pem

# export port 80 and 443
EXPOSE 80 443
```

#### Multiple stage 範例

相對於 single stage，此範例環境較為乾淨，但也較為耗時一點點，畢竟就多了一個階段，但如果你是在 prod 環境，我相信大部分的情況你會選擇此方式。當然也有特殊情況，舉例來說你的服務需一個一個安裝到相當多的機器內時，這時你就無法避免的須考量到空中編程(Over-the-air programming，縮寫 OTA)的情境，一台安裝1分鐘那1000台就是1000分鐘，若能縮減成一台30秒也就是500分鐘，是不是相對減少很多的時間，這邊就看你公司產品的走向來去決定。

```Dockerfile
# stage 1
FROM node:16.2.0-alpine as builder

RUN mkdir -p /usr/src/app

# setting working directory
WORKDIR /usr/src/app

# pass args into Dockerfile env variable
ARG VITE_APP_URL
ENV VITE_APP_URL=$VITE_APP_URL

# copy package.json and pnpm-lock.yaml and install dependencies
COPY package*.json pnpm-lock.yaml .npmrc .
# if you facing "When using COPY with more than one source file, the destination must be a directory and end with a /"
# COPY package*.json pnpm-lock.yaml .npmrc ./ <== add slash in the end
RUN npm i -g pnpm && pnpm i --frozen-lockfile
COPY . .
RUN PUBLIC_URL=/ pnpm build

# stage 2
FROM nginx:1.23.1-alpine

# update nginx html
RUN rm -rf /usr/share/nginx/html
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# remove the default nginx.conf
RUN rm -rf /etc/nginx/conf.d/default.conf

# replace with our own nginx.conf
COPY nginx.conf /etc/nginx/conf.d/

# copy the SSL certificate key to nginx
COPY cert.pem /etc/nginx/cert.pem
COPY key.pem /etc/nginx/key.pem

# export port 80 and 443
EXPOSE 80 443
```

最後運行 `docker-compose build`，build 完成後，`docker-compose up -d` 就可以啟動 docker 了，如果有需要可以使用 `docker-compose down` 來關閉 docker。

### Conclusion

我發現這種文章好像在網路上特別的稀缺，找不大到相關資料，所以我就寫了一篇，希望能幫助到有需要的人，如果有任何問題或是建議，歡迎在我的 github 發 issue 給我，我會找時間看，謝謝。
