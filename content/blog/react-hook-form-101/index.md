---
title: React Hook Form with zod
date: "2026-02-02T12:00:00.000Z"
description: 相信使用 react，大部分的前端工程師都會使用到 react-hook-form 這套軟體，那這篇文章寫一些關於其的相關知識。本篇範例都是使用 shadcn ui，react-hook-form 及 zod。
tags: ["react"]
---

### Preface

本篇範例都是使用 shadcn ui，react-hook-form 及 zod，

### async validation

下面是範例 code，但是在 input 底下運行這個 code，其實效能不是很好，基本上最好是要做 debounce，但 zod 本身沒有現有的方式支援 debounce。

```tsx
import './App.css'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'

// mimic async validation
const validateName = () => {
  console.log('trigger validateName') // if you type 3 times, this will trigger 3 times

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .refine(async () => {
      return !(await validateName())
    }, 'Name must be a valid name'),
})

type FormSchema = z.infer<typeof formSchema>

const defaultFormValues: FormSchema = {
  name: '',
}

function App() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues
  })

  const submit = async () => {
    // do something...
  }

  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(submit)}>
        <FormField
          name='name'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete='off' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end'>
          <Button type='submit' size='sm' className='w-full'>
            submit
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default App

```

### debounce async validation

實際跑下去，的確是不支援直接使用 debounce 的，你會發現他沒有等待 debounce 內的 cb 回傳，就直接顯示錯誤。

所以這邊你可以繼續使用 refine，但是基本上就是要手寫一個小型的 `awesome-debounce-promise` 邏輯。當然你也可以不使用 refine 客製化驗證，但我個人不大建議，原因在於邏輯會分散，後續會不好維護。你可能要去 watch 那個值，然後透過 useEffect 去 subscribe 及 unsubscribe...etc，基本上會使用到 useEffect 間接就會導致邏輯會相對複雜。😅

```tsx
import debounce from 'lodash.debounce'

const validateName = () => {
  console.log('trigger validateName') // if you type 3 times, this will trigger 3 times

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

// ❌ not working
const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .refine(debounce(async () => await !validateName()), 'Name must be a valid name'),
})
```

下方是可以實際運行並搭配 `awesome-debounce-promise` 程式碼，此程式碼可以正常 debounce 進行驗證

```tsx
import AwesomeDebouncePromise from 'awesome-debounce-promise'

const validateName = () => {
  console.log('trigger validateName')
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('in')
      resolve(true)
    }, 1000)
  })
}

// ✅ working
const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .refine(
      AwesomeDebouncePromise(async () => !(await validateName()), 1000),
      'Name is not valid',
    ),
})
```

那 `awesome-debounce-promise` 這套件為何可以使用呢？

這套件有三個核心概念

1. debounce promise，讓某個函數延遲執行，避免短時間重複觸發，並支援 promise
2. only resolves last，用來保證只執行最後一次的 fn
3. key-based debounce fn cache，用來將 fn cache 住

基本上你將驗證的 API 帶入後，他會將 fn 及等待時間 cache 住，接著將你被 cache 住的 fn 用 debounce promise 包起來，並將其丟入 onlyResolvesLast 內，而 onlyResolvesLast 這概念比較複雜所以我用下面的 code 額外來解釋這個概念。

*由於 js 的 promise 是無法原生被取消的，不像 AbortController，所以這個方法透過 cancel() 清空 resolve/reject 的引用，讓 promise 永遠不會 settle，因此 .then() 永遠不會被觸發。*

```tsx
// ref: https://github.com/slorber/awesome-imperative-promise/blob/master/src/index.ts
export type ResolveCallback<T> = (value: T | PromiseLike<T>) => void
export type RejectCallback = (reason?: any) => void
export type CancelCallback = () => void

export type ImperativePromise<T> = {
  promise: Promise<T>
  resolve: ResolveCallback<T>
  reject: RejectCallback
  cancel: CancelCallback
}

export function createImperativePromise<T>(
  promiseArg?: Promise<T> | null | undefined,
): ImperativePromise<T> {
  let resolve: ResolveCallback<T> | null = null
  let reject: RejectCallback | null = null

  const wrappedPromise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  promiseArg &&
    promiseArg.then(
      (val) => {
        resolve && resolve(val)
      },
      (error) => {
        reject && reject(error)
      },
    )

  return {
    promise: wrappedPromise,
    resolve: (value: T | PromiseLike<T>) => {
      resolve && resolve(value)
    },
    reject: (reason?: any) => {
      reject && reject(reason)
    },
    cancel: () => {
      resolve = null
      reject = null
    },
  }
}

// test code
const p = createImperativePromise<string>()

p.promise.then((val) => {
  console.log('✅ resolved:', val)
})

p.cancel()
p.resolve('Hello') // <-- 不會觸發 .then()
```

所以 onlyResolvesLast 簡單講就是將先前的 promise 不停的 cancel，直到最後一個時間到有被成功執行。

### react-hook-form useWatch vs form.watch

在 react-hook-form 中，`form.watch` 跟 `useWatch` 兩者都是用來監聽表單欄位值的變化，但它們有一些不同之處：

1. **form.watch**:
   - 通常使用在表單根元件，也就是你呼叫 `useForm` 的那個 component。
   - 它會在每次渲染時重新計算監聽的值，這可能會導致不必要的重新渲染，特別是當監聽多個欄位或整個表單時。
   - 適合用於簡單的場景，小表單，或者你就是想在根元件中拿到很多值，ex: `watch` 看整包。
   - 使用在 `useEffect` 要特別注意，因為每次 render 都會產生新的 reference，可能會導致無限 loop，尤其是搭配 `reset`。

2. **useWatch**:
   - 是一個獨立的 hook，可以在任何子元件中使用。
   - 它只會在監聽的欄位值改變時觸發重新渲染，這使得它在性能上更有效率，特別是當你只需要監聽特定欄位時。
   - 適合用於大型表單，想把重新渲染的範圍縮小，或需要在多個子元件中監聽欄位值的場景。

建議，預設選 `useWatch`，除非你確定要在根元件中監聽整包的值。

### Zod with react-hook-form onChange

Zod 由於不知道是哪個欄位發生變化，所以當你在 react-hook-form mode 使用的是 onChange 時，每次都會觸發整個 schema 的驗證，假設你又有處理 async validation 的話，這樣會導致效能不佳，及不必要的驗證。

像是下面的範例，其實我主要是要驗證 name 與 company 兩個欄位，但當我修改 description 時 checkPersonExists 也會跟著觸發。

```tsx
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string(),
}).refine(awesomeDebouncePromise(async ({ name, company }) => {
  // 假設這邊有 async validation
  return !(await checkPersonExists({ name, company }))
}, 1000), {
  message: 'Name and Company must be valid',
  path: ['name']
})

type FormSchema = z.infer<typeof formSchema>

const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema),
  mode: 'onChange', // 每次 onChange 都會觸發整個 schema 的驗證
  defaultValues: defaultFormValues
})
```

要如何改寫呢？一種是使用 `useWatch` 來監聽特定欄位的變化，然後在 `useEffect` 中進行驗證。

```tsx
import { useWatch } from 'react-hook-form'
import { useEffect } from 'react'

const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema),
  mode: 'onChange',
  defaultValues: defaultFormValues
})

// const name = form.watch('name')
// const company = form.watch('company')
const name = useWatch({ control: form.control, name: 'name' })
const company = useWatch({ control: form.control, name: 'company' })

useEffect(() => {
  const validate = async () => {
    const isValid = await checkPersonExists({ name, company })
    if (!isValid) {
      form.setError('name', { message: 'Name and Company must be valid' })
    } else {
      form.clearErrors('name')
    }
  }

  if (name && company) {
    validate()
  }
}, [name, company, form])
```

但我個人其實不偏好這種方式，因為這樣會導致邏輯分散，我也會盡量不去使用 `useEffect`，且需要手動管理錯誤狀態，我個人喜歡這樣去寫，將 formSchema 改為 function call 的方式，並管理前後的狀態，這樣可以更清楚地知道何時需要進行驗證，且也不會邏輯分散。

使用時，記得加入 `useMemo` 來避免每次渲染都重新建立 schema。

```tsx
export const formSchema = () => {
  // persist previous values to avoid unnecessary validation
  let prevName = ''
  let prevCompany = ''

  return z.object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().min(1, 'Company is required'),
    description: z.string(),
  }).refine(awesomeDebouncePromise(async ({ name, company }) => {
    // 當 name 或 company 改變時，才進行驗證
    if (name === prevName && company === prevCompany) {
      return true
    }

    prevName = name
    prevCompany = company

    // 假設這邊有 async validation
    return !(await checkPersonExists({ name, company }))
  }, 1000), {
    message: 'Name and Company must be valid',
    path: ['name']
  })
}

export type FormSchema = z.infer<ReturnType<typeof formSchema>>
```

### zod 101

Zod 支援驗證邏輯的抽離，重用與延伸...等

```ts
// 1
const sanitizedString = z
  .string()
  .transform((str) => {
    const trimmed = str.trim()
    return trimmed === '' ? undefined : str
  })
  .optional()

const userFormSchema = z.object({
  name: sanitizedString,
  nickname: sanitizedString,
})

// 2
const passwordSchema = z
  .string()
  .min(8, '密碼至少 8 碼')
  .regex(/[A-Z]/, '需包含大寫字母')
  .regex(/[a-z]/, '需包含小寫字母')
  .regex(/\d/, '需包含數字')

const createUserFormSchema = z.object({
  username: z.string(),
  password: passwordSchema,
})

const editUserFormSchema = createUserFormSchema
  .extend({
    checkPassword: z.string(),
  })
  .refine(({ password, checkPassword }) => password === checkPassword, {
    path: ['checkPassword'],
    message: '密碼不同',
  })
```

zod 也支援檔案類型

```ts
const createVendorAppFormSchema = z
  .object({
    file: z
      .custom<File>((val) => val instanceof File, {
        message: '請上傳檔案',
      })
      .nullable(),
  })
  .refine((data) => data.file !== null, {
    path: ['file'],
    message: '請上傳檔案',
  })
```

### Conclusion

我後續會再繼續補上一些我認為不錯的 react-hook-form、zod 等的使用方式，方便自己回憶，也希望能對讀者有幫助。
