---
title: JavaScript Class Basic
date: "2025-02-22T12:00:00.000Z"
description: 今天來寫一下 class，該篇是學習阮一峰作者 ECMAScript 6 入門 class 的基本語法部分，花點時間閱讀及學習，自己在閱讀時所寫的筆記。
tags: ["javascript"]
---

### Preface

其實近幾年因為函數式編程 functional programming 的興起，`class` 的確在漸漸式微，函數式編程鼓勵使用 _純函數 (pure functions)_ 和 _不可變數據 (immutability)_，由於易讀，所以程式碼會更容易被理解。

```js
class Numbers {
  constructor(arr) {
    this.arr = arr
  }
  double() {
    return this.arr.map(num => num * 2)
  }
}

const nums = new Numbers([1, 2, 3])
console.log(nums.double()) // [2, 4, 6]

// functional programming
const doubleNumbers = arr => arr.map(num => num * 2)
console.log(doubleNumbers([1, 2, 3])) // [2, 4, 6]
```

假設你也想要模組化函數

```js
class Person {
  constructor(name) {
    this.name = name
  }
  greet() {
    return `Hello, my name is ${this.name}`
  }
}

const createPerson = name => ({
  name,
  greet: () => `Hello, my name is ${name}`,
})

const person = createPerson("Jennie")
console.log(person.greet()) // Hello, my name is Jennie
```

但其實 `class` 仍然有其應用場景，像是 OOP (物件導向) 仍然在某些大型 lib 中能看到，像是 Three.js，又或著像是 web component，你需要使用 `class component extends HTMLElement {}`，React 中的 class component...等。

### class

`class` 是將原先的 `prototype` 進行封裝後的產物，讓 OOP 的設計可以更佳直覺。

```js
function Point(x, y) {
  this.x = x
  this.y = y
}

Point.prototype.toString = function () {
  return "(" + this.x + ", " + this.y + ")"
}

const p = new Point(1, 2)

// 是不是這個更易讀
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  toString() {
    return "(" + this.x + ", " + this.y + ")"
  }
}
```

`class` 的所有方法都定義在 `prototype` 屬性上面:

```js
class Point {
  constructor() {
    // ...
  }

  toString() {
    // ...
  }

  toValue() {
    // ...
  }
}

console.log(typeof Point) // "function"
console.log(Point === Point.prototype.constructor) // true

// 等同於

Point.prototype = {
  constructor() {},
  toString() {},
  toValue() {},
}

// 也可以使用 Object.assign() 來做添加
Object.assign(Point.prototype, {
  toString() {},
  toValue() {},
})
```

`class` 內部定義的 function 是不可列舉的，簡單講就是不能使用 `Object.keys` 或 `for...in` 抓到該值

```js
// 如果有使用過 Object.defineProperty 就會知道該屬性
// doc: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
const person = { name: "Jennie" }

Object.defineProperty(person, "age", {
  value: 18,
  enumerable: false, // 將此參數定義為不可列舉
})

console.log(Object.keys(person)) // ['name']
consolew.log(Object.getOwnPropertyNames(person)) // ['name', 'age']
// 使用其他方法
console.log("age" in person) // 🚨 這邊要注意，該方法會得到 enumerable，所以為 true
for (let x in person) {
  console.log(x) // 🚨 這邊要注意，該方法不會得到 enumerable 的屬性，只會得到 ['name']
}

// 我們換到 class

class Point {
  constructor(x, y) {
    // ...
  }
  toString() {
    // ...
  }
}

console.log(Object.keys(Point.prototype)) // 由於不可列舉，所以為 []
console.log(Object.getOwnPropertyNames(Point.prototype)) // ["constructor", "toString"]
```

每一個 `class` 預設都會有一個 `constructor` 方法，他會返回該實例對象 (即 `this`)，所以正常情況下 `new Foo() instanceof Foo` 會得到 `true` 但我們也可以將其修改返回另一個對象。

```js
class Foo {
  constructor() {
    return Object.create(null)
  }
}

// 要執行 class 必須使用 new 來創建實例
console.log(new Foo() instanceof Foo) // false，原因是我們在 constructor 內返回另一個物件
```

`class` 的屬性和方法，除非定義在 `this` 上，否則都是定義在 `class` 上

```js
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  toString() {
    return "(" + this.x + ", " + this.y + ")"
  }
}

const point = new Point(2, 3)

console.log(point.toString()) // (2, 3)
console.log(point.hasOwnProperty("x")) // true
console.log(point.hasOwnProperty("y")) // true
console.log(point.hasOwnProperty("toString")) // 🚨 false，是 class 的屬性
console.log(point.__proto__.hasOwnProperty("toString")) // true

const p1 = new Point(2, 3)
const p2 = new Point(3, 2)

console.log(p1.__proto__ === p2.__proto__) // 都是指向 class 本身所以為 true

// __proto__ 並不是語言本身的特性，在開發時不建議使用，建議使用 Object.getPrototypeOf()
console.log(Object.getPrototypeOf(p1) === Object.getPrototypeOf(p2)) // true

p1.__proto__.printName = function () {
  return "Oops"
}

// 由於是添加在 class 所以 p2 也可以做使用
// 🚨 所以使用 __proto__ 改寫 class 必須謹慎
consoel.log(p1.printName()) // "Oops"
consoel.log(p2.printName()) // "Oops"
```

ES2022 出來後 `class` 的屬性不用一定要寫在 `constructor` 內，也可以寫在最 _頂層_

```js
class IncreasingCounter {
  constructor() {
    this._count = 0
  }
  get value() {
    console.log("Getting the current value!")
    return this._count
  }
  increment() {
    this._count++
  }
}

// 📢 這種寫法的優點在於，所有 class 餓屬性都定義在頂層，一眼就能看出這個類有哪寫屬性
class IncreasingCounter {
  _count = 0
  constructor() {
    // ...
  }
  get value() {
    console.log("Getting the current value!")
    return this._count
  }
  increment() {
    this._count++
  }
}
```

`class` 也有取值函數 (getter) 和存值函數 (setter)

```js
class CustomHTMLElement {
  constructor(element) {
    this.element = element
  }
  get html() {
    return this.element.innerHTML
  }
  set html(value) {
    this.element.innerHTML = value
  }
}

// 基本上使用不到，除非你有比較複雜的 obj 他是用 Object.definedProperty or Object.defineProperties
// Object.getOwnPropertyDescriptor 會回傳
// Property Descriptor (屬性描述符) 包含
// value - 該屬性當前值
// writable (boolean) - 是否可以修改該屬性
// enumerable (boolean) - 是否能在 for...in 或 Object.keys 中被列舉
// configurable (boolean) - 是否可以刪除該屬性或修改它的描述符
// get (function or undefined) - 該屬性 getter 的方法
// set (function or undefined) - 該屬性 setter 的方法
const descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype,
  "html"
)

console.log(descriptor)
// [object Object] {
//   configurable: true,
//   enumerable: false,
//   get: get html() {
//     return this.element.innerHTML;
//   },
//   set: set html(value) {
//     this.element.innerHTML = value;
//   }
// }

console.log("get" in descriptor) // true
console.log("set" in descriptor) // true
```

`class` 的 function 名稱可以採用表達式的方式引入

```js
let methodName = "getArea"

class Square {
  constructor(length) {
    // ...
  }
  [methodName]() {
    console.log("area")
  }
}

const s = new Square()
s.getArea() // area
```

由於可以動態調整名稱 (Computed Property Names)，使用場景會類似

```js
const lang = "es" // 假設這是使用者的語言

const translations = {
  en: "greet",
  es: "saludar",
}

class Greeter {
  [translations[lang]]() {
    return lang === "es" ? "¡Hola!" : "Hello!"
  }
}

const greeter = new Greeter()
// 假設 lang 變成 en，就可以使用 greeter.great()
console.log(greeter.saludar()) // ¡Hola!
```

與函數一樣，`class` 也可以使用表達式的形式來定義

```js
const MyClass = class Me {
  getClassName() {
    return Me.name
  }
}

let inst = new MyClass()
console.log(inst.getClassName()) // Me
Me.name // ReferenceError: Me is not defined

// 🚨 為何 inst.getClassName 會打印出 Me 是因為在 JavaScript 中每個具名函式或 class 都有一個 name 屬性
function foo() {}
console.log(foo.name) // "foo"

class Bar {}
console.log(Bar.name) // "Bar"
```

`class` 可以立即執行且不具名

```js
let person = new (class {
  constructor(name) {
    this.name = name
  }
  sayName() {
    console.log(this.name)
  }
})("Jennie")
person.sayName() // Jennie
```

`class` 的靜態方法，該方法不會被實例繼承，而是直接透過 `class` 來調用

```js
class Foo {
  static classMethod() {
    return "hello"
  }
}

Foo.classMethod() // hello

const foo = new Foo()
foo.classMethod() // TypeError: foo.classMethod is not a function
```

`static` 應用場景

1. 運用在工具函式，最直觀的其實就是 **易於統整**

```js
class MathUtils {
  static add(a, b) {
    return a + b
  }
  static subtract(a, b) {
    return a - b
  }
}

console.log(MathUtils.add(5, 10))
console.log(MathUtils.subtract(10, 5))
```

2. 工具函數也可是 **與類別強關係**，這樣使用上才會更加清晰，否則使用純函式就好了

```js
class Circle() {
  constructor(radius) {
    this.radius = radius
  }
  getArea() {
    return Circle.area(this.radius)
  }
  static area() {
    return Math.PI * radius * radius
  }
}

const circle = new Circle(5)
console.log(circle.getArea())
console.log(Circle.area(10))
```

3. 當有繼承關係時

```js
class Animal {
  static speak() {
    return "Animals make sounds."
  }
}

class Dog extends Animal {
  static speak() {
    return super.speak() + " Wolf!" // 也可以透過 super 調用
  }
}

console.log(Animal.speak()) // "Animals make sounds."
console.log(Dog.speak()) // "Animals make sounds, Woof!"
```

`static` 也可以用在屬性上，並在 `class` 內當 **全域變數**，且作用範圍只在類別內，尤其在我們需維護某些資料時(計數、緩存、設定...等)

```js
class Counter {
  static count = 0
  static increment() {
    return ++this.count
  }
}

console.log(Counter.increment()) // 1
console.log(Counter.increment()) // 2
console.log(Counter.count) // 2
```

私有屬性及私有方法 (偷過前方加上井字號來表達 `#`)

```js
class IncreasingCounter {
  #count = 0 // 私有屬性
  get value() {
    console.log("Getting the current value!")
    return this.#count
  }
  set value(val) {
    this.#count = val
  }
  increment() {
    this.#count++
  }
}
const counter = new IncreasingCounter()
counter.#count // error
counter.#count = 42 // error

// #sum 就是私有方法，也可以用在 getter or setter 上
class Foo {
  #a
  #b
  constructor(a, b) {
    this.#a = a
    this.#b = b
  }
  #sum() {
    return this.#a + this.#b
  }
  printSum() {
    console.log(this.#sum())
  }
  get #a() {
    return this.#a;
  }
}
```

私有屬性及私有方法前也可以加上靜 `static` 來做搭配

```js
class FakeMath {
  static PI = 22 / 7
  static #totallyRandomNumber = 4

  static #computeRandomNumber() {
    return FakeMath.#totallyRandomNumber
  }

  static random() {
    console.log("I heard you like random numbers…")
    return FakeMath.#computeRandomNumber()
  }
}

console.log(FakeMath.PI) // 3.142857142857143
console.log(FakeMath.random())
// I heard you like random numbers…
// 4
console.log(FakeMath.#totallyRandomNumber) // error: SyntaxError: Private field....
console.log(FakeMath.#computeRandomNumber()) // error: SyntaxError: Private field...
```

ES2020 對 `in` 有做優化，使其可以判斷對象是否有私有屬性

```js
class A {
  #foo = 0
  m() {
    console.log(#foo in this) // true
  }
}
```

靜態屬性有一個問題，如果他有初始化邏輯，這個邏輯要麼是寫在 `class` 外部，要麼是寫在 `constructor` 方法內。

```js
class C {
  static x = 234
  static y
  static z
}

// y 和 z 仰賴 x 的結果，這部分寫在外部，不易維護
// 而後者寫在 constructor 內則是每次新建實例時都會運行一次 (全域變數不需要每次都還要在運行一遍)
try {
  const obj = doSomethingWith(C.x)
  C.y = obj.y
  C.z = obj.z
} catch {
  // C.y = ...;
  // C.z = ...;
}
```

為了解決這個問題 ES2020 引入了 static block，當 `class` 的實例創建好後，這個 block 就不在運行了，解決先前寫在 `constructor` 產生重複運行的問題

```js
class C {
  static x = ...;
  static y;
  static z;

  // 只會運行一次
  // 可以有複數個 static block
  static {
    try {
      const obj = doSomethingWith(this.x);
      this.y = obj.y;
      this.z = obj.z;

      // 🚨 切記裡面不可有 return 語句
    }
    catch {
      // this.y = ...;
      // this.z = ...;
    }
  }
}
```

進階：除了靜態屬性的初始化功能，static block 還有一個作用，就是將私有屬性與 `class` 的外部程式碼分享

```js
let getX

export class C {
  #x = 1
  static {
    getX = obj => obj.#x
  }
}

// 以這範例來看 obj 會是 C 的實例，接著返回 obj.#x，讓外部程式使用
console.log(getX(new C())) // 1
```

但這樣的寫法有何好處？

1. 讓 `class` 本身沒有 `getX()`，避免污染 API
2. 讓外部能讀取私有屬性，但不直接暴露 API
3. 允許內部模組存取，而非所有地方

```js
// user.js
let getSecret

export class User {
  #secret = "Hidden Data"
  static {
    getSecret = obj => obj.#secret
  }
}

export { getSecret }
```

```js
// main.js
import { User, getSecret } from "./user.js"

const user = new User() // User 本身仍保持封裝性
console.log(getSecret(user)) // ✅ "Hidden Data"
console.log(user.#secret) // ❌ SyntaxError
```

### Note

1. `class` 已經是嚴格模式了，所以不用再特地加 `use strict`
2. `class` 不會 hoist

```js
new Foo() // ReferenceError
class Foo {}
```

3. ES6 的 `class` 只是將 ES5 的構造函式包裝，所以許多特性都被繼承，包含 name 屬性

```js
class Point {}
console.log(Point.name) // Point
```

4. Generator 方法

如果某個方法之前加上星號（\*），就表示該方法是一個 Generator 函式。

- `Symbol.iterator` 是 JavaScript 用來實作迭代協定的標準屬性
- 只要物件有 `Symbol.iterator` 方法，它就可以被 `for...of` 迴圈使用

```js
class Foo {
  constructor(...args) {
    this.args = args
  }
  *[Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg // yield 會逐步產生一個值，然後暫停執行，直到 for...of 需要下一個值才會繼續運行
    }
  }
}

for (let x of new Foo("hello", "world")) {
  console.log(x)
}
// hello
// world
```

5. `this` 的指向

```js
class Logger {
  printName(name = "there") {
    this.print(`Hello ${name}`)
  }
  print(text) {
    console.log(text)
  }
}

const logger = new Logger()
const { printName } = logger
printName() // TypeError: Cannot read property 'print' of undefined
```

上面報錯是因為 `this` 會指向當時的環境，由於 `class` 內部是嚴格模式，所以 `this` 會指向 `undefined`，那要如何解決這個問題

> 1.  可以使用 `bind` 將 `this` 與創建的實例綁定在一起
> 2.  在外頭使用 `call` 將其與實例綁定在一起
> 3.  使用箭頭函式
> 4.  使用 `proxy`

```js
class Logger {
  constructor() {
    // 這裡的 bind(this) 確保 printName 在解構賦值後，仍能正確存取 Logger 實例的 this，不會因為 this 綁定的問題導致錯誤
    this.printName = this.printName.bind(this)
  }
  printName(name = "there") {
    this.print(`Hello ${name}`)
  }
  print(text) {
    console.log(text)
  }
}

const logger = new Logger()
const { printName } = logger
printName() // Hello there
```

```js
class Logger {
  printName(name = "there") {
    this.print(`Hello ${name}`)
  }
  print(text) {
    console.log(text)
  }
}

const logger = new Logger()
const { printName } = logger
printName.call(logger) // Hello there
```

```js
// 箭頭函式
class Logger {
  constructor() {
    // 箭頭函式不會建立自己的 this，它的 this 永遠是定義它時的作用域的 this
    // this.printName 定義於 constructor，所以 this 永遠是 Logger 的實例
    this.printName = (name = "there") => {
      this.print(`Hello ${name}`)
    }
  }
  print(text) {
    console.log(text)
  }
}

const { printName } = new Logger()
printName() // Hello there
```

```js
// 使用 proxy 攔截 Logger 的存取方法，並確保所有方法在被呼叫時，this 都綁定到 Logger 的實例上
class Logger {
  printName(name = "there") {
    this.print(`Hello ${name}`)
  }
  print(text) {
    console.log(text)
  }
}

function selfish(target) {
  const cache = new WeakMap()
  const handler = {
    get(target, key) {
      const value = Reflect.get(target, key) // 取得原始屬性或方法
      if (typeof value !== "function") {
        return value // 非函式則直接回傳
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target)) // 確保方法綁定在 target
      }
      return cache.get(value)
    },
  }
  const proxy = new Proxy(target, handler)
  return proxy
}

const logger = selfish(new Logger())
const { printName } = logger

printName()
```

下方簡單講一下為何使用 `proxy` 可以節省記憶體，原因在於當我創建複數個實例 `this.printName` `this.print` 都會重新再去 bind 一次，儘管可能其中的方法可能根本沒做使用。

而由於 `proxy` 是監控，只有當該方法第一次被存取時，才會執行 `bind`，減少不必要的函式產生，且這裡的 `WeakMap` 針對的是函式，而不是實例，因此即使建立多個 `Logger` 實例，他們仍可以共用 `printName` 的 `bind` 版本。

```js
class Logger {
  constructor() {
    this.printName = this.printName.bind(this) // 這裡每個 Logger 實例都會重新創建 `printName` 方法
    this.print = this.print.bind(this)
  }
  printName(name = "there") {
    this.print(`Hello ${name}`)
  }
  print(text) {
    console.log(text)
  }
}

const logger1 = new Logger()
const logger2 = new Logger()
console.log(logger1.printName === logger2.printName) // false
```

6. new.target

可以使用 `new.target` 屬性，如果構造函式不是透過 `new` 命令或是 `Reflect.construct()` 調用的，`new.target` 會返回 `undefined`

簡而言之 `Reflect.constructor(Person, [...args])` 等於 `new Person(...args)`

```js
function Person(name) {
  if (new.target !== undefined) {
    this.name = name
  } else {
    throw new Error("必须使用 new 命令生成實例")
  }
}

// 另一種寫法
// function Person(name) {
//   if (new.target === Person) {
//     this.name = name
//   } else {
//     throw new Error("必须使用 new 命令生成實例")
//   }
// }

const person = new Person("Jennie") // good
const newParson = Reflect.construct(Person, ["Jennie"]) // good
const notAPerson = Person.call(person, "Jennie") // 必须使用 new 命令生成實例
```

在 `class` 內部調用，返回當前 Class

```js
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle)
    this.length = length
    this.width = width
  }
}

const obj = new Rectangle(3, 4) // true
```

如果是繼承的情況下，會返回子類。

```js
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle) // false
    console.log(new.target === Square) // true
    this.length = length
    this.width = width
  }
}

class Square extends Rectangle {
  constructor(length, width) {
    super(length, width)
  }
}

const obj = new Square(3)
```

用這種方法可以讓該 `class` 無法獨立使用，必須繼承後才可以使用。

```js
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error("本類不可實體化")
    }
  }
}

class Rectangle extends Shape {
  constructor(length, width) {
    super()
    // ...
  }
}

const x = new Shape() // 本類不可實體化
const y = new Rectangle(3, 4) // true
```

### Conclusion

這些是我看阮一峰作者 ECMAScript 6 入門 class 的基本語法部分，所做的筆記，大部分是搬磚並加上一些使用情境及自己的理解及想法。
