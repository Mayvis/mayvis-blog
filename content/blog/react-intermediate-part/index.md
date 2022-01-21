---
title: React Intermediate Part 
date: "2022-01-19T12:00:00.000Z"
description: 此篇文章是之前自己紀錄並收錄在自己的 Notion 筆記內，一些關於 React 較困難部分的東西，初衷是希望自己能更快速的進入專案狀態，畢竟也有段時間沒使用 React 來開發前端了，所以比較偏向自己複習及學習用，內容大多使用英文撰寫及敘述。
tags: ["react", "frontend"]
---

由於平時自己比較常使用 Vue 來做前端開發，React 現在我也已經比較少在做使用，除非是在處理自己現在的這個部落格，大多數是客戶或主管有要求，那這篇內容是我之前在 FrontendMaster 複習及學習 React 時紀錄的筆記，定時花錢強迫自己學習😅，我把內容整理並移到自己的部落格內。

### useState

```JSX
import { useState } from "react";

const Component = () => {
  const [isGreen, setIsGreen] = useState(true);

  return (
    <div>
      <div>{someState}</div>
      <button 
        onClick={(e) => setSomeState(!someState)}
        style={{ color: isGreen ? 'limegreen' : 'crimson'}}
      >Click</button> 
    </div>
  )
}

export default Component;
```

### useEffect

```JSX
import { useEffect } from "react";

const Component = () => {
  const [time, setTime] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTime(new Date()), 1000);

    return () => clearTimeout(timer);
  }, [time])

  return <div>{time.toLocaleTimeString()}</div>
}

export default Component;
```

### useContext

```JSX
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
      <h4>Thrid level</h4>
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

```JSX
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
```JSX
import { useReducer } from "react";

const limitRGB = (num) => (num < 0 ? 0 : num > 255 ? 255 : num);

const step = 50;

const reducer = (state, action) => {
  switch(action.type) {
    case "INCREMENT_R":
      return Object.assign({}, state, { r: limitRGB(state.r + step) });
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

### useMemo

Performance optimization: handle very expensive computed.

🔥🔥 Only use this when you actually already have a problem. 🔥🔥

```JSX
import { useState, useMomo } from "react";

const fibonacci = (n) => {
  if (n <= 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const MemoComponent = () => {
  const [num, setNum] = useState(1);
  const [isGreen, setIsGreen] = useState(true);
  // this will cause rerender problem, if num is very high like 40.
  // when you click h1 to change the color, this will recaculate the fibonacci 40 times again.
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

Think useCallback like this way.

We have two different Fibonacci's that are functionally the same function, but are actually two different instances of the same function.

```Javascript
function a() {}
function b() {}

console.log(a === b) // false
```

`useCallback` is like to make `a === b` to be true.

```Javascript
function a() {}
function b() {}

console.log(a === b) // true
```

`memo` is like to check the props, if props stayed the same, then it's not going to re-render.

```JSX
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
  )
}

export default CallbackComponent;
```

### useLayoutEffect

Sometimes you need that function to immediately run right after. Can be think like to be a synchronously useEffect.

```JSX
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
  )
}

export default LayoutEffectComponent;
```

### useImperativeHandle

Create function on the child component in ElaborateInput by using `useImperativeHandle` and then use this function by calling it on the parent component in ImperativeHandleComponent.

```JSX
import { useState, useRef, useImperativeHandle, forwareRef } from "react";

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
}
```

### useDebugValue

```JSX
import { useState, useEffect, useDebugValue } from "react";

const useIsRaining = () => {
  const [isRaining, setIsRaining] = useState(false);

  useEffect(() => {
    setIsRaining(Math.random() > 0.5);
  });

  useDebugValue(isRaining ? "Is raining" : "Is not raining");

  return isRaining;
}

const DebugValueComponent = () => {
  const isRaining = useIsRaining();

  return (
    <div>
      <h1>useDebugValue Example</h1> 
      <p>Do you need a coat today? {isRaining ? "yes" : "maybe"}</p>
    </div>
  )
}

export default DebugValueComponent;
```

### Code split by using lazy and Suspense

Cut your bundle size.

```JSX
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const Details = lazy(() => import("./Details"));
const SearchaParams = lazy(() => import("./SearchParams"));

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

```JSX
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

```JSX
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

```JSX
// pacakage.json 
{
  "script": {
    "build:client": "parcel build --public-url ./dist/ src/index.html",
    "build:server": "parcel build -d dist-server --target node server/index.js",
    "build": "npm run build:client && npm run build:server",
    "start": "npm -s run build && node dist-server/index.js"
  }
}
```

```Javascript
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
    "react/self-closing-comp": [
      "error"
    ],
    "react/jsx-filename-extension": [
      "warn",
      {
        "extensions": [
          ".tsx"
        ]
      }
    ],
    "react/react-in-jsx-scope": 0
  },
  "plugins": [
    "react",
    "import",
    "jsx-a11y",
    "@typescript-eslint"
  ],
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
      "@typescript-eslint/parser": [
        ".ts",
        ".tsx"
      ]
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

```Javascript
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

```Javascript
// reducer/index.js
import { combineReducers } from "redux";
import location from "./location";
import animal from "./animal";

export default combineReducers({
  location,
  animal
});
```

```Javascript
// reducer/location.js
export default function location(state="Seattle, WA" , action) { switch(action.type) {
    case "CHANGE_LOCATION":
      return action.payload
    default
      return state;
  }
}
```

```Javascript
// action/changeAnimal.js
export default function changeAnimal(animal) {
  return { type: "CHANGE_ANIMAL", payload: animal }
}
```

```JSX
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

```JSX
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

Microsoft engineer engineer Brian Holt said: I think 100% test coverage is a fable fairy tale that's not worth chasing because a lot of times you write garbage tests. Just to make sure you cover that one last line, right? And I don't believe in that garbage one last test, right? I will not write that one last test.

Below is the simple react jest test.

```Javascript
// __test__/Pet.test.js
import { expect, test } from "@/jest/globals";
import { StaticRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import Pet from "../Pet";

test("displayes a default thumbnail", async () => {
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

```Javascript
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

```Javascript
// using @testing-library/react-hooks
import { expect, test } from "@jest/globals";
import { renderHook } from "@testing-library/reack-hooks";
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

```Javascript
// setupJest.js
import { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();
```

```Javascript
// useBreedList.test.js
import { expect, test } from "@jest/globals";
import { renderHook } from "@testing-library/reack-hooks";
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

```Javascript
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
