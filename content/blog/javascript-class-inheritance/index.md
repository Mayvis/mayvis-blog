---
title: JavaScript Class Inheritance
date: "2025-02-24T12:00:00.000Z"
description: 今天來寫一下 class 繼承，該篇是學習阮一峰作者 ECMAScript 6 入門 class 的繼承部分，花點時間閱讀及學習，自己在閱讀時所寫的筆記。
tags: ["javascript"]
---

### Extends

class 可通過 `extends` 來實現繼承

```js
class Point {}

class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y) // 調用父類的 constructor(x, y)
    this.color = color
  }
  toString() {
    return this.color + " " + super.toString() // 調用父類的 toString()
  }
}
```

🚨 ES6 規定，子類必須在 `constructor()` 方法中調用 `super()`，否則會報錯。這是因為子類自己 `this` 的對象，必須先通過父類的構造函數完成塑造，得到與父類同樣的實例屬性和方法，然後再對其加工，添加子類自己的實例屬性和方法，如果不調用 `super()`，子類就得不到自己的 `this` 對象。

> 所以簡單講 `super()` 就是調用父類的構造函數，並返回一個父類的實例給子類的 `this` 綁定。

```js
class Parent {
  constructor(name) {
    this.name = name
  }
}

class Child extends Parent {
  constructor(name, age) {
    // 相當於:
    // let this = Object.create(Parent.prototype);
    super(name) // 🔹 這裡創建 this
    this.age = age
  }
}

// 等價於

function Parent(name) {
  this.name = name
}

function Child(name, age) {
  let thisObj = Object.create(Parent.prototype) // ⬅️ this 先繼承 Parent
  Parent.call(thisObj, name) // ⬅️ 執行 super(name)
  thisObj.age = age
  return thisObj
}
```

### Private

父類所有的屬性和方法，都會被子類繼承，除了私有的屬性和方法。私有屬性只能在它定義的 class 內做使用。

```js
class Foo {
  #p = 1
  #m() {
    console.log("hello")
  }
  getP() {
    return this.#p
  }
}

class Bar extends Foo {
  constructor() {
    super()
    console.log(this.#p) // SyntaxError: Private field '#p' must be declared in an enclosing class
    this.#m() // SyntaxError: Private field '#m' must be declared in an enclosing class
    console.log(this.getP()) // 1
  }
}

const b = new Bar()
```

### Static

父類的靜態屬性和靜態方法，也會被子類繼承。

```js
class A {
  static hello() {
    console.log("hello world")
  }
}
class B extends A {}

B.hello() // hello world
```

🚨 這邊要注意，靜態屬性是透過淺拷貝 (shallow copy) 繼承的。

B 繼承了 A，因此繼承了這個屬性，但是 `B.foo` 這個靜態屬性，影響不到 `A.foo` 原因就是 B 類繼承靜態屬性時，會採用淺拷貝，兩者是彼此獨立的屬性。

- 基本型別 (`number`, `string`, `boolean`): `static` 會被淺拷貝，B 修改 foo 時，會創建新的，不影響 A。
- 引用型別 (`object`, `array`): `static` 由於淺拷貝，但因為指向同一個物件，修改 B.foo 會影響 A.foo

```js
class A {
  static foo = 100
}

class B extends A {
  constructor() {
    super()
    B.foo--
  }
}

const b = new B()
console.log(B.foo) // 99
console.log(A.foo) // 100

console.log(Object.hasOwn(B, "foo")) // true
console.log(Object.hasOwn(A, "foo")) // true
```

```js
class A {
  static foo = { count: 100 }
}
class B extends A {
  constructor() {
    super()
  }
}

B.foo.count--

console.log(B.foo.count) // 99
console.log(A.foo.count) // 99 (!) 由於是淺拷貝，所以也被修改了
```

### Object.getPrototypeOf()

`Object.getPrototypeOf()` 方法可以用來從子類上獲取父類。

```js
class Point {}

class ColorPoint extends Point {}

console.log(Object.getPrototypeOf(ColorPoint) === Point) // true
```

### super

`super` 可以當作函式使用，也可以當作對象使用。

`new.target` 會指向正在執行的函式，所以它指向的是 B 而不是父層 A 的構造函式，也就是說 super 內部的 `this` 指向的是 B

```js
class A {
  constructor() {
    console.log(new.target.name)
  }
}

class B extends A {
  constructor() {
    // 代表調用父類的構造函式，用以形成子類的 this，所以在調用 super() 前，是沒有 this
    // 🚨 注意，這裡雖然代表了父類的構造函式，但是因為返回的是子類 this，所以 super 內部
    // 的 this 代表子類的實例，相當於 A.prototype.constructor.call(this)
    super()
  }
}

const b = new B() // console 會顯示 "B"
```

下面這個範例，最後一行輸出的是 A，而不是 B，🚨 原因在於 `super()` 執行時，B 的屬性 name 尚未綁定到 `this`，所以 `this.name` 拿到的是 A 類的屬性。

```js
class A {
  name = "A"
  constructor() {
    console.log("My name is " + this.name)
  }
}

class B extends A {
  name = "B"
}

const b = new B() // My name is A
```

作為函式時，`super` 只能作用在子類的構造函數之中，用在其他地方會報錯

```js
class A {}

class B extends A {
  m() {
    super() // 報錯
  }
}
```

作為對象時，普通方法中，指向父類的原型對象；在靜態方法中，指向父類

```js
class A {
  p() {
    return 2
  }
}

class B extends A {
  constructor() {
    super()
    // super 在普通方法中指向 A.prototype，所以 super.p() 相當於 A.prototype.p()
    console.log(super.p()) // 2
  }
}

let b = new B()
```

🚨 注意，由於 `super` 指向 "父類的原型對象"，所以定義在父類實例上的方法或屬性，是無法透過 `super` 調用的

```js
class A {
  constructor() {
    console.log(new.target.name) // "B"
    this.p = 2 // 他是作用在 b 的實例上
  }
}

class B extends A {
  constructor() {
    super()
  }
  get m() {
    // 這裡的 super.p 不會訪問 this.p，而是嘗試從 A.prototype 取得 p，但 A.prototype 根本沒有，所以回傳 undefined
    return super.p
  }
}

let b = new B()
console.log(b.m) // undefined
console.log(b.p) // 2
```

可以透過 `new.target.name` 去判斷現在的 `this`，它指定的對象為 B，代表 `this.p` 是註冊在 B 的實例上，而非 A，所以這時 `A.prototype.p` 會拿到 `undefined`

當然，如果屬性直接定義在 A 上 就能取到了。

```js
class A {}
A.prototype.x = 2 // 直接定義在 A 上

class B extends A {
  constructor() {
    super()
    console.log(super.x) // 2
  }
}

let b = new B()
```

ES6 規定，在子類普通方法中透過 `super` 調用父類方法時，方法內部的 `this` 指向當前子類的實例。

🚨 雖然調用的是 `A.prototype.print()` 但是其內部的 `this` 指向 B 的實例，所以輸出為 2，簡而言之，實際上執行的是 `super.print.call(this)`

```js
class A {
  constructor() {
    this.x = 1
  }
  print() {
    console.log(this.x)
  }
}

class B extends A {
  constructor() {
    super()
    this.x = 2
  }
  m() {
    super.print()
  }
}

let b = new B()
b.m() // 2
```

老樣子，`super.x` 為 `undefined` 是因為 `A.prototype.x` 未被定義，儘管你在運行前執行 `super.x = 3`

🚨 `super` 在屬性賦值時，會把 `this` 當作目標對象，而不是 `A.prototype`

```js
class A {
  constructor() {
    this.x = 1
  }
}

class B extends A {
  constructor() {
    super()
    this.x = 2
    super.x = 3
    console.log(super.x) // undefined
    console.log(this.x) // 3
  }
}

let b = new B()
```

如果 `super` 作為對象，用在靜態方法中，這時 `super` 將指向父類，而不是父類的原型對象。

```js
class Parent {
  static myMethod(msg) {
    console.log("static", msg)
  }

  myMethod(msg) {
    console.log("instance", msg)
  }
}

class Child extends Parent {
  static myMethod(msg) {
    super.myMethod(msg)
  }

  myMethod(msg) {
    super.myMethod(msg)
  }
}

// 由於是直接透過原型調用，所以會執行 static -> static 1
Child.myMethod(1) // static 1

const child = new Child()
// 由於是透過實例來進行調用，所以會執行 instance -> instance 2
child.myMethod(2) // instance 2
```

在子類的靜態方法中透過 `super` 調用父類方法時，方法內部的 `this` 指向當前的子類，而不是子類的實例。

🚨 靜態方法 `B.m`裡，`super.print` 指向的是父類的靜態方法，所以這裡的 `this` 指向的是 B，而不是 B 的實例。

```js
class A {
  constructor() {
    this.x = 1
  }
  static print() {
    console.log(this.x) // 這個 this 指向的 B 而不是 B 的實例
  }
}

class B extends A {
  constructor() {
    super()
    this.x = 2
  }
  static m() {
    super.print() // 指向父類
  }
}

B.x = 3 // 這只是在 B 本身添加 x 而不是在 prototype 上做添加
B.m() // 3
console.log(B.prototype.x) // undefined
```

`super` 必須指定是作為函式，還是作為對象使用，否則會報錯

```js
class A {}

class B {
  constructor() {
    super()
    console.log(super) // 報錯
    console.log(super.valueOf instanceof B) // true
  }
}

const b = new B()
```

由於對象總是繼承其他對象，所以可以在任一對象中，使用 `super`

```js
const obj = {
  toString() {
    return "MyObject: " + super.toString()
  },
}

console.log(obj.toString()) // MyObject: [object Object]
```

### prototype and \_\_proto\_\_

🚨 首先，請盡量不要使用 `__proto__`，[參考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/proto)。

每一個對象都有 `__proto__` 屬性，指向構造函數的 `prototype`，`class` 作為構造函式的語法糖，同時有 `prototype` 屬性和 `__proto__` 屬性，因此同時存在兩條繼承鏈。

1. 子類的 `__proto__` 屬性，表示構造函式的繼承，總是指向父類。
2. 子類 `prototype` 屬性的 `__proto__` 屬性，表示方法的繼承，總是指向父類的 `prototype` 屬性。

```js
class A {}

class B extends A {}

console.log(Object.getPrototypeOf(B) === A) // true -> 指向父類
// 等價於
// 換句話說，B.__proto__ 指向 A，表示 B 是從 A 擴展 (extends) 來的
console.log(B.__proto__ === A) // true -> 指向父類

// 當 B 繼承 A 時，js 自動讓 B.prototype 的 __proto__ 指向 A.prototype
// 表示 B.prototype 是從 A.prototype 繼承來的
console.log(B.prototype.__proto__ === A.prototype) // true -> 指向父類的 prototype

const b = new B()

// 當我們使用 new B() 創建一個 b 實例時，該物件的 __proto__ 會指向 B.prototype，這樣實例就可能訪問到 B.prototype
console.log(b.__proto__ === B.prototype) // true
// 等價於
console.log(Object.getPrototypeOf(b) === B.prototype) // true
```

🚨 圖解：

- ---> 代表 `__proto__` 指向 (原型鏈)
- | 在這裡是用來分割兩條不同的繼承鏈，上半部是實例原型鏈(Prototype Chain)，下半部是類(函式)繼承鏈(Class Inheritance)

```
b  --->  B.prototype  --->  A.prototype  --->  Object.prototype  --->  null
 |            |
 |            |
繼承          繼承
B       --->  A  --->  Function.prototype  --->  Object.prototype  --->  null

static 屬性及與方法是綁定在類本身 (A, B) 上，而不是 prototype，所以會跟著 __proto__ 走
```

如果用程式來描述的話，這樣的結果是因為，類的繼承是按照下面的模式實現的

```js
class A {}

class B {}

// 實踐方式是會類似這樣
// Object.setPrototypeOf = function (obj, proto) {
//   obj.__proto__ = proto;
//   return obj;
// }

// B 的實例繼承 A 的實例
Object.setPrototypeOf(B.prototype, A.prototype)
// 等同於
B.prototype.__proto__ = A.prototype

// B 繼承 A 的靜態屬性
Object.setPrototypeOf(B, A)

const b = new B()
```

### \_\_proto\_\_

子類實例的 `__proto__` 屬性的 `__proto__` 屬性，指向父類實例的 `__proto__` 屬性。

```js
class Point {}

class ColorPoint extends Point {}

const p1 = new Point(2, 3)
const p2 = new ColorPoint(2, 3, "red")

console.log(p2.__proto__ === p1.__proto__) // false
console.log(p2.__proto__.__proto__ === p1.__proto__) // true
```

```js
p2.__proto__.__proto__.printName = function () {
  console.log("ha")
}

p1.printName() // ha
```

### Native Inheritance

js 原生的構造函式大致有下面這些

- Boolean()
- Number()
- String()
- Array()
- Date()
- Fcuntion()
- RegExp()
- Error()
- Object()

以往這些都是無法繼承的，比如，不能自定義一個 `Array` 的子類，但 ES6 允許原生繼承構造函式定義子類，因為 ES6 是先建立父類的實例對象 `this`，然後再用子類的構造函式修飾 `this`，使得父類的所有行為都可以繼承

```js
// 繼承原生 array 的範例
class MyArray extends Array {
  constructor(...args) {
    super(...args)
  }
}

const arr = new MyArray()
arr[0] = 12
console.log(arr.length) // 1

arr.length = 0
console.log(arr[0]) // undefined
```

🚨 注意，繼承 `Object` 的子類，有一個行為差異

```js
class NewObj extends Object {
  constructor() {
    super(...arguments)
  }
}

const o = new NewObject({ attr: true })
console.log(o.attr === true) // false
```

這是因為 ES6 改變了 `Object` 構造函式的行為，一旦發現 `Object` 不是透過 `new Object()` 或 `Reflect.construct()` 這種形式調用，ES6 規定 `Object` 構造函式會忽略參數。

### Mixin

Mixin 指的是多個對象合成一個新的對象，新對象具有各個組成成員的接口

```js
const a = {
  a: "a",
}

const b = {
  b: "b",
}

const c = { ...b, ...c } // { a: 'a', b: 'b' }
```

更完整的實現

```js
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()) // 拷貝實體屬性
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin) // 拷貝靜態屬性
    copyProperties(Mix.prototype, mixin.prototype) // 拷貝原型屬性
  }

  return Mix
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== "constructor" && key !== "prototype" && key !== "name") {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
```

### Conclusion

這些是我看阮一峰作者 ECMAScript 6 入門 class 的繼承部分，所做的筆記，大部分是搬磚並加上一些使用情境及自己的理解及想法，方便自己日後有需求可以快速回憶。

🚨 其中下方這張圖尤為重要

```
b  --->  B.prototype  --->  A.prototype  --->  Object.prototype  --->  null
 |            |
 |            |
繼承          繼承
B       --->  A  --->  Function.prototype  --->  Object.prototype  --->  null
```

```js
class A {}

class B extends A {}

const b = new B()

// 實例原型鏈(Prototype Chain)
console.log(b.__proto__ === B.prototype)
console.log(B.prototype.__proto__ === A.prototype)
console.log(A.prototype.__proto__ === Object.prototype)
console.log(Object.prototype.__proto__ === null)

// 類(函式)繼承鏈(Class Inheritance)
console.log(B.__proto__ === A)
console.log(A.__proto__ === Function.prototype)
console.log(Function.prototype.__proto__ === Object.prototype)
console.log(Object.prototype.__proto__ === null)
```
