---
title: TypeScript interface and type
date: "2023-12-24T12:00:00.000Z"
description: 目前公司使用 js 的專案，除非比較早期的，後期大部分我經手過的專案我都已經慢慢將其轉往 ts 了，看重的是他配合 vscode 之類的 coding editor 的提示，儘管目前有另一派工程師再說使用 ts 會讓 js 喪失很多彈性，坦白說也的確如此，我自己認為可以根據不同的專案需求來做考慮是否使用，今天來寫一下我對 interface 及 type 使用上的差異。
tags: ["typescript"]
---

### Preface

首先，當然是直接附上官網的 cheat sheet 啦，可以點開看大圖。

<img src='../../../src/assets/typeScript-interfaces.png'>
<br>
<img src='../../../src/assets/typeScript-type.png'>

### Different

我自己認為兩者最大的差別在於寫法上有點不同，舉個例子如果要對 interface 做擴充跟要對 type 做擴充的寫法如下：

```ts
// interface 要使用 extends
interface Gender {
  gender: string
}

interface Age {
  age: number
}

// 可以使用, 來進行複數擴充
interface User extends Gender, Age {
  name: string
}
```

```ts
// type 要使用 & (intersection)
type Gender = {
  gender: string
}

type Age = {
  age: number
}

type User = Gender &
  Age & {
    name: string
  }
```

再舉個例子 interface 有 implements 而 type 沒有，在這點上可以把 interface 想像成是藍圖(blueprint)，定義了藍圖後，你在依據自己的需求去調整函示，可以讓程式更為嚴謹。

```ts
interface Shape {
  name: string
  area(): number
}

class Circle implements Shape {
  constructor(public radius: number, public name: string) {}

  area() {
    return Math.PI * this.radius ** 2
  }
}

const circle: Shape = new Circle(5, "Circle")
```

儘管沒有上述範例的使用方式，type 的優點在於他的彈性及更多元的寫法，有像是 Mapped Types，Conditional Types...等，這邊我就不一一舉例，可以去看上面提供的 cheat sheet。

### Conclusion

可以參考一下 [LogRocket Blog](https://blog.logrocket.com/types-vs-interfaces-typescript/) 寫的這篇文章，我個人認為寫的滿好的，cheat sheet 則是開發時可以偷看。

我自己個人習慣是能使用 interface 就能解決的就先使用 interface，如果不行再轉而使用 type 來進行處理，據說好像也是官方推薦的使用方式，不過實際上，這也滿看公司其他合作的工程師，最好是能達成共識。

基本上，我自己認為 ts 在開發上都是滿正向的，不過這邊有一點小小吐槽，就是在大型專案，ts 會導致 vscode 相當的卡頓，目前我是使用 2019 16gb ram intel 版本的 mbp 在做全端開發，或許真的要更新上去才能比較減緩卡頓，會建議最好要買到 32gb ram 會比較保險一點點，畢竟一台 mbp 這麼貴沒使用個 5-6 年以上我認為不划算 😅。
