---
title: Stack and Queue Algorithm
date: "2026-03-23T12:00:00.000Z"
description: 2025 年末，在處理公司一些專案，像是之前文章的 Producer-Consumer Pattern...等，其實本質上就是 Queue 的延伸概念及實際使用情境，所以今天就想來寫一下 Stack 與 Queue 的演算法差異。
tags: ["javascript"]
---

### Queue

Queue（隊列）是一種先進先出（FIFO, First-In-First-Out）的資料結構，元素按照加入的順序被處理。Queue 的基本操作包括：

- **enqueue**: 將元素加入隊列的尾部。
- **dequeue**: 移除並回傳隊列的頭部元素。
- **peek**: 查看隊列的頭部元素但不移除。
- **isEmpty**: 檢查隊列是否為空。
- **size**: 取得目前隊列的長度。

Queue 在許多情境中非常有用，例如任務排程、廣度優先搜尋（BFS）等。以下是一個簡單的 Queue 實現範例：

```ts
class Queue<T> {
  private items: Record<number, T> = {};
  private head: number = 0;
  private tail: number = 0;

  /**
   * 將元素加入隊列 (Producer 用)
   */
  enqueue(element: T): void {
    this.items[this.tail] = element;
    this.tail++;
  }

  /**
   * 移除並回傳隊頭元素 (Consumer 用)
   */
  dequeue(): T | undefined {
    if (this.isEmpty) return undefined;

    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  /**
   * 取得目前的隊列長度
   */
  get size(): number {
    return this.tail - this.head;
  }

  /**
   * 檢查隊列是否為空
   */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * 查看隊頭元素但不移除
   */
  peek(): T | undefined {
    return this.items[this.head];
  }
}

// --- 使用範例 ---
interface Task {
  id: number;
  data: string;
}

const taskQueue = new Queue<Task>();

// 生產者，將任務加入隊列
taskQueue.enqueue({ id: 1, data: "處理圖片" });
taskQueue.enqueue({ id: 2, data: "發送郵件" });

console.log(taskQueue.peek()) // 查看隊頭任務

// 消費者，從隊列中取出任務並處理
while (!taskQueue.isEmpty) {
  const task = taskQueue.dequeue();
  console.log(`正在處理：${task?.data}`);
}
```

#### BigO 分析

| 操作      | 說明           | 時間複雜度 |
| --------- | -------------- | ---------- |
| `enqueue` | 尾端加入元素   | **O(1)**   |
| `dequeue` | 從頭端移除元素 | **O(1)**   |
| `peek`    | 查看頭部元素   | **O(1)**   |
| `isEmpty` | 檢查是否為空   | **O(1)**   |
| `size`    | 取得目前長度   | **O(1)**   |

#### Shift

在 JavaScript 中，陣列的 `shift` 方法會移除並回傳陣列的第一個元素。雖然 `shift` 的行為類似於 Queue 的 `dequeue` 操作，但它的時間複雜度是 **O(n)**，因為在移除第一個元素後，陣列中的所有其他元素都需要向前移動一個位置。因此，在需要頻繁進行隊列操作的情況下，使用 `shift` 可能會導致效能問題。

### Stack

Stack（堆疊）是一種後進先出（LIFO, Last-In-First-Out）的資料結構，元素按照加入的順序被處理，但最後加入的元素會最先被處理。Stack 的基本操作包括：

- **push**: 將元素加入堆疊的頂部。
- **pop**: 移除並回傳堆疊的頂部元素。
- **peek**: 查看堆疊的頂部元素但不移除。
- **isEmpty**: 檢查堆疊是否為空。
- **size**: 取得目前堆疊的高度。

```ts
class Stack<T> {
  private items: T[] = [];

  /**
   * 推入元素 (Push)
   */
  push(element: T): void {
    this.items.push(element);
  }

  /**
   * 彈出最上層元素 (Pop)
   */
  pop(): T | undefined {
    if (this.isEmpty) return undefined;
    return this.items.pop();
  }

  /**
   * 查看最上層元素但不移除 (Peek)
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * 檢查是否為空
   */
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * 目前堆疊高度
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * 清空堆疊
   */
  clear(): void {
    this.items = [];
  }
}

// --- 使用範例：瀏覽器歷史紀錄 (Undo 功能) ---
const historyStack = new Stack<string>();

// 用戶瀏覽頁面
historyStack.push("首頁");
historyStack.push("產品列表");
historyStack.push("產品詳情頁");

console.log(`目前頁面: ${historyStack.peek()}`); // "產品詳情頁"

// 用戶點擊「上一頁」
const lastPage = historyStack.pop();
console.log(`回退自: ${lastPage}`); // "產品詳情頁"
console.log(`現在回到: ${historyStack.peek()}`); // "產品列表"
```

#### BigO 分析

| 操作      | 說明           | 時間複雜度           |
| --------- | -------------- | -------------------- |
| `push`    | 將元素放到頂部 | **O(1)**             |
| `pop`     | 移除頂部元素   | **O(1)**             |
| `peek`    | 查看頂部元素   | **O(1)**             |
| `isEmpty` | 檢查是否為空   | **O(1)**             |
| `size`    | 取得目前高度   | **O(1)**             |
| `clear`   | 清空整個 Stack | **O(1)** 或 **O(n)** |

### Conclusion

Stack 適合處理「最後進來的先處理」的場景，例如函式呼叫堆疊、Undo/Redo、DFS（深度優先搜尋）等。

Queue 則適合處理「先進來的先處理」的場景，例如任務排程、BFS（廣度優先搜尋）、生產者－消費者模式等。

在現今有 AI 輔助撰寫程式碼的情況下，Stack 與 Queue 的實作細節其實已經不是重點。更重要的是理解它們背後的行為模型，以及在什麼情境下應該選擇哪一種資料結構。

實務開發中，我們更常面對的是這些選擇：

- 什麼時候該用遞迴，什麼時候該用迴圈
- 什麼時候需要更進階的演算法
- 什麼時候應該為了可讀性而做取捨

難的是在正確的情境下做出合適的選擇。
