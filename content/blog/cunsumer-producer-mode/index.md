---
title: Producer-Consumer Pattern
date: "2025-10-23T12:00:00.000Z"
description: 生產者-消費者模式，在程式上是一種常見的設計模式，此篇文章是我自己 rust 時的心得。
tags: ["concept", "rust"]
---

### Preface

為何寫這篇文章其實是因為我的公司目前有在做音訊處理相關的專案，在處理即時音訊時，生產者-消費者模式是一個常見的設計模式。

### Core

生產者-消費者模式 (Producer-Consumer pattern) 是一種處理併發（多執行緒）的設計模式，透過一個緩衝區（通常是佇列）將生產者（負責產生資料）和消費者（負責處理資料）這兩個不同處理速度的執行緒解耦開來。 此模式確保生產者在緩衝區滿時會暫停，以及消費者在緩衝區空時會等待，從而避免資料遺失或消費浪費。

- **生產者 (Producer)**：負責生成數據並將其放入緩衝區。
- **消費者 (Consumer)**：負責從緩衝區中取出數據並進行處理。
- **緩衝區 (Buffer)**：作為生產者和消費者之間的橋樑，通常是執行緒安全的佇列，用來暫存資料。
- **解耦**：生產者和消費者不直接溝通，而是只透過緩衝區互動，將低耦合度。
- **平衡速度**：當生產者生產速度快於消費者時，多餘的資料會暫存在緩衝區；反之，若消費者速度快，則緩衝區會暫時清空，讓生產者在有資料時才產生。
- **同步**：使用同步機制來確保緩衝區的安全訪問，防止競爭條件。
  - 當緩衝區已滿時，生產者會被阻塞，直到消費者從中取出資料。
  - 當緩衝區為空時，消費者會被阻塞，直到生產者放入新資料。
- **多執行緒**：這個模式特別適合用於多執行緒的場景，能讓多個生產者和消費者同時運作而不會互相干擾。

### Practice

在 Rust 中，可以使用標準庫中的 `std::sync::mpsc` 模組來實現生產者-消費者模式。下方是一個簡單的範例，請參考：

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    // 建立一個通道 (channel)
    let (tx, rx) = mpsc::channel();

    // 生產者執行緒
    let producer = thread::spawn(move || {
        for i in 0..10 {
            println!("Producing: {}", i);
            tx.send(i).unwrap(); // 發送資料到通道
            thread::sleep(Duration::from_millis(100)); // 模擬生產時間
        }
    });

    // 消費者執行緒
    let consumer = thread::spawn(move || {
        for _ in 0..10 {
            let received = rx.recv().unwrap(); // 從通道接收資料
            println!("Consuming: {}", received);
            thread::sleep(Duration::from_millis(150)); // 模擬消費時間
        }
    });

    // 等待兩個執行緒完成
    producer.join().unwrap();
    consumer.join().unwrap();
}
```

但由於我是處理音訊相關，所以實際專案我使用的是 `ringbuf` 這個 [crate](https://crates.io/crates/ringbuf) 來實現環形緩衝區 (circular buffer)。

這部分的實作就不在此贅述，若有興趣可以參考該 crate 的文件。

### Compare

在 Rust 中，使用 `std::sync::mpsc` 模組實現的生產者-消費者模式與使用 `ringbuf` crate 實現的方式有一些關鍵差異：

1. **緩衝區實現**：
   - `std::sync::mpsc` 使用基於鎖的佇列實現，支援無界通道 `channel()`（可動態增長）和有界通道 `sync_channel(n)`（固定容量上限），適合任務分發和訊息傳遞。
   - `ringbuf` 提供固定大小的環形緩衝區，採用無鎖（lock-free）的原子操作設計，專為單生產者單消費者（SPSC）場景優化，特別適合高頻資料流處理。

2. **性能差異**：
   - `std::sync::mpsc` 內部使用互斥鎖保護佇列，每次 send/recv 都涉及鎖的獲取和釋放，且需要轉移資料所有權或進行記憶體分配。在高頻傳輸場景下（如每秒數萬次操作），鎖開銷會導致延遲增加。
   - `ringbuf` 使用原子操作實現無鎖同步，資料在預分配的固定緩衝區中直接讀寫，支援零拷貝批次操作（push_slice/pop_slice），因此延遲更低、吞吐量更高。

3. **阻塞行為**：
   - `std::sync::mpsc` 的有界通道在滿時會阻塞發送方，空時會阻塞接收方。
   - `ringbuf` 採用非阻塞設計，可以選擇在滿時覆蓋舊資料（push_overwrite）或返回錯誤（push）。

4. **使用場景**：
   - `std::sync::mpsc` 更通用，適合：多生產者場景、任務分發系統、傳遞複雜資料結構、不能丟失資料的場景。
   - `ringbuf` 更專精，適合：即時音訊/視訊處理、感測器資料收集、固定採樣率的資料流、單生產者單消費者、可容忍資料丟失的高性能場景。

### Conclusion

生產者-消費者模式是一種強大的設計模式，能有效解決多執行緒環境下的資料傳輸和處理問題。

在 Rust 中，根據不同的需求，可以選擇使用標準庫的 `std::sync::mpsc` 模組來實現通用的生產者-消費者模式，或是使用專門針對高效資料流處理設計的 `ringbuf` crate 來實現更高效的解決方案。

理解這些工具的特性和適用場景，有助於在開發過程中做出更合適的選擇。
