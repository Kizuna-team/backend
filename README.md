
# Kizuna｜交友配對網站（後端）
![logo](https://github.com/user-attachments/assets/326e3291-bf0e-4003-8809-1d660fed79fe)
## 命名由來
「 Kizuna（絆） 」在日語中意為「 羈絆 」，我們希望大家可以透過本網站，在這複雜的世界中，找到自己理想中的夥伴、朋友或伴侶，  
我們致力於為大家牽起這條「 線 」，讓原本毫無交集的人們，能夠因線生緣，產生羈絆，   
這邊先預祝大家可以透過本網站找到可以一起玩的好友、情人。  

## 線上開始使用
[ 之後放部署網址 ] 

本專案為 kizuna 交友網站的後端系統，負責處理使用者資料、配對邏輯、金流、聊天室、活動揪團等功能。  
採用 Node.js + Express 架構，搭配 Drizzle 操作 PostgreSQL 資料庫，
使用 Passport 搭配 JWT 實作使用者身份驗證，並整合 Google One Tap 登入，
提供快速且安全的第三方登入體驗，優化整體使用者流程。

## DEMO 畫面

[![Watch the video](https://github.com/user-attachments/assets/b001d7ca-2b8c-49de-a954-1243f858e1ee)](https://www.youtube.com/watch?v=5nOsfhFN4Fc)


## 使用技術

  * `Express`
  * `PostgreSQL`
  * `Socket.IO`
  
## 如何安裝及執行這個專案:

### 1. Clone 專案
```
git clone https://github.com/Kizuna-team/backend.git
cd kizuna-backend
```

### 2. 安裝依賴套件
```
npm install
```

### 3. 加入環境變數

請依據 `env.template`檔案提示加入相應的環境變數

### 4. 啟動伺服器
```
npm run dev
```

## 開發相關規定

* 資料庫: `PostgreSQL`

* 命名方式 以 使用者名稱 為例
  * 資料庫欄位請使用 蛇式命名法 ( snacke-case ) => user_name
  * `JavaScript` 使用 駝峰式命名法 => userName

* `.env`環境變數設定

##成員列表

| 姓名             | 開發功能                                                                 | GitHub連結                                         |
|------------------|--------------------------------------------------------------------------|----------------------------------------------------|
| sin-huang        | 1. 串金流系統(`LINEPAY`串購物車下單送禮功能、`ECPAY`串會員訂閱升級功能)<br> 2. 購物車功能<br/> 3. 即時聊天室功能(串 `Gemini AI` 協助發想聊天內容)<br> 4. 會員註冊/登入系統(含`Google`第三方登入)<br> 5. 推薦顯示邏輯初版<br> 6. 網頁主視覺設計<br>           | [github](https://github.com/sin-huang)             |
| chingyu0713      | 串金流系統                                                               | [github](https://github.com/chingyu0713)           |
| c16033           | 聊天室系統<br>購物車系統                                                | [github](https://github.com/c16033)                |
| Heidi            | 個人檔案管理(後端)<br>配對頁面                                          | [github](https://github.com/HeidiSiao)             |
| Yunie            | 創建活動/揪團功能<br>歷史紀錄                                           | [github](https://github.com/hsinyuHsu)             |
| Noid             | 個人檔案管理(前端)<br>建立封鎖/檢舉資料庫                               | [github](https://github.com/Noiddddddd)            |
| wen-yu-tsai      | 購物車系統<br>創建活動（前端）                                          | [github](https://github.com/wen-yu-tsai)           |
| Jun-Liang-Guo    | 推薦顯示邏輯<br>訂閱頁面切版                                            | [github](https://github.com/Jun-Liang-Guo)         |
