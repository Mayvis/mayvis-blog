---
title: React Chrome Extension 101
date: "2024-12-11T12:00:00.000Z"
description: 最近終於忙到一個段落，一部分的心力在研究 tauri，在看 rust 及摸一下 swift，另一部分的心力在整理以前寫的一些專案，那這次來寫 React Chrome 套件 v3 版本的建置。
tags: ["react", "chrome-extension"]
---

### Preface

其實網路上有一些不錯的模板可以使用，像是 [這個](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)，使用這些模板的確可以提高開發效率，但是如果你今天是想將所有東西掌握在自己手上，又或著你不想要專案過於複雜，你 clone 下來還要去理解及調整，我個人在某種程度上還是喜歡自己建置。

那這次因為公司 Chrome 套件的專案沒有太過複雜，所以我是自己建置的。

### Install

首先先用 vite 去創建一個 react typescript 的專案

```bash
pnpm create vite react-chrome-extension --template react-ts
```

我這邊會以 popup 頁面為例，接著我會創建 pages 的資料夾，並建置 popup 的路徑，在裡面放置 index.html index.tsx popup.tsx...等，如果你要註冊 serviceWorker 你就創建一個資料夾裡面擺 index.ts 依此類推。

下面是範例及結構圖，請依據自己的需求

```
.
├── src
│   └── pages
│       ├── popup
│       │   ├── index.html
│       │   ├── index.tsx
│       │   └── popup.tsx
│       └── serviceWorker
│           └── index.ts
```

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>Chrome Extension</title>
  </head>

  <body>
    <div id="popup"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```

```tsx
// index.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import Popup from "./popup.tsx"

ReactDOM.createRoot(document.getElementById("popup")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
```

```tsx
// popup.tsx
import { type FC } from 'react'

const Popup: FC = () => {
  return (
    <div>Popup</div>
  )
}
```

### Setup Chrome Types

由於使用 typescript 需安裝 `pnpm install -D chrome-types`，並將 type 引入

```json{21}
// tsconfig.app.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "types": ["chrome-types"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### Setup Vite

接著我們需要將 Vite config 調整成我們需要的樣子，請依據自己的需求來做調整

由於會使用到 path，`pnpm install -D @types/node`

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

const rootDir = resolve(__dirname)
const srcDir = resolve(rootDir, "src")
const pagesDir = resolve(srcDir, "pages")

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(pagesDir, "popup", "index.html"),
        serviceWorker: resolve(pagesDir, "serviceWorker", "index.ts"),
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        assetFileNames: () => {
          return "assets/[name].[ext]"
        },
      },
    },
  },
})
```

這樣設置後當 vite build 後，dist 資料夾內就會得到類似這樣的結構

```
.
├── src
│   └── pages
│       ├── popup
│       │   ├── index.html
│       │   └── index.js
│       └── serviceWorker
│           └── index.js
```

### Manifest and Logo

接著我們在 public 資料夾內，創建 manifest.json 並調整成 v3 的需求，並也將 logo 放置在 public 資料夾內。

```json
{
  "name": "Chrome-Extension",
  "description": "Chrome Extension",
  "version": "0.0.1",
  "manifest_version": 3,
  "icons": {
    "16": "logo_16.png",
    "48": "logo_48.png",
    "128": "logo_128.png",
    "512": "logo_512.png"
  },
  "action": {
    "default_icon": {
      "16": "logo_16.png",
      "48": "logo_48.png",
      "128": "logo_128.png",
      "512": "logo_512.png"
    }
  },
  "background": {
    "service_worker": "src/pages/serviceWorker/index.js",
    "type": "module"
  },
  "permissions": ["storage", "tabs", "tabCapture", "activeTab"],
  "host_permissions": ["http://*/*", "https://*/*"]
}
```

在運行 build 時你的 dist 資料夾就會有類似的結構

```
.
├── src
│   └── pages
│       ├── popup
│       │   ├── index.html
│       │   ├── index.tsx
│       │   └── popup.tsx
│       └── serviceWorker
│           └── index.ts
├── manifest.json
├── logo_16.png
├── logo_32.png
├── logo_48.png
├── logo_128.png
└── logo_512.ts
```

如果設置正確，我們就可以在 Chrome 擴充管理頁面執行載入未封裝項目，你的套件就會成功載入，如果無法載入請再檢查是否有誤，就我自己個人經驗，大部分是 manifest 有誤。

掛載擴充套件成功後，每次運行 `pnpm run build`，reload 套件就可以看到新的樣式，相當的方便，如果要自動化，你也可以將 `pnpm run build` 加到你的 script 內，安裝 concurrently，達到 hmr 套件的效果，這部分我就沒有多加贅述，有興趣可以參考上方提供的模板去看他是怎麼達到這效果的，由於我的專案比較簡單並不需要這種功能。

### Tailwindcss with Shadcn UI

這部分比較屬於個人需求，由於我們公司的樣式大部分是使用 Shadcn UI，所以也要安裝 tailwindcss

1. 運行 `npm install -D tailwindcss postcss autoprefixer`
2. 運行 `npx tailwindcss init -p` (如果使用 pnpm 會建議使用 pnpx，不然有時候會有錯，ex: [vite:css] Failed to load PostCSS config (searchPath: /Users/xxx/c/react-chrome-extension): [Error] Loading PostCSS Plugin failed: Cannot find module '/Users/chenwen/c/react-chrome-extension/node_modules/.pnpm/sucrase@3.35.0/node_modules/@jridgewell/gen-mapping/dist/gen-mapping.umd.js')
3. 如果執行成功，他會幫忙創建 tailwindcss.config.js 及 postcss.config.js，接著我們創建 styles/global.css 的路徑，並引入到 popup 內做使用

```js
// tailwindcss.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/pages/popup/index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

```scss
// styles/global.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx{4}
// src/pages/index.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import "@/styles/global.css"
import Popup from "./popup.tsx"

ReactDOM.createRoot(document.getElementById("popup")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
```

4. 照著 Shadcn 安裝的步驟將所有東西設定好，就可以使用 tailwindcss 及搭配 shadcn 的元件，在你的套件內。

### Eslint

這邊也提供我很簡單的 eslint 設置，需安裝 prettier，eslint-config-prettier，eslint-plugin-prettier，eslint-plugin-react

```js
import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import eslintConfigPrettier from "eslint-config-prettier"
import prettier from "eslint-plugin-prettier"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": 0,
      "react/self-closing-comp": [
        "warn",
        {
          component: true,
          html: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-object-type": 0,
      "@typescript-eslint/ban-ts-comment": "off",
      "prettier/prettier": [
        "warn",
        {
          arrowParens: "always",
          endOfLine: "lf",
          jsxSingleQuote: true,
          printWidth: 80,
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: "all",
        },
      ],
    },
  }
)
```

### Conclusion

其實建置專案一開始會覺得很複雜，但是當你對每個套件及流程越來越熟悉後，使用起來其實會越來越簡單而且之後如果要改動，心智負擔也比較小。

擴充套件 v3 版本提供許多新功能，讀者可以用 react 去建置自己想玩的一些套件在瀏覽器上，像是目前 AI 很夯，所以就一堆人跑去開發輔助 ChatGPT 的套件，像是可以整理歸類...等，滿值得試試玩玩的，這邊也提供官網的 [教學](https://developer.chrome.com/docs/extensions/get-started#tutorials)，有興趣可以看看。
