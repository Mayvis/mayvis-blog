---
title: Bind vs Apply vs Call
date: "2022-02-07T12:00:00.000Z"
description: 這一兩年跟墨雨合作接案以及運維自家公司的產品及網站，把自己搞得有點忙，平時雖然也有與公司同事討論程式甚至是教導他們，但處理到 JavaScript 比較精細的部分，還是稍嫌較少的，大多數都在討論如何完成專案，比較困難的部分也大多圍繞著演算法之類的東西，所以覺得自己 JavaScript 相對較深或容易搞混的部分有點荒廢了，畢竟實際用到的機會真的很少，那這篇文章主要敘述 Bind, Apply 及 Call 之間的差異，以及我對他們使用時機的理解；由於這篇因為也是從我的 Notion 筆記裡面整理出來的，會是以英文敘述。
tags: ["javascript"]
---

### When to use

1. Use `.bind` when you want that function to **later** be called with a certain context, useful in events.
1. Use `.call` or `.apply` when you want to invoke the function **immediately**, and modify the context.

### Call

The `call()` method calls a function with a given `this` value and arguments provided individually.

**Important**: When to use `call` -> Have to correctly assign `this` situation.

#### Syntax

```javascript
fn.call(thisArg, arg1, arg2..., argN);
```

- thisArg - **Optional**

  The value to use as `this` when calling `func`.

- arg1, arg2..., argN - **Optional**

  Arguments for the function.

#### Example

```javascript
const person = {
  fullName: function (city, country) {
    return `${this.firstName} ${this.lastName} ${city} ${country}`
  },
}

const person1 = {
  firstName: "John",
  lastName: "Doe",
}

const person2 = {
  firstName: "Mary",
  lastName: "Doe",
}

person.fullName.call(person1, "Oslo", "Norway")
```

### Apply

The `apply()` method calls a function with a given `this` value, and `arguments` provided as an array or an array-like object.

**Important**: When to use `apply` instead of using `call` -> you have **dynamic** args.

#### Syntax

```javascript
fn.apply(thisArg, [argsArray])
```

- thisArg - **Required**

  The value to use as `this` when calling `func`.

- argsArray - **Optional**

  **Must be an array-like object**. Arguments for the function.

#### Example

```javascript
const numbers = [5, 6, 2, 3, 7]

const max = Math.max.apply(null, numbers)
const min = Math.min.apply(null, numbers)

console.log(max) // 7
console.log(min) // 2
```

#### Different with call

```javascript
const arr = [1, 2, 3]

function add() {
  // arguments -> represents the function args.
  return Array.from(arguments).reduce((acc, val) => {
    return acc + val
  })
}

console.log(add.call(null, 1, 2, 3)) // 6
console.log(add.apply(null, [1, 2, 3])) // 6
```

### Bind

The `bind()` method creates a new function that, when called, has its `this` keyword set to the provided value, with a given sequence of arguments preceding any provided when the new functions is called.

**Important**: When to use `bind` -> Have to correctly assign `this` situation and use it later.

The `bind()` function creates a new **bound function**, which is an _exotic funcion object_ (a term from ECMAScript 2015) that wraps the original function object. Calling the bound function generally results in the execution of its wrapped function.

#### Syntax

```javascript
fn.bind(thisArgs, arg1, arg2..., argN);
```

- thisArg

  The value to use as `this` when calling `func`.

- arg1, arg2, ...argN - **Optional**

  Arguments to prepend to arguments provided to the bound function when invoking `func`.

#### Example

```javascript
const module = {
  x: 42,
  getX: function () {
    return this.x
  },
}

const unboundGetX = module.getX
console.log(unboundGetX) // undefined

const boundGetX = unboundGetX.bind(module)
console.log(boundGetX())
```

### Bonus: Execute custom bind polyfill example

```javascript
let obj = {
  name: "John",
}

let myFunc = function () {
  console.log(this.name) // 3. calling obj's name
}

Function.propotype.customBind = function (obj) {
  let _this = this
  return function () {
    _this.apply(obj) // 2. apply obj to current function
  }
}

let newFunc = myFunc.customBind(obj) // 1. bind obj to function prototype
newFunc() // 'John'
```
