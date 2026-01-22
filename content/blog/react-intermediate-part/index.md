---
title: React Intermediate Part
date: "2026-01-22T12:00:00.000Z"
description: 此篇文章是之前自己紀錄並收錄在自己的 Notion 筆記內，一些關於 React 較困難部分的東西，初衷是希望自己能更快速的進入專案狀態，畢竟也有段時間沒使用 React 來開發前端了，所以比較偏向自己複習及學習用，內容大多使用英文撰寫及敘述。
tags: ["react", "frontend"]
---

### Preface

此篇是2022/01/19，所寫的文章，但我 update 了一下，所以移到近期，

由於平時自己比較常使用 Vue 來做前端開發，~~React 現在我也已經比較少在做使用，除非是在處理自己現在的這個部落，不然大多數是客戶或主管有要求要使用才會使用~~，現在應該是偶爾做使用，那這篇內容是我之前在 FrontendMaster 複習及學習 React 時紀錄的筆記，有點定時花錢強迫自己學習的概念 😅，最終我把內容整理並移到自己的部落格內，不過現在也偶爾加入自己的東西，總之就記錄一下自己的想法。

### useState

```jsx
import { useState } from "react";

function expensiveInitialState() {
  // do something
  return 0;
}

const Component = () => {
  const [isGreen, setIsGreen] = useState(true);
  // 也可以使用 function 的方式來初始化 state
  const [someState, setSomeState] = useState(() => expensiveInitialState())
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>{someState}</div>
      <button
        onClick={() => setSomeState(!someState)}
        style={{ color: isGreen ? 'limegreen' : 'crimson'}}
      >Click</button>
      <div>{count}</div> 
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>Click</button>
    </div>
  )
}

export default Component;
```

### useEffect

useEffect 這項功用主要在 side effect 上，像是抓取資料，設定及取消計時器，直接更新 DOM 等，在 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` 這些生命週期內操作的行為。

在使用 dependency array 去做 diff 時，很多人都會把 `setState` 也放入，這究竟是錯還是對？坦白說，答案是沒錯的，但其實可以省略，__因為 react 會保證每次的 `setState` 都是相同的，也就等同於沒作用，所以你不用再額外進行添加__。但是為何很多 React 高手還是有將其加入呢？因為如果有裝 eslint 的話，沒將 `setState` 加入的話是會有警告的，所以如果你不想要看到警告的話就加入就好，警告是 __react-hooks/exhaustive-deps__。

```jsx
import { useEffect } from "react";

const Component = () => {
  const [time, setTime] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTime(new Date()), 1000);

    return () => clearTimeout(timer);
  }, [time, setTime])

  return <div>{time.toLocaleTimeString()}</div>
}

export default Component;
```

### useEffectEvent

下面的範例出自 [React 官方文件](https://react.dev/reference/react/useEffectEvent)，想必大家在使用 useEffect 一定會遇到以下的問題：

```jsx
// 不必要的依賴
const [theme, setTheme] = useState(initialTheme);

useEffect(() => {
  const conn = connect(roomId);
  conn.on('connected', () => showNotification(theme));
  conn.connect();
  return () => conn.disconnect();
}, [roomId, theme]); // theme 改了也會重跑（其實不想😢）
```

當我們在 useEffect 裡面使用到外部的變數時，React 會要求我們把這些變數加入 dependency array 裡面，這樣做的目的是為了確保當這些變數改變時，useEffect 會重新執行，以確保我們使用到的是最新的值。但是有時候我們並不希望 useEffect 因為某些變數的改變而重新執行，像是上面的範例中，我們並不希望 theme 的改變會導致 useEffect 重新執行，因為這樣會導致連線被重新建立，這不是我們想要的行為。

```jsx
// Latest Ref Pattern 解法
const [theme, setTheme] = useState(initialTheme);
const themeRef = useRef(theme);

// 讓 ref 保持最新的值
useEffect(() => {
  themeRef.current = theme;
}, [theme]);

useEffect(() => {
  const conn = connect(roomId);
  conn.on('connected', () => showNotification(themeRef.current));
  conn.connect();
  return () => conn.disconnect();
}, [roomId]); // 只會在 roomId 改時重跑
```

在 react 19.2 官方釋出的這個 hook，可以解決上述的問題，他的實質作用我覺得用英文來講比較準確，是將 non-reactive logic inside effects 提出來，使用該變數不會導致 useEffect 重新執行。

```jsx
// non-reactive logic inside effects
const onConnected = useEffectEvent(() => {
  showNotification('Connected!', theme);
});

useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.on('connected', () => {
    onConnected(); // 將引用會導致重新執行的變數移到 useEffectEvent 裡面
  });
  connection.connect();
  return () => connection.disconnect();
}, [roomId]);
```

老實說，我不太確定這個 hook 是否是最佳解，因為老實說他在無形中又增加了一些心智負擔，但是當面臨產品實際的情況，相依參數的增加，的確可以減少許多程式碼，像是下面這個範例：

```jsx
// Latest Ref Pattern 寫法
const [theme, setTheme] = useState(initialTheme);
const [userId, setUserId] = useState(0);

const themeRef = useRef(theme);
const userIdRef = useRef(userId);

// 手動同步 Ref
useEffect(() => {
  themeRef.current = theme;
  userIdRef.current = userId;
  //... 假設還有其他參數也要同步，會一路往下寫，依此類推，而使用 useEffectEvent 就不需要這樣做
  // xxx.current = xxx;
}, [theme, userId]);

// 假設這是一個判斷是否需要強制重連的邏輯
const isSpecialUser = userId === 1;

useEffect(() => {
  const conn = connect(roomId);
  conn.on('connected', () => {
    // 從 Ref 讀取最新值，避開閉包陷阱
    showNotification(`User ${userIdRef.current} connected with ${themeRef.current} theme`);
  });
  conn.connect();
  return () => conn.disconnect();
}, [roomId, isSpecialUser]); // 只有 roomId 或身分轉變時才重連
```

```jsx
// 新的寫法
const [theme, setTheme] = useState(initialTheme);
const [userId, setUserId] = useState(0);

// 自動保持最新，不需手動寫 useRef 和同步用 useEffect
const onConnected = useEffectEvent(() => {
  showNotification(`User ${userId} connected with ${theme} theme`);
});

// 假設這是一個判斷是否需要強制重連的邏輯
const isSpecialUser = userId === 1;

useEffect(() => {
  const conn = connect(roomId);
  conn.on('connected', onConnected); // 永遠呼叫到最新的邏輯
  conn.connect();
  return () => conn.disconnect();
}, [roomId, isSpecialUser]); // 清晰定義：只有這兩個變了才重連
```

### useContext

```jsx
import { useState, useContext, createContext } from "react";

const UserContext = createContext([
  {
    firstName: "John",
    lasName: "Doe",
  },
  (obj) => obj
])

const LevelFive = () => {
  const [user, setContext] = useContext(UserContext);

  return (
    <div>
      <h5>{`${user.firstName} ${user.lastName}`}</h5>
    </div>
  )
}

const LevelFour = () => {
  return (
    <div>
      <h4>Fourth level</h4>
      <LevelFour />
    </div>
  )
}

const LevelThree = () => {
  return (
    <div>
      <h4>Third level</h4>
      <LevelFour />
    </div>
  )
}

const LevelTwo = () => {
  return (
    <div>
      <h4>Second level</h4>
      <LevelThree />
    </div>
  )
}

const LevelOne = () => {
  const userState = useState({
    firstName: "Mayvis",
    lastName: "Chen"
  })

  return (
    <UserContext.Provider value={userState}>
      <h1>First level</h1>
      <LevelTwo />
    </UserContext.Provider>
  )
}

export default LevelOne;
```

### useRef

useRef 用法很多，像是他可以依附在 DOM 上，也可以用來儲存變數。

```jsx
import { useState, useRef } from "react";

const RefComponent = () => {
  const [stateNumber, setStateNumber] = useState(0);
  const numRef = useRef(0);

  function incrementAndDelayLogging() {
    setStateNumber(stateNumber + 1);
    numRef.current++;

    setTimeout(() => {
      alert(`state: ${stateNumber} | ref: ${numRef.current}`) // state 0, ref 1
    }, 1000)
  }

  return (
    <div>
      <h1>useRef Example</h1>
      <button onClick={incrementAndDelayLogging}>delay logging</button>
      <h4>state: {stateNumber}</h4>
      <h4>ref: {numRef.current}</h4>
    </div>
  )
}

export default RefComponent;
```

### useReducer

```jsx
import { useReducer } from "react";

const limitRGB = (num) => (num < 0 ? 0 : num > 255 ? 255 : num);

const step = 50;

const reducer = (state, action) => {
  switch(action.type) {
    case "INCREMENT_R":
      return Object.assign({}, state, { r: limitRGB(state.r + step) }); // 也可以使用 spread operator
    case "DECREMENT_R":
      return Object.assign({}, state, { r: limitRGB(state.r - step) });
    case "INCREMENT_G":
      return Object.assign({}, state, { g: limitRGB(state.g + step) });
    case "DECREMENT_G":
      return Object.assign({}, state, { g: limitRGB(state.g - step) });
    case "INCREMENT_B":
      return Object.assign({}, state, { b: limitRGB(state.b + step) });
    case "DECREMENT_B":
      return Object.assign({}, state, { b: limitRGB(state.b - step) });
    default:
      return state;
  }
}

const ReducerComponent = () => {
  const [{ r, g, b }, dispatch] = useReducer(reducer, { r: 0, g: 0, b: 0 });

  return (
    <div>
      <h1 style={{ color: `rgb(${r}, ${g}, ${b})` }}>useReducer Example</h1>
      <div>
        <span>r</span>
        <button onClick={() => dispatch({ type: "INCREMENT_R" })}>+</button>
        <button onClick={() => dispatch({ type: "DECREMENT_R" })}>-</button>
      </div>
      <div>
        <span>g</span>
        <button onClick={() => dispatch({ type: "INCREMENT_G" })}>+</button>
        <button onClick={() => dispatch({ type: "DECREMENT_G" })}>-</button>
      </div>
      <div>
        <span>b</span>
        <button onClick={() => dispatch({ type: "INCREMENT_B" })}>+</button>
        <button onClick={() => dispatch({ type: "DECREMENT_B" })}>-</button>
      </div>
    </div>
  );
}
```

### React.memo

當某個元件裡的狀態發生改變時，react會重新渲染該組件，如果有子組件，儘管它與該組件狀態無關，但是它也會被重新渲染，而這時候就可以使用 React.memo 來避免不必要的重新渲染。

React.memo 會比較前後兩次的 props，如果沒有改變，就不會重新渲染。預設是使用 shallow comparison，也就是所謂的淺比較，印象中，使用的方式是 `Object.is(value1, value2)`；此外，比較方式也可以透過第二個參數來自訂，假使你想使用 deep comparison (深比較)，可以使用 lodash 的 isEqual，算是滿常見的做法，如下：

```js
Object.is([1, 2], [1, 2]) // false
_.isEqual([1, 2], [1, 2]) // true
```

> 但是比較時還有個問題，由於 React 只要重新渲染，組件內的 function 就會被重新定義，而這時便可以使用 `React.useCallback` 緩存 function 來解決該問題。

**請盡量避免心智負擔：**

1. 只渲染一次，之後都不會更新的組件，不要使用 `React.memo`
2. props 每次都會改變的組件，不要使用 `React.memo`
3. 組件如果簡單，不要使用 `React.memo`，並不會提升多少效能
4. 請盡量使用 React Profiler devtool 來檢測效能，判斷是否要使用 `React.memo`，畢竟**緩存也會有成本**

_Tips: 可以寫一個簡單的 hook 去看渲染的次數_

```jsx
import { useRef } from 'react';

const useRenderCount = () => {
  const renderCount = useRef(0);

  console.log('render count: ', renderCount.current++);
};

export default useRenderCount;
```

### useMemo

Performance optimization: handle very expensive computed.

🔥🔥 Only use this when you actually already have a problem. 🔥🔥

```jsx
import { useState, useMemo } from "react";

// 因為遞迴的關係，當 num 越大，計算量就會越大，如果我們將前一個計算的結果存起來，就可以避免重複計算
// 而 React.useMemo 就是用來做這件事情的，它會接收兩個參數，第一個是 callback，第二個是依賴的值，當依賴的值改變時，才會重新計算 callback 的結果
// React.useCallback 也是一樣的道理，只是它是用來緩存 function 的
// fibonacci -> 1 1 2 3 5 8
const fibonacci = (n) => {
  if (n <= 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const MemoComponent = () => {
  const [num, setNum] = useState(1);
  const [isGreen, setIsGreen] = useState(true);
  // this will cause rerender problem, if num is very high like 40.
  // when you click h1 to change the color, this will recalculate the fibonacci 40 times again.
  // const fib = fibonacci(num);
  const fib = useMemo(() => fibonacci(num), [num]);

  return (
    <div>
      <h1
        onClick={() => setIsGreen(!isGreen)}
        style={{ color: isGreen ? "limegreen" : "crimson"}}
      >
        useMemo Example
      </h1>
      <h2>
        Fibonacci of {num} if {fib}
      </h2>
      <button onClick={() => setNum(num + 1)}>+</button>
    </div>
  )
}
```

### useCallback

The useCallback hook is used when you have a component in which the child is rerendering again and again without need.

Pass an inline callback and an array of dependencies, useCallback will return a **memorized version of the callback** that only changes if one of the dependencies has changed. This is useful when passing callbacks to optimized child components that replay on reference equality to prevent unnecessary renders.

```javascript
const memorizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

Think useCallback like this way.

We have two different Fibonacci's that are functionally the same function, but are actually two different instances of the same function.

```javascript
function a() {}
function b() {}

console.log(a === b) // false -> in real world
```

`useCallback` is like to make `a === b` to be true.

```javascript
function a() {}
function b() {}

console.log(a === b) // true
```

`memo` is like to check the props, if props stay the same, then it's not going to re-render.

> Tip: `useCallback(fn, deps)` equals `useMemo(() => fn, deps)`.

```jsx
import { useState, useEffect, useCallback, memo } from "react";

const ExpensiveComputationComponent = memo(({ compute, count}) => {
  return (
    <div>
      <h1>computed: {computed(count)}</h1>
      <h4>last re-render {new Date().toLocaleTimeString()}</h4>
    </div>
  )
});

const CallbackComponent = () => {
  const [time, setTime] = useState(new Date());
  const [count, setCount] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setTime(new Date()), 1000);
    return () => clearTimeout(timer);
  }, [time]);

  const fibonacci = (n) => {
    if (n <= 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  return (
    <div>
      <h1>useCallback Example {time.toLocaleTimeString()}</h1>
      <button onClick={() => setCount(count + 1)}>
        current count {count}
      </button>
      <ExpensiveComputationComponent
        compute={useCallback(fibonacci, [])}
        count={count}
      />
    </div>
  );
};

export default CallbackComponent;
```

### React.StrictMode

在新版本的 `React.strictMode` 你會發現你有些執行的程式碼，觸發了兩次，造成的原因是以下三點。

1. Your components will re-render an extra time to find bugs caused by impure rendering.
2. Your components will re-run Effects an extra time to find bugs caused by missing Effect cleanup.
3. Your components will be checked for usage of deprecated APIs.

一的行為流程大致上是 useEffect 會幫你 mounted -> unmounted -> re-mounted

至於解釋我個人認為從第二點的方式講解比較簡單易懂，由於點擊按鈕的行為 count 數值變動，間接觸發了 side effect，但由於你初始時，未在 unmounted 階段時將事件清除，也就等同於多註冊了一次 keypress 事件。

```jsx
const App = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('effect') // 因為第一點的關係，這邊會觸發兩次，簡單來講就是 useEffect 在這 component 註冊時會觸發兩次

    function handleKeypress() {
      console.log(count) // 這邊點擊時如果沒清除，會觸發兩次，清除後就會變成一次
    }

    document.addEventListener('keypress', handleKeypress) // 註冊事件

    // 將下面的程式碼添加上去，就可以預防第二點的問題
    // return () => document.removeEventListener('keypress', handleKeypress)

  }, [count]) // count 的 side effect

  return (
    <React.StrictMode>
      <button onClick={() => setCount(c => c + 1)}>click</button>
    </React.StrictMode>
  );
}
```

像是下面這個範例，由於 strictMode 會讓 useEffect 再註冊一次，所以相同的 setInterval 又再註冊了一遍，造成 count 數值變動兩次，體感上會很像 `setCount(c => c + 2)` 這動作。

```jsx
const App = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('effect') // 因為第一點的關係，這邊會觸發兩次，簡單來講就是 useEffect 在這 component 註冊時會觸發兩次

    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)

    // return () => clearInterval(interval)
  }, [])

  return (
    <React.StrictMode>
      <div>{count}</div>
    </React.StrictMode>
  );
}
```

好的，上面是兩個簡單的範例，很多 youtuber 講 StrictMode 的好幾乎都是透過上方這種簡單的範例，但是其實實際在寫 React 時，你會發現有時你真心只想要註冊一次，ex: websocket，或著抓取資料...等，這時 react 的行為就會很弔詭，前者 websocket 會 disconnect，後者資料會抓兩次，這也是為啥又有些人說要把 strictMode 關掉的原因。

你可以使用 useRef 然後判斷 current 是不是有東西，來預防該情況。但畢竟是多寫的程式碼，所以造成了額外的心智負擔，這也是為啥開發 React 我會建議是有個 leader 在帶的基礎底下在使用其進行開發，會比較舒服，當局者迷。

題外話：你可以使用額外的套件來避免這個問題，像是 [react-query](https://tanstack.com/query/latest)，但是就我個人的觀點，這站在教學的角度其實不大好。

```jsx
import { useEffect, useRef } from "react";

const App = () => {
  const onceRef = useRef(false)

  useEffect(() => {
    // 使用類似的做法去實作
    if (onceRef.current === false) {
      const fetchData = async () => {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
        const data = await res.json()
        console.log(data)
      }
  
      fetchData()

      return () => onceRef.current = true
    }
  }, [])

  return <div>...</div>
}
```

### useLayoutEffect

> React Team: We recommend starting with useEffect first and only trying useLayoutEffect if that causes a problem.

Sometimes you need that function to immediately run right after. Can be think like to be a synchronously useEffect.

可以把順序想像成如下：
- useEffect (Component > State Changes > Component Renders > Rendered Component is Printed on Screen > useEffect runs)
- useLayoutEffect (Component > State Changes > Component Renders > useLayoutEffect runs > Rendered Component is Printed on Screen)

```jsx
import { useState, useLayoutEffect, useRef } from "react";

const LayoutEffectComponent = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const el = useRef();

  useLayoutEffect(() => {
    setWidth(el.current.clientWidth);
    setHeight(el.current.clientHeight);
  }, [setWidth, setHeight]);

  return (
    <div>
      <h1>useLayoutEffect Example</h1>
      <h2>textarea width: {width}</h2>
      <h2>textarea height: {height}</h2>
      <textarea
        onClick={() => {
          // If using useEffect, effect happened later, and the click event happened sooner in the millisecond.
          // May cause getting wrong value and will cause above width value change then re-render.
          setWidth(0);
        }}>
        ref={el}
      </textarea>
    </div>
  );
};

export default LayoutEffectComponent;
```

### useImperativeHandle

Create function on the child component in ElaborateInput by using `useImperativeHandle` and then use this function by calling it on the parent component in ImperativeHandleComponent.

Should use this hook with `forwardRef`.

```jsx
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

const ElaborateInput = forwardRef(
  ({ hasError, placeholder, value, update}) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
      return {
        focus() {
          inputRef.current.focus();
        }
      }
    });

    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "5px 15px",
          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: hasError ? "crimson" : "#999999",
          borderRadius: "5px",
          margin: "0 10px",
          textAlign: "center"
        }}
      />
    )
  }
);

const ImperativeHandleComponent = () => {
  const [city, setCity] = useState("Seattle");
  const [state, setState] = useState("WA");
  const [error, setError] = useState("");
  const cityEl = useRef();
  const stateEl = useRef();

  function validate() {
    // https://stackoverflow.com/a/25677072
    if (
      !/^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]+$/.test(
        city
      )
    ) {
      setError("city");
      cityEl.current.focus();
      return;
    }

    if (!/^[A-Z]{2}$/.test(state)) {
      setError("state");
      stateEl.current.focus(); // this ref will get useImperativeHandle registered focus event.
      return;
    }

    setError("");
    alert("Valid form!");
  }

  return (
    <div>
      <h1>useImperativeHandle Example</h1>
      <ElaborateInput
        hasError={error === "city"}
        placeholder={"City"}
        value={city}
        update={setCity}
        ref={cityEl}
      />
      <ElaborateInput
        hasError={error === "state"}
        placeholder={"State"}
        value={state}
        update={setState}
        ref={stateEl}
      />
      <button onClick={validate}>Validate Form</button>
    </div>
  )
};
```

### useDebugValue

```jsx
import { useState, useEffect, useDebugValue } from "react";

const useIsRaining = () => {
  const [isRaining, setIsRaining] = useState(false);

  useEffect(() => {
    setIsRaining(Math.random() > 0.5);
  });

  useDebugValue(isRaining ? "Is raining" : "Is not raining");

  return isRaining;
};

const DebugValueComponent = () => {
  const isRaining = useIsRaining();

  return (
    <div>
      <h1>useDebugValue Example</h1>
      <p>Do you need a coat today? {isRaining ? "yes" : "maybe"}</p>
    </div>
  );
};

export default DebugValueComponent;
```

### Code split by using lazy and Suspense

Cut your bundle size.

```jsx
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const Details = lazy(() => import("./Details"));
const SearchParams = lazy(() => import("./SearchParams"));

const App = () => {
  return (
    <Suspense
      fallback={<h2 style={{ textAlign: "center" }}>Loading routes...</h2>}
    >
      <Router>
        <Switch>
          <Route path="/details/:id">
            <Detail />
          </Route>
          <Route path="/">
            <SearchParams>
          </Route>
        </Switch>
      </Router>
    </Suspense>
  );
};
```

### Server side rendering

```jsx
// ClientApp.js - only have in browser
import { hydrate } from "react-dom"
import { BrowserRouter } from "react-router-dom";
import App from "./App"

// other stuff that should only happen in the browser like analytics.

hydrate(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root");
)
```

```jsx
// App.js
import { StrictMode } from "react-dom";
import { Switch, Route } from "react-router-dom";
import Details from "./Details";
import SearchParams from "./SearchParams";

const App = () => {
  return (
    <StrictMode>
      <Switch>
        <Route path="/details/:id">
          <Details />
        </Route> <Route path="/">
          <SearchParams />
        </Route>
      </Switch>
    </StrictMode>
  );
};

export default App;
```

```jsx
// package.json
{
  "script": {
    "build:client": "parcel build --public-url ./dist/ src/index.html",
    "build:server": "parcel build -d dist-server --target node server/index.js",
    "build": "npm run build:client && npm run build:server",
    "start": "npm -s run build && node dist-server/index.js"
  },
  "target : {
    "frontend": {
      "source": "src/index.html",
      "publicUrl": "/frontend"
    },
    "backend": {
      "source": "server/index.js",
      "optimize": false,
      "context": "node",
      "engines": {
        "node": ">=16"
      }
    }
  }
}
```

```jsx
import express from "express";
import { renderToString, renderToNodeStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import fs from "fs";
import App from "../src/App";

const PORT = process.env.PORT || 3000;

const html = fs.readFileSync("dist/index.html").toString();
const parts = html.split("not rendered");

const app = express();

app.use("/dist", express.static("dist"));

// using renderToString
// app.use((req, res) => {
//   const staticContext = {};
//   const reactMarkup = (
//     <StaticRouter url={req.url} context={staticContext}>
//       <App />
//     </StaticRouter>
//   );
//   res.status(staticContext.statusCode || 200);
//   res.send(`${parts[0]}${renderToString(reactMarkup)}${parts[1]}`);
//   res.end();
// });

// using renderToNodeStream
app.use((req, res) => {
  res.write(parts[0]);
  const staticContext = {};
  const reactMarkup = (
    <StaticRouter url={req.url} context={staticContext}>
      <App />
    </StaticRouter>
  );

  const stream = renderToNodeStream(reactMarkup);
  stream.pipe(res, { end: false });
  stream.on("end", () => {
    res.status(staticContext || 200);
    res.write(parts[1]);
    res.end();
  })
});

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
```

### React Typescript + Eslint

Below is my personal typescript eslint setup. (Initializing project by using vite react-ts with eslint)

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["./src"]
}
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "react/self-closing-comp": ["error"],
    "react/jsx-filename-extension": [
      "warn",
      {
        "extensions": [".tsx"]
      }
    ],
    "react/react-in-jsx-scope": 0
  },
  "plugins": ["react", "import", "jsx-a11y", "@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2021,
    "project": "./tsconfig.json",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolvers": {
      "typescript": {
        "alwaysTryTypes": true
      }
    }
  }
}
```

### Redux

Below is the simple redux setup and example.

```javascript
// store/index.js
import { createStore } from "react-redux";
import reducer from "../reducer";

const store = createStore(
  reducer,
  typeof window === "object" && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== undefined ?
    window.__REDUX_DEVTOOLS_EXTENSION__(): (f) => f
);

export default store;
```

```javascript
// reducer/index.js
import { combineReducers } from "redux";
import location from "./location";
import animal from "./animal";

export default combineReducers({
  location,
  animal
});
```

```javascript
// reducer/location.js
export default function location(state="Seattle, WA" , action) { switch(action.type) {
    case "CHANGE_LOCATION":
      return action.payload
    default
      return state;
  }
}
```

```javascript
// action/changeAnimal.js
export default function changeAnimal(animal) {
  return { type: "CHANGE_ANIMAL", payload: animal }
}
```

```jsx
import { Provider } from "react-redux";
import store from "./store";

const App = () => {
  return (
    <Provider store={store}>
      ...
    </Provider>
  )
}
```

```jsx
import { useSelector, useDispatch } from "react-redux";
import changeLocation from "./action/changeLocation";

const SearchParams = () => {
  const location = useSelector((state) => state.location);
  const dispatch = useDispatch();

  return (
    <div>
      <form>
        <label htmlFor="location">
          Location
          <input
            id="location"
            value={location}
            placeholder="Location"
            onChange={(e) => dispatch(changeLocation(e.target.value))}
          />
        <label>
        ...
      </form>
    </div>
  )
}
```

### Unit Test

Microsoft engineer Brian Holt said: I think 100% test coverage is a fable fairy tale that's not worth chasing because a lot of times you write garbage tests. Just to make sure you cover that one last line, right? And I don't believe in that garbage one last test, right? I will not write that one last test.

Below is the simple react jest test.

```javascript
// __test__/Pet.test.js
import { expect, test } from "@/jest/globals";
import { StaticRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import Pet from "../Pet";

test("display a default thumbnail", async () => {
  const pet = render(
    <StaticRouter>
      <Pet />
    </StaticRouter>
  );

  const petThumbnail = await pet.findByTestId("thumbnail");

  expect(petThumbnail.src).toContain("none.jpg");
});

test("displays a non-default, correct thumbnail", async () => {
  const pet = render(
    <StaticRouter>
      <Pet images={["1.jpg", "2.jpg", "3.jpg"]} />
    </StaticRouter>
  );

  const petThumbnail = await pet.findByTestId("thumbnail");

  expect(petThumbnail.src).toContain("1.jpg");
});
```

Testing custom hook. **Hooks always exist in components, so you can't test them outside of component**. So if you want to test react custom hook, One way is to render null fake component. The other way is to install an library called `@testing-library/react-hooks`.

```javascript
// render null component
import { expect, test } from "@jest/globals";
import { render } from "@testing-library/react";
import useBreedList from "../useBreedList";

function getBreedList(animal) {
  let list;

  function TestComponent() {
    list = useBreedList(animal);
    // component can be null
    return null;
  }

  render(<TestComponent />)

  return list;
}

test("gives an empty array with no animal", async () => {
  const [breedList, status] = useBreedList();

  expect(breedList).toHaveLength(0);
  expect(status).toBe("unloaded");
});
```

```javascript
// using @testing-library/react-hooks
import { expect, test } from "@jest/globals";
import { renderHook } from "@testing-library/react-hooks";
import useBreedList from "../useBreedList";

test("gives an empty array with no animal", async () => {
  const { result } = renderHook(() => useBreedList());
  const [breedList, status] = result.current;

  expect(breedList).toHaveLength(0);
  expect(status).toBe("unloaded");
});
```

Mocking the API for optimizing the test performance by installing the library called `jest-fetch-mock`.

```json
// package.json -> jest configuration part
{
  "jest": {
    "automock": false,
    "setupFiles": ["./src/setupJest.js"]
  }
}
```

```javascript
// setupJest.js
import { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();
```

```Javascript
// useBreedList.test.js
import { expect, test } from "@jest/globals";
import { renderHook } from "@testing-library/react-hooks";
import useBreedList from "../useBreedList";

test("gives an empty array with no animal", async () => {
  const { result } = renderHook(() => useBreedList(""));
  const [breedList, status] = result.current;

  expect(breedList).toHaveLength(0);
  expect(status).toBe("unloaded");
});

test("gives back breeds with an animal", async () => {
  const breeds = [
    "Havanese",
    "Bichon Frise",
    "Poodle",
    "Corgie"
  ];

  fetch.mockResponseOnce(JSON.stringify({
    animal: "dog",
    breeds
  }));

  const { result, waitForNextUpdate } = renderHook(() => useBreedList("dog"));

  await waitForNextUpdate();

  const [breedList status] = result.current;

  expect(status).toBe("loaded");
  expect(breedList).toEqual(breeds);
});
```

Snapshot the react component by using `react-test-renderer`.

```javascript
import { expect, test } from "@jest/globals";
import { create } from "react-test-renderer";
import Results from "../Results";

test("snapshot with no pets", () => {
  const tree = create(<Results pets={[]} />).toJSON();

  expect(tree).toMatchSnapshot();
})
```

Istanbul, to see test coverage. [Link](https://istanbul.js.org)

```json
{
  "script": {
    "jest:coverage": "jest --coverage"
  }
}
```

### Conclusion

這篇文章的 code 都在這個 [Github 連結](https://github.com/Mayvis/adopt-me-v6) 的不同 branch 內。
