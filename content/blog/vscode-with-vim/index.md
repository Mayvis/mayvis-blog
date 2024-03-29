---
title: VSCode With VIM
date: "2021-09-26T12:00:00.000Z"
description: 當網頁工程師也幾年了，後端寫到前端，前端寫到後端，不算菜也不算老的一個階段，除了自己公司網頁例行的維護及新案子，我也用下班時間兼做接案的工作，算是一種斜槓吧，所以我今天想跟大家聊聊如何增加自己的工作效率這議題，這篇會著重在我使用 vim 與 VSCode，<del>雖然我本身是比較常使用 Jetbrains 的 IDE 啦😅，畢竟我有時需要寫到後端的 database，這時 VSCode 就顯得比較不方便一點，但是不得不說 VSCode 是一個很棒的 editor，我小案子還是滿喜歡使用它的️🙃。</del>，目前已全改用 VSCode 來進行開發，資料庫 GUI 使用 tableplus（需付費，若不想付費可以使用 Sequel Pro），專案上近期都是需要在遠端主機開發居多，VSCode 在這方面實在是做得很好。
tags: ["tool"]
---

### Preface

馬克斯曾說過："請專注在提高生產效率，而不是忙身上"，我自己認為，這是接案的一種信仰，坦白說，我自己也無法完全做到，我認為這是一件非常非常難的事情，跟處理機台必須要有固定的 SOP 不同，客戶的需求是會變動的，一些工程師或 PM 可能會說，那就做的"彈性"一點，但是何謂“彈性”，這又是一門有趣的議題了。

所以扣除掉 PM 能跟客戶周旋商討的部分，工程師的實力也沒太大的問題，那要在時限內快速進行交付，可能就需要去使用自己認為最適合自己的工具及熟悉工具的使用，而 vim 我認為是工具界的翹楚，雖然學習曲線一開始偏高，但是熟悉後，就是另一片天空了。

### Why VIM? Disadvantage

在推銷一件工具時，我會先希望你知道他的缺點是什麼，以及我自己使用上的經驗。

- 如果是使用原生 terminal (MacVim, NeoVim) 需要安裝一些套件，要使用 vundle，vim-plugin...等之類的套件來做安裝，也有可能要使用 lua 這程式語言，如果不想太繁瑣，可以直接安裝 vscode 或 jetbrains 的 IDE 然後直接安裝 vim 的套件就行。
- 因為我不是 windows 用戶，所以不太知道 windows 該如何設定。
- 一開始的學習曲線偏高，可能要練就不看鍵盤也可以流暢打字的能力，會比較好上手。
- 中英文切換我認為是 vim 的硬傷，但是使用久之後其實也還好。
- 有所謂的模式切換 Normal mode, Visual mode, Edit mode，需要去適應，這是 vim 的核心，簡單來說，選擇就是 Visual mode， 更新就是 Edit mode，普通情況位移或著需要額外的功能就是在 Normal mode 底下做事...等。
- 有時候需頻繁按某些按鍵尤其 <kbd>esc</kbd>，畢竟要多按按鈕就是麻煩，要移動就是必須切到 Normal mode 或 Visual mode...等。
- 自己使用下來，不太適合與 pug (jade) 進行使用，相較於 html，原因是沒有被 tag surround，所以我自己除接案之外都是使用 html 居多，外加現在 IDE 不論是套件的 autocomplete tag 或內建的都很方便，此外我本身除了 vue 也會寫 react 的 jsx 所以還是比較習慣有 tag。

  ```html
  <!-- surrounding by tag -->
  <div class="hello">Hello</div>
  ```

  ```jade
  .hello Hello // <=== not surrounding by tag
  ```

- 自己使用下來，不太適合與 sass 進行使用，相較於 scss、css，原因也是因為沒有 tag surround，但是可以用 <kbd>V</kbd> 整行的 Visual mode 去做處理，比起 pug 問題少很多，畢竟 css 就是一行一行的，雖然我自己除接案之外還是偏好使用 scss 居多。

  ```scss
  .hello {
    background-color: orange;
    color: orange;

    &::after {
      content: "";
    }
  }
  ```

  ```scss
  .hello
    background-color: orange
    color: orange

    &::after
      content: ""
  ```

### Why VIM? Advantage

在以前線上遊戲 MMORPG 還盛行時，尤其是 PVP (Player vs Player)，你需要快速施放某個法術給某個特定的使用者，所以可能會去設定很多快捷鍵，方便在遊戲遊玩時去做使用，而 vscode 的 vim 套件已經為大部分的使用者設定好了，那你需要做的就是去熟悉這些快捷鍵。

其實學習 vim 的大部分的人的初衷，就是讓工程師盡量地遠離滑鼠的使用，我自己認為，學成之後，打程式碼的速度是以 logN 的方式在做變化的，尤其是對"接案"非常有益。

下面是我常使用的指令，有點類似 cheat sheet，可以參考一下：

---

**位移**

左下上右 位移分別是 <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd>

較高階使用方式，可以將 line number 調整成 relative line number，接著使用 <kbd>20j</kbd> 便可以向下跳距離你原先 20 行，相反向上跳就是 <kbd>20k</kbd>，

如何以單字的方式來進行跳耀，對於 vim 的使用者來說會是 <kbd>w</kbd> ，如果是做英文網站，**這非常好用！！！**

如何以單字的方式**向後**來進行跳耀，對於 vim 的使用者來說會是 <kbd>b</kbd>

如何快速跳到第一行，對於 vim 的使用者來說會是 <kbd>gg</kbd>

如何快速跳到最後一行，對於 vim 的使用者來說會是 <kbd>G</kbd> (shift+g)

當畫面出現滾輪，你想將你程式碼的位置位移到畫面的中央，對於 vim 的使用者來說會是 <kbd>zz</kbd>

如何快速跳到該行最後一個字，對於 vim 的使用者來說會是 <kbd>$</kbd> (shift+4)

如何快速跳到該行第一個字，對於 vim 的使用者來說會是 <kbd>0</kbd>

---

**介面**

如何快速的新增視窗(pane)在右邊 <kbd>:vsp</kbd> (vertical split pane 的縮寫)

如何快速的新增視窗(pane)在下方 <kbd>:sp</kbd> (split pane 的縮寫)

如何在不同的 pane 之間進行跳耀？可以使用 <kbd>ctrl+w</kbd> <kbd>ctrl+w</kbd>，如果是向左可以使用 <kbd>ctrl+w</kbd> <kbd>ctrl+h</kbd>，向右可以使用 <kbd>ctrl+w</kbd> <kbd>ctrl+l</kbd>，依此類推

---

**模式**

如何回歸 Normal mode，對於 vim 的使用者來說會是 <kbd>esc</kbd> (左上角 esc，沒錯就是 esc 那顆按鈕)

如何切換至 Visual mode，對於 vim 的使用者來說會是 <kbd>v</kbd>，變可以使用 <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd> 來拖拉想選取的位置

如何切換至 Visual mode 並選擇整行，對於 vim 的使用來說會是 <kbd>V</kbd> (shift+v)

如何切換至 Edit mode，對於 vim 的使用者來說會是 <kbd>i</kbd>

---

**快捷鍵**

如何快速將 div 內的文字刪除或取代掉呢？ 對於 vim 的使用者來說答案會是 <kbd>cit</kbd> (change in tag 的縮寫) 會直接進入 Edit mode
或著 <kbd>dit</kbd> (delete in tag 的縮寫) 會維持在 Visual mode

```html
<div>hello world</div>
```

如何快速將 a tag 換成 button 呢？ 對於 vim 的使用者來說會是 <kbd>cst<</kbd> (change surrounding tag 的縮寫)

```html
<a>Link</a>
```

如何修改單個字？對於 vim 的使用者來說會是 <kbd>s</kbd>

如何快速刪掉整行，對於 vim 的使用者來說會是 <kbd>dd</kbd>

如果想刪除多行，可以使用 <kbd>number</kbd> + <kbd>dd</kbd>，舉例：<kbd>2dd</kbd>

如何複製文字呢？先按 <kbd>v</kbd> 切入 visual mode，用 <kbd>h</kbd> <kbd>j</kbd> <kbd>k</kbd> <kbd>l</kbd> 位移選取想要複製的文字，接著 <kbd>y</kbd> (yank 的縮寫)，按 <kbd>p</kbd> 貼上(paste 縮寫)

如何複製"單字"呢？先按 <kbd>v</kbd> 切入 visual mode，用 <kbd>w</kbd> 位移選取想要複製的文字，接著 <kbd>y</kbd> (yank 的縮寫)，按 <kbd>p</kbd> 貼上(paste 縮寫)

如何快速複製"整行"，對於 vim 的使用者來說會是 <kbd>yyp</kbd>

如何重複上一步驟，對於 vim 的使用者來說會是 <kbd>.</kbd>

如何回復上一步驟，對於 vim 的使用者來說會是 <kbd>u</kbd> (undo)

如何搜尋某個單子 <kbd>/</kbd> 後面接單字，舉例來說我要搜尋 className，那我就會 <kbd>/className</kbd> 去做搜尋，搜尋到後按 enter，接著便可以按 <kbd>n</kbd> (next occurance 的縮寫) 去找尋你要搜尋的究竟是哪個 className，大寫的 <kbd>N</kbd> 則是反向搜尋。

如何插入字到該行最後的位置，並轉換到 Insert mode？對於 vim 的使用者來說會是 <kbd>A</kbd>

如何註解程式碼，如果是使用類似 VSCode 可以進入 visual mode 直接使用 <kbd>cmd</kbd> + <kbd>/</kbd> 去註解，如果是使用 vim 可以進入區塊 visual mode 快捷鍵是 <kbd>ctrl</kbd> + <kbd>v</kbd> 接著使用 <kbd>shift</kbd> + <kbd>i</kbd> 進入輸入模式，最後輸入 <kbd>//</kbd> 去註解，去註解則是使用 <kbd>ctrl</kbd> + <kbd>v</kbd> 選取好後用 <kbd>d</kbd> 去刪除註解

---

**Vscode**

<kbd>cmd</kbd> + <kbd>shift</kbd> + <kbd>e</kbd> 可切到資料夾的樹狀區，便可以使用 <kbd>j</kbd> <kbd>k</kbd> 進行位移，並選擇你要開啟哪個檔案。

先用 <kbd>v</kbd> 切入 visual mode，接著使用 <kbd>S+<</kbd> (surrounding tag) 並輸入想環繞的 tag 名稱，假設我輸入 div，便可以將 `<h1>hello</h1>` 變成 `<div><h1>hello</h1></div>`

---

### Conclusion

我認為工程師就是不斷讓自己精進，那精進的方式有很多種，你如果對前端藝術有興趣，你可能就會朝 p5.js，three.js，pixi.js，GSAP，甚至去學習 blender 或著 VR 去做精進，亦或著是你喜歡較深的類似用 JavaScript 寫框架，處理效能，使用網站做工具，你可能就會往底層下去摸索，又或著你對我所提的都沒興趣，你的選擇就會朝較廣泛的方向去做學習，學習後端，雲服務...等，但不論是哪種，當你開始要寫程式碼時，vim 就會是你的好夥伴。

去學習對自己有易的工具，我認為是每個工程師所要面對的問題。就像有些人會在網路上大戰 vue 還是 react 究竟哪個好，我個人認為沒有對錯，只要符合使用場景，用得好，就是好的框架。

如果有新增或遺忘的部分我之後有空也會補上，有任何問題都歡迎寄信給我，網路上也有一些人分享有關 vim 的文章或快捷鍵，如果有興趣我都推薦去閱讀看看，畢竟就是他們使用上的心得。

題外話：像 Apple 這種硬邦邦公司 xcode IDE 在 2021 也為 vim 進行妥協了，在新的 beta 版本，你也同樣可以使用 vim 寫 swift 在 xcode 內，算是對 vim 使用者的福音。
