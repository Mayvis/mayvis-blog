---
title: AWS Elastic Beanstalk Strapi Deploy
date: "2024-02-18T12:00:00.000Z"
description: 此篇主要是介紹如何將 Strapi 部署到 AWS Elastic Beanstalk 上面的流程，快速地打造 Strapi 的後台，影片是我之前錄的，主要是我想自己留存，也希望能教導公司後續的工程師如何去實作這部分有所幫助。
tags: ["aws"]
---

### Process

請注意，該專案我們有使用 AWS RDS 服務，且也預先創建好，並已填在環境檔中，所以能直接連到資料庫，另一種我印象中，則是你沒有預先創建好，而是後續才進行 RDS 的設定，這種你就要去 EB 控制台，網頁有個區域能添加 RDS 及環境檔去做設定，這部分我有看到教學，所以我就不過多解釋了，請依自己的需求來做修改。

<iframe width="560" height="315" src="https://www.youtube.com/embed/p9Vd-zm4vXw?si=9w4YRXAhQLaQb2uZ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### Conclusion

第一次錄這種教學影片，同事後來學習了一下，也成功將 Strapi 部署到 AWS EB 上，算是滿欣慰的。

有句話說，越懶的人才是更好的工程師，你也可以搭配 github actions workflow，接著在推 git 時，先使用 ECS 服務建置 Docker Image 並推到 ECR 及最後重建 EB，據說我的同事在其他專案後來有做，這部分我就沒參與到了，有興趣的話可以自己嘗試看看。
