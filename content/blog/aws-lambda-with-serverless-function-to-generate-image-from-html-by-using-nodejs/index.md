---
title: AWS lambda with serverless function to generate image from HTML by using nodejs
date: "2021-07-11T12:00:00.000Z"
description: 手把手解釋及使用 AWS lambda with serverless function to generate image from HTML by using nodejs，簡單介紹原理，並讓你可以優雅的在伺服器端上產出圖片。
---

在後端使用 nodejs，令其產出 html，最終輸出成圖片，這過程一直是件不容易的事情，如果只是簡單的 html，css，及後端的一些資訊，還好做處理，但是如果客戶要求的是表單，表格，甚至是 canvas ...等，需要引用前端第三方套件，你又該如何處理呢？

基於上面這些問題，後端有許多好用的套件像是 [node-html-to-image](https://github.com/frinyvonnick/node-html-to-image) ...等套件，可以方便讓工程師使用，似乎一切都很完美，但是接下來，你聽到主管的後續需求是，請使用 aws lambda with serverless function，而非簡單的使用 aws ec2 來建制後端。

於是乎，突然間你意識到，美好總是短暫的。

## Good time is always short-lived. But why?

不知道各位有沒有寫過爬蟲，現在很多公司會將爬蟲的程式碼扔到雲上面，讓他固定時間去爬取相關的資訊，但是這技術是如何達成的？其實簡單來講，**就是在雲上面建置一個 chrome 瀏覽器**，並用程式定時去跑，讓頁面滾動，載入API，瀏覽頁面的 DOM，模擬人的動作，並抓取你所需要的資料，所以像是 selenium，scrapy 之類的，python 普遍的爬蟲套件，背後的原理其實都是在做相同的事情。

回到主題，所以 node-html-to-image 之類的套件也是在做相同的事情嗎？

是的，模擬一個瀏覽器 chrome，並用這 chrome 來做渲染，差別只差在，最終我們必須透過程式將頁面打印下來，所以當你將使用 node-html-to-image 類似這種套件的 serverless function 程式碼 deploy 至 aws 時，你會發現你的檔案將近300MB，而這也間接導致 aws 限制檔案大小的防禦機制將你的檔案視為無法上傳，罪魁禍首其實就是因為 chrome 的檔案過大。

下方是 aws serverless function 的[文檔](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)所述的限制條件：

| Resource                                    | Quota                               |
| :------------------------------------------ | :---------------------------------- |
| Deployment package                          | 50 MB (zipped, for direct upload)   |
| (.zip file archive) size                    | 250 MB (unzipped, including layers) |
|                                             | 3 MB (console editor)               |

## How to overcome the aws lambda upload size limit?

這邊你有幾種方式去克服這個問題，分別是：

1. 將 chrome 的執行檔，想辦法放到 aws s3 中，讓你 serverless 的程式碼可以確實執行。
2. 想辦法縮減 chrome 模擬器的檔案大小，使其可以上傳到 aws lambda 上。
3. 或許有更好的方式，但是目前我還不知道，這邊留給各位去做思考。

**本文章會著重於縮減 chrome 模擬器的檔案大小，使其可以上傳到 aws lambda 上**。

於是我開始著手開始搜尋 [Puppeteer](https://github.com/puppeteer/puppeteer) 這套件，nodejs 版本的 chrome 瀏覽器，在經過長時間搜尋後，我最終使用 [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda) 這套件，此套件的底也是 Puppeteer，它可以有效的將 chrome 打包成符合規定的檔案大小，打包的程式碼在其 github 上有提供，打包後可將其上傳放置於 aws lambda 的 layer 上面，程式碼如下：

```shell
git clone --depth=1 https://github.com/alixaxel/chrome-aws-lambda.git && \
cd chrome-aws-lambda && \
make chrome_aws_lambda.zip
```

上傳的方式可以參考此 [youtube](https://www.youtube.com/watch?v=i12H4cUFudU)，我覺得解釋得滿詳細的，那唯一不一樣的地方如下：

上傳後，路徑不用額外添加 `/opt/`
```javascript
const chromiun = require("/opt/chrome-aws-lambda");
```
請改成
```javascript
const chromium = require("chrome-aws-lambda");
```

### Write utility function to generate image

上傳完成之後，添加該 layer 至你的 serverless function 中，可以使用我下方的程式碼範例，你便可以輸出你想要的圖片了，順帶一提，這邊有使用 [handlebars](https://github.com/handlebars-lang/handlebars.js)，他主要的功能就是支援 html 引入參數的功能 `<div>{{ content }}</div>`，此範例中 content 會被編譯成你帶入的資料，類似簡單版的 vue 或 React，相當方便。

```javascript
const chromium = require("chrome-aws-lambda"); // this currently imported from lambda layer 
const handlebars = require("handlebars");

module.exports = async function (options) {
  const {
    html,
    content,
    output,
    selector = "body",
    puppeteerArgs = {},
  } = options;

  if (!html) {
    throw Error("You must provide an html property.");
  }

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  if (content) {
    const template = handlebars.compile(html);
    html = template(content);
  }

  await page.setContent(html, {
    waitUntil: ["load", "domcontentloaded", "networkidle0"],
  });

  // you can store it into image or just buffer, personally I preffer buffer,
  // because I can use s3.putObject directly upload file into my s3 bucket.
  const imageBuffer = await page.screenshot({
    type: "jpeg",
  });

  await page.close();
  await browser.close();

  return imageBuffer;
};
```

### Conclusion

現在的網頁服務各式各樣，客戶的需求也是五花八門，為了要滿足這些眾多需求，就必須靠許許多多的工程師去努力克服，而這也是我創建我自己的部落格的初衷之一。

這也是我創建這個部落格網站的第一篇文章，希望能透過解釋我現實中實際遇到的程式問題，並闡述我的想法及最終我是如何處理的方式，雖然不見得是最佳解，但是總歸希望能幫助到正在處理類似問題各位。

總之，網站還在持續用 Gatsby 建置新功能，目前先規劃的是下面這些功能。

1. Dark Mode Toggle Features
2. Markdown Typography 
3. Update Favicon Icon

主要是因為我的審美觀認為原先的主題不是那麼的好看，所以應該到時候都會做修改，那就下篇文章再見啦，如果我孵得出來的話。

如果有關於文章的任何問題，都可以點擊下方 mail 寫信給我。
