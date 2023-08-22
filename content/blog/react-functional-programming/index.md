---
title: React functional programming
date: "2023-08-23T12:00:00.000Z"
description: 因為一些原因，最近再將公司已經用 Vue 寫好的專案，改用 React 重寫，react 的使用方式跟 vue 在更新上有比較大差異，這就是為什麼我會寫這篇文章的原因，闡述一些自己的想法。
tags: ["react", "frontend"]
---

### Concept

我會使用 array of object 這個範例來闡述我的想法。

```js
const blackpink = [{ id: 1, name: 'Rosé' }, { id: 2, name: 'Jisoo' }, { id: 3, name: 'Jennie' }]

// 這時我想將 Lisa 插入 singers 陣列中，在 Vue 中我會這樣寫
blackpink.push({ id: 4, name: 'Lisa' })

// 但如果是在 React 中，我會這樣寫，依據各自的情況
setSingers([...singers, { id: 4, name: 'Lisa' }])
setSingers((prevSingers) => [...prevSingers, { id: 4, name: 'Lisa' }])
```

這兩個的差別是什麼，**其實是在於有沒有 mutate original 的資料**，Vue 是需要 mutate 的，而 React 則相反。

### Functional programming with React and TypeScript

以下是我認為 functional programming 在 React 中比較被受重視的根本原因，基本上寫習慣後，他能夠在淺移默化中，幫助我們避免一些在撰寫 React 時會犯的錯誤。

1. 透過 immutable 的方式，避免不必要的錯誤
2. 在 function 命名上，我認為可以拆分的更加清晰，易讀
3. 寫起來有高級感，畢竟在 Vue push 能搞定的事情你 React 要寫個 spread operator...等
4. 複用性高，配合 TypeScript，你可以寫出很多很有趣的 helper function
5. 更易將邏輯抽離，在 debug 時，我認為會更清晰友善

```ts
// singerHelper.ts
type Singer = {
  id: number
  name: string
}

// const blackpink = [{ id: 1, name: 'Rosé' }, { id: 2, name: 'Jisoo' }, { id: 3, name: 'Jennie' }]

const findMemberIndex = <T extends Singer>(members: T[], member: T) => 
  members.findIndex((m) => m.id === member.id)

const insertMemberByIndex = <T>(members: T, index: number, member: T) => 
  [...members.slice(0, index), member, ...members.slice(index)]

const removeMemberByIndex = <T>(members: T, index: number) => 
  members.filter((_, i) => i !== index)

const addMemberToLast = <T>(members: T[], member: T) => [...members, member]

const addMemberToFirst = <T>(members: T[], member: T) => [member, ...members]

const updateMemberByIndex = <T>(members: T[], index: number, member: T) => 
  members.map((m, i) => (i === index ? member : m))

// const updateMemberNameByIndex = (members: Singer[], index: number, name: string) => 
//   updateMemberByIndex(members, index, { ...members[index], name })

const updateMemberNameByIndex = (members: Singer[], index: number, name: string) => 
  members.map((m, i) => (i === index ? { ...m, name } : m))

// ...依照專案的複雜層度，還有更豐富的玩法，可以 chain 更多的 methods，這邊就不一一列舉了

export {
  findMemberIndex,
  insertMemberByIndex,
  removeMemberByIndex,
  addMemberToLast,
  addMemberToFirst,
  updateMemberByIndex,
  updateMemberNameByIndex,
  updateMemberNameByIndex,
}
```

```tsx
import { 
  removeMemberByIndex,
  addMemberToLast, 
} from './singerHelper'

const blackpink = [{ id: 1, name: 'Rosé' }, { id: 2, name: 'Jisoo' }, { id: 3, name: 'Jennie' }]

// you can extract this function to utility helper
const getRandomIndex = (arr: Singer[]) => Math.floor(Math.random() * arr.length)

const handleAddMember = () => {
  const [singers, setSingers] = useState(blackpink)

  const handleRemoveMember = (index: number) => () => {
    // setSingers((prev) => prev.filter((_, i) => i !== index))
    setSingers((prev) => removeMemberByIndex(prev, index))
  }

  const handleAddMember = () => {
    // setSingers((prev) => [...prev, { id: 4, name: 'Lisa' }])
    setSingers((prev) => addMemberToLast(prev, { id: 4, name: 'Lisa' }))
  }

  return (
    <>
      <button onClick={handleRemoveMember(getRandomIndex(blackpink))}>remove member</button>
      <button onClick={handleAddMember}>add member</button>
      <ul>
        {singers.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
    </>
  )
}
```

有發現我在寫 helper 時，是使用 Generics <T> 的方式嗎？這樣的好處是，依據專案的複雜層度，你可以在不同的地方使用，而不用去擔心型別的問題，此外，撰寫時，我自己是覺得，有點類似後端 controller 之於 service 之類的概念，你可以把一些邏輯，抽離出來，讓你的 component 變得更加的乾淨，發現問題時也是直接去看邏輯，而不用去管視圖的部分。

對於比較複雜的元件，在撰寫時，概念會有點類似這樣：（自己個人經驗，會比較清晰）

```txt
View (controller) -> hook(service) -> atom(logic helper)
```

### Conclusion

其實坦白說，我自己個人比較喜歡 Vue，不得不佩服尤大的在程式方面上的設計，真的相當的厲害，我也有稍微看一下霍春陽寫的 **Vue.js 設計與實踐** 這本書，非常值得一看。

其實，我最近大部分的時間都是在做工具，所以從工具的角度出發，有些工具，它需要比較好的效能，像是要渲染大量的資料...等，而 Vue 在這點上就有顯著的優勢在，且在 Vue 中不用特意去考慮效能的問題，寫起來很舒服，而 React 則是你時常就要考慮是否要使用 `memo`, `useCallback`, `useMemo`...等去優化程式碼，在這點上我覺得 Vue 比較好；React 則是強大在他的社群，基本上你能想到的功能，幾乎都有些高手去把它實作出來，我覺得很不錯，(雖然我最近覺得越來越多套件沒在進行維護了，像是 `react-virtualized`，作者叫你去用簡單版的 `react-window`...等)。
