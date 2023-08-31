---
title: React with functional programming
date: "2023-08-23T12:00:00.000Z"
description: 因為一些原因，最近再將公司已經用 Vue 寫好的專案及工具，改用 React 重寫，React 跟 Vue 在更新上有比較大差異，這就是為什麼我會寫這篇文章的原因，闡述一些自己的想法。
tags: ["react", "frontend"]
---

### Vue vs React

本篇文章，我會使用 array of object 來闡述我的想法，畢竟這也是從 API 撈多筆資料回來最常見的格式。

```js
const blackpink = [{ id: 1, name: 'Rosé' }, { id: 2, name: 'Jisoo' }, { id: 3, name: 'Jennie' }]

// 這時我想將 Lisa 插入 singers 陣列中，在 Vue 中我會這樣寫
blackpink.push({ id: 4, name: 'Lisa' })

// 但如果是在 React 中，我會這樣寫，依據各自的情況
setSingers([...singers, { id: 4, name: 'Lisa' }])
setSingers((prevSingers) => [...prevSingers, { id: 4, name: 'Lisa' }])
```

這兩個的差別是什麼，**其實是在於有沒有 mutate original 的資料**，Vue 是需要 mutate 的，而 React 則恰恰相反。

### Functional programming with React and TypeScript

以下是我認為 functional programming 在 React 中比較被受重視的根本原因，基本上寫習慣後，他能夠在淺移默化中，幫助我們避免一些在撰寫 React 時會犯的錯誤。

1. 透過 immutable 的方式，避免不必要的錯誤，**也是最重要的**
2. 在 function 命名上，我認為可以拆分的更加清晰，易讀
3. 寫起來有高級感，畢竟在 Vue push 能搞定的事情， React 要寫個 spread operator...等
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

有發現我在寫 helper 時，是使用 Generics 的方式嗎？這樣的好處是，依據專案的複雜層度，你可以在不同的地方去做使用，而不用去擔心型別的問題，此外，撰寫時，我自己是覺得，有點類似後端 controller 之於 service 之類的概念，你可以把一些邏輯，抽離出來，讓你的 component 變得更加的乾淨，發現問題時也是直接去看邏輯。

### Real world example

對於比較複雜的元件，在撰寫時，概念會有點類似這樣：（自己個人經驗，會比較清晰）

```txt
View -> hook -> logic helper or utility function
```

可以參考一下下方的調整：

```tsx{5-14,16-21,23-34,43-45}
// 原先的寫法
import { FC } from 'react'

const Component: FC = () => {
  const handleGetNewTranscripts = (
    transcripts: TranscriptEditType[],
    changedSpeakerMap: Map<string, string>,
  ) => {
    return transcripts.map((t) => {
      const speaker = changedSpeakerMap.get(t.speaker)
      if (speaker) t.speaker = speaker
      return t
    })
  }

  const handleGetTrimmedCloneSpeakers = (cloneSpeakers: SpeakerType[]) =>
    cloneSpeakers.map((s, index) => ({
      ...s,
      speaker: s.speaker.trim(),
      id: index + 1,
    }))

  const handleGetChangedSpeakerMap = (cloneSpeakers: SpeakerType[], speakers: SpeakerType[]) => {
    const changedSpeakerMap = new Map<string, string>()

    cloneSpeakers.forEach(({ id, speaker }) => {
      const originSpeaker = speakers.find(({ id: _id }) => _id === id)?.speaker
      if (originSpeaker !== speaker && originSpeaker) {
        changedSpeakerMap.set(originSpeaker, speaker)
      }
    })

    return changedSpeakerMap
  }

  const handleSaveSpeaker = async () => {
    if (isSameSpeakerName || hasEmptySpeakerName) {
      messageApi.error(isSameSpeakerName ? '語者名稱不可重複' : '語者名稱不可為空')
      return
    }

    // 由於是透過 args 的方式傳入，所以可以將 function 抽離出來，並放置到獨立的 helper ts 檔案中
    const changedSpeakerMap = handleGetChangedSpeakerMap(cloneSpeakers, speakers)
    const newSpeakers = handleGetTrimmedCloneSpeakers(cloneSpeakers)
    const newTranscripts = handleGetNewTranscripts(transcripts, changedSpeakerMap)

    // 如果沒有變更語者，直接關閉 modal
    if (isEqual(newSpeakers, speakers)) {
      cleanupAfterUpdate()
      return
    }

    setUpdateLoading(true)
    try {
      await handleStoreResourceWithSpeakers({
        updatedSpeakers: newSpeakers,
        updatedTranscripts: newTranscripts,
      })

      setSpeakers(newSpeakers)
      setTranscripts(newTranscripts)
      cleanupAfterUpdate()
    } catch (error) {
      console.error(`update speaker error`, error)
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div>...</div>
  )
}
```

可以變成

```ts
// speakerHelper.ts
const handleGetNewTranscripts = (
  transcripts: TranscriptEditType[],
  changedSpeakerMap: Map<string, string>,
) => {
  return transcripts.map((t) => {
    const speaker = changedSpeakerMap.get(t.speaker)
    if (speaker) t.speaker = speaker
    return t
  })
}

const handleGetTrimmedCloneSpeakers = (cloneSpeakers: SpeakerType[]) =>
  cloneSpeakers.map((s, index) => ({
    ...s,
    speaker: s.speaker.trim(),
    id: index + 1,
  }))

const handleGetChangedSpeakerMap = (cloneSpeakers: SpeakerType[], speakers: SpeakerType[]) => {
  const changedSpeakerMap = new Map<string, string>()

  cloneSpeakers.forEach(({ id, speaker }) => {
    const originSpeaker = speakers.find(({ id: _id }) => _id === id)?.speaker
    if (originSpeaker !== speaker && originSpeaker) {
      changedSpeakerMap.set(originSpeaker, speaker)
    }
  })

  return changedSpeakerMap
}

export { 
  handleGetNeTranscripts, 
  handleGetTrimmedCloneSpeakers, 
  handleGetChangedSpeakerMap 
}
```

```ts
// useSpeaker.ts
import { 
  handleGetNewTranscripts, 
  handleGetTrimmedCloneSpeakers, 
  handleGetChangedSpeakerMap 
} from './speakerHelper'

const useSpeaker = () => {
  const handleSaveSpeaker = async () => {
    if (isSameSpeakerName || hasEmptySpeakerName) {
      messageApi.error(isSameSpeakerName ? '語者名稱不可重複' : '語者名稱不可為空')
      return
    }

    // 由於是透過 args 的方式傳入，所以可以將 function 抽離出來，並放置到獨立的 helper ts 檔案中
    const changedSpeakerMap = handleGetChangedSpeakerMap(cloneSpeakers, speakers)
    const newSpeakers = handleGetTrimmedCloneSpeakers(cloneSpeakers)
    const newTranscripts = handleGetNewTranscripts(transcripts, changedSpeakerMap)

    // 如果沒有變更語者，直接關閉 modal
    if (isEqual(newSpeakers, speakers)) {
      cleanupAfterUpdate()
      return
    }

    setUpdateLoading(true)
    try {
      await handleStoreResourceWithSpeakers({
        updatedSpeakers: newSpeakers,
        updatedTranscripts: newTranscripts,
      })

      setSpeakers(newSpeakers)
      setTranscripts(newTranscripts)
      cleanupAfterUpdate()
    } catch (error) {
      console.error(`update speaker error`, error)
    } finally {
      setUpdateLoading(false)
    }

    return {
      handleSaveSpeaker,
      ...
    }
  }
}
```

```tsx
import { FC } from 'react'
import { useSpeaker } from './useSpeaker'

const Component: FC = () => {
  const {...} = useSpeaker()

  return (
    <div>...</div>
  )
}
```

### Conclusion

這篇文章主要是想分享一下，我在撰寫 React 時，會如何去思考，以及如何去撰寫，搭配 functional programming，當然，這些都是我自己的想法，如果有更好的方式，歡迎跟我分享，我也會持續更新這篇文章，謝謝大家的閱讀。

題外話，你也可以將自己的程式碼貼到 chatGPT 上，並詢問它，想將程式碼用更 functional programming 的方式撰寫，他會提供一些不錯的建議，可以參考一下。
