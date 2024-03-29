---
title: AWS promote with Creative Coding TW
date: "2022-01-13T12:00:00.000Z"
description: 去年墨雨設計的主管請我幫忙寫一個 AWS 合作推廣的文章，於是我就開始撰寫一些我平時時常使用的功能，像是 IAM, S3, Route53, Lambda, CloudFront, Lightsail, EC2, RDS...等的功能，那也於近期正式上架到 Creative Coding TW 的站台上面了，雖然因為潤筆的關係及我認為有些內容對於沒接觸過 AWS 的會稍微較難，所以很多內容都刪除了，畢竟是推廣的文章，但能讓自己的東西擺出去給人看到，對於我來說還是感到很開心的一件事，畢竟我也不是什麼 AWS 特別厲害的人，大多數我都必須上網搜尋或詢問較專業的人來獲得解答；那這篇文章我會著重在“前端”工程師如何能踏進 AWS 領域的這部分來進行講述。
tags: ["aws", "promote"]
---

### Preface

Creative Coding TW 推廣文在這，[連結](https://creativecoding.in/2021/12/14/%e3%80%90-%e5%90%88%e4%bd%9c%e6%8e%a8%e5%bb%a3%ef%bc%9aaws%e5%b8%b6%e4%bd%a0%e5%9c%a8%e9%9b%b2%e7%ab%af%e9%a3%9b%e3%80%91/)，那我這邊是較沒被刪減及潤飾的版本。

什麼叫全端工程師，大部分人的印象是前端，後端及伺服器都會的菁英人才；但是他們真的都需要很厲害嗎？坦白說，我認為也沒有。在這眾多雲服務的年代，我個人認為厲害的全端工程師是他知道如何有效率的去處理大部分客戶或老闆交代的事情；舉個例子，今天你被要求要做一個簡單的 SPA 活動網站，然後客戶明確指定會有大流量的發生，但是你又不想要親自處理伺服器的問題，或許你就會去使用 AWS lambda serverless 的功能，直接使用 AWS 服務將你的需求處理好，避免將事情搞得太複雜...等，有時候費用甚至也相對比較親民。

我個人認為不斷地去接觸新的事物，對工程師來說多多少少都是有益的，像我自己近期因為案子跟興趣也有在接觸 3D 這方面的東西，花錢買了 Threejs Journey 的課程來學習，並實際運用進專案，因為案子所以有跟我的同事去學習更艱深一點的 AWS，**順帶一提我公司同事 Clarence 有出 AWS 相關的書籍，歡迎大家踴躍購買，[購買連結](https://www.tenlong.com.tw/products/9789864349203)**，我認為這些都是能讓前端工程師的你不斷學習的契機。

### Manager Master IAM

IAM (Identity and Access Management)，如其名，當你今天開始使用 AWS，你可以允許及拒絕使用者存取帳單資訊和工具的許可，你想要安全一點，登入時不只要輸入密碼也需要 MFA 的認證，甚至你想讓某些人也參與你撰寫許久的 AWS 專案，都可以透過 IAM 開設使用者來達到需求。

### Beautiful Warehouse

Amazon S3 (Amazon Simple Storage Service)，身為工程師在撰寫程式後，程式碼及檔案總是需要有地方擺放及歸納，S3 就是你的好幫手，你可以創建所謂的桶子(bucket)來歸納不同專案程式碼及檔案所想擺放的位置，並輕鬆透過使用者介面上傳檔案；進階一點你想讓你上傳的資料進行回朔，又或著上傳的圖片想供人觀賞，在 S3 也都可以進行實現。

### Hello, my name is XXX

Amazon Route 53 (Route 53)，當你今天想要上網搜尋 Google 這個網站，卻發現要打 `216.58.200.46` 一串看不懂的 IP，這時是不是會感到相當不方便呢？Route 53 有提供所謂的 DNS 服務 (Domain name service)，您可以註冊網域 (domain)，並可依據自己的需求添加子網域 (subdomain)，是不是感覺有點複雜，但其實只是 `http://monoame.com` 可以變成 `http://www.monoame.com`，使這兩個網址都可以導到墨雨的官網。

你也可以透過將前面所提到的 S3 服務，將 S3 所創建 Bucket 的名稱跟 Route 53 註冊的網域名稱設定成"**相同的**"，以利達到將這個桶子的內容歸屬在我這網域底下，設定完成後便可以透過你註冊的網域來瀏覽你倉庫內的資料。

這邊可以學習一下一些必須知道的小知識，是我自己的記法：

- **A** - 沒錯，就是我，前面有說這是一個 DNS 服務，也就是將某串數字對映到我身上
- **AAAA** - 成熟的我，原先的規格 (IPv4) 以及容納不下我了，我必須長大 (IPv6)
- **CNAME** - 我的綽號別名

上面這三個功能在 AWS 上面的調適，是我滿常使用到的功能。

### Lock your door

AWS Certificate Manager (ACM)，顧名思義，他是一個認證系統，你可以將你註冊的網域，加上憑證或金鑰，即所謂的 `http` 變成 `https` 保護你在 AWS 所部署的網站及應用程式。

更進階一點，你也可以將別人註冊的網域加到自己的網域內，當對方確認及驗證成功後，你就會有對方家的鑰匙，便可以將自己的東西透過下方所述的多拉 a 夢的任意門 (Amazon CloudFront) 部署過去該網域...等。

### Doraemon Door

Amazon CloudFront，在家看劇是一種消遣，但是當你看劇時如果頻頻跳出載入畫面，是不是多少讓人有點沮喪，那 CloudFront 提供了所謂的內容傳遞網路(CDN)的服務，它會利用離你最近的伺服器，並結合上述 S3, Route53, ACM...等功能，更快速的將資訊交付到你的手上，跟任意門一樣讓您跟您想存取的內容更靠近。

你也可以透過 CloudFront 達到指定桶子內的的功能，下面是我 S3 桶子內的結構

```
index.html
⎣ tw/index.html
⎣ jp/index.html
```

今天我想要我的網站能透過子網域切換語系，像是 `jp.monoame.com` 及 `tw.monoame.com` ，就可以使用 CloudFront 路徑功能來進行調試，指定內容相當的方便。

另外，一般來說 AWS 會幫你將你上傳的資料貯存 (cache) 住，每隔一段時間再重新跟原始伺服器提取新的檔案，以保障使用者能取得更好的效能及服務體驗，也能減少原始伺服器的附載；但如果這筆資料你真的想要進行修改，你可以透過 CloudFront Invalidation 的功能來將該資料快速進行修改，達到網頁更新的功能。

### Conclusion

上面這些功能學完之後你就可以當個小小的雲工程師了，是不是很令人心動，老闆給我 offer；那當然 AWS 還有許許多多的功能，像是 EC2、RDS、Lambda...等，如果你在實務上有需要使用到，都很值得各位去學習，**此外我也非常很建議你直接去官網看官方文章，會比我這邊經過簡化的敘述來的更加精準**。

最後來做個總結，我認為工程師這個行業簡單講就是遇到問題，我們就想辦法去解決，並去學習最合適的方法，你也不必說需要將 AWS 的所有功能都摸熟，我認為掌握一門工具，是在於使用的精不精準，假設今天 AWS 能為你的產品帶來更多的優勢，學習並了解它可能就是你必經的道路，畢竟，要怎麼收穫，先那麼栽。
