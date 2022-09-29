---
title: Happy Hacking tmux
date: "2022-09-29T12:00:00.000Z"
description: 我目前寫程式習慣使用 vim 搭配 vscode，除了寫 Java 會使用到 intellij，坦白說這些都是很好用的工具，但是假如你今天僅僅是想在機器上，寫一些簡單的程式，並不需要額外其他的功能，那 tmux 搭配 vim 在 terminal 操作其實是滿常見的一種開發方式，又或著你今天是一個 AI 工程師，你需要駐存終端機上顯示的各項 training 資訊，但你又害怕手賤不小心關掉 terminal，tmux 有所謂 session 的功能相較於 iTerm2 之類的 terminal 能更勝任該角色...等，這篇文章就來介紹一下最基本 tmux。
tags: ["tool"]
---

### Mental Model

tmux 基本上就圍繞著三個觀念 `session`, `window`, `pane`。上下關係也是如同這個順序，它可以有多個 session，每個 session 可以有多個 window，每個 window 又可以有多個 pane。

🚀🚀🚀 還有最為重要的一點是 tmux 的前綴詞是 <kbd>Ctrl</kbd> + <kbd>b</kbd>。🚀🚀🚀

### Session

> 基本上我在使用 tmux 時，只比較常使用到 pane 及 window，而 session 部分我比較看作是不同專案，所以比較不用去操作它。

可以使用 `tmux new -s <session name>` 來建立一個新的 session，可以使用 `tmux ls` 來查看目前有哪些 session，使用 `tmux attach -t <session name>` 來切換 session，離開 session 可以使用 <kbd>Ctrl + b</kbd> + <kbd>d</kbd>，較推薦，使用此方式不會刪掉該 session，如果你直接鍵盤輸入 `exit`，此方式會連同 session 一同刪除掉，所以較不推薦。

- <kbd>Ctrl + b</kbd> + <kbd>s</kbd>：視覺化列出目前所有 session
- <kbd>Ctrl + b</kbd> + <kbd>$</kbd>：重新命名 session
- <kbd>Ctrl + b</kbd> + <kbd>d</kbd>：關閉 session
- <kbd>Ctrl + b</kbd> + <kbd>(</kbd>：切換到上一個 session
- <kbd>Ctrl + b</kbd> + <kbd>)</kbd>：切換到下一個 session

### Window and Pane

用上面 `tmux new -s <session name>` 指令創建好 session 後，都會有一個預設的 window，並且命名為 zsh，及一個編號為 0 的 pane，接著便可以使用下方指令來操作 tmux 。

##### 查找指令

- <kbd>Ctrl + b</kbd> + <kbd>?</kbd>：查找所有相關指令

##### Window

- <kbd>Ctrl + b</kbd> + <kbd>c</kbd>：建立一個新的 window
- <kbd>Ctrl + b</kbd> + <kbd>,</kbd>：重新命名 window
- <kbd>Ctrl + b</kbd> + <kbd>w</kbd>：視覺化的方式切換 window
- <kbd>Ctrl + b</kbd> + <kbd>p</kbd>：切換到上一個 window
- <kbd>Ctrl + b</kbd> + <kbd>n</kbd>：切換到下一個 window
- <kbd>Ctrl + b</kbd> + <kbd>數字</kbd>：切換到指定的 window
- <kbd>Ctrl + b</kbd> + <kbd>&</kbd>：關閉目前的 window
- <kbd>Ctrl + b</kbd> + <kbd>f</kbd>：查找 window

##### Pane

- <kbd>Ctrl + b</kbd> + <kbd>"</kbd>：垂直分割 pane
- <kbd>Ctrl + b</kbd> + <kbd>%</kbd>：水平分割 pane
- <kbd>Ctrl + b</kbd> + <kbd>q</kbd>：顯示 pane 編號
- <kbd>Ctrl + b</kbd> + <kbd>o</kbd>：切換到下一個 pane
- <kbd>Ctrl + b</kbd> + <kbd>方向鍵</kbd>：切換到指定的 pane

### Conclusion

我自己是認為，上手一個工具，就跟打遊戲一樣，你要先知道觀念跟規則，接著習慣它就好了，以上就是我在使用 tmux 時，一些常用的指令，較進階的使用方式，可以去安裝 tmux 的相關套件配合使用，像是 _oh-my-tmux_ ...等。
