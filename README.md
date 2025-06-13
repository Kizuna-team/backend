
# kizuna-project｜交友配對網站

>「Kizuna（絆）」在日語中意為「羈絆」，
>象徵人與人之間的連結，
>本專案希望透過科技促進彼此間的真誠交流。

本專案為 kizuna 交友網站的後端系統，負責處理使用者資料、配對邏輯、金流、聊天室、活動揪團等功能。  
採用 Node.js + Express 架構，搭配 Drizzle 操作 PostgreSQL 資料庫，
使用 Passport 搭配 JWT 驗證，並透過 Google-Auth-Library 實現 Google OAuth 第三方登入，
確保使用者登入流程安全並提升整體使用體驗。

## 使用技術

  * `Express`
  * `Passport`
  * `Google-Auth-Library`
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
### 3. 建立 .env 環境變數檔案
```
請在專案根目錄建立 `.env` 檔案，並設定以下變數：
JWT_SECRET=
REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

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

##成員分工

* sin-huang [github](https://github.com/sin-huang)
  * 會員登入/註冊系統
  * 推薦顯示邏輯
  * 歷史紀錄

* chingyu0713 [github](https://github.com/chingyu0713)
  * 串金流系統

* c16033 [github](https://github.com/c16033)
  * 聊天室系統
  * 購物車系統
  * Header切版

* Heidi [github](https://github.com/HeidiSiao)
  * 個人檔案管理(後端)
  * 配對頁面

* Yunie [github](https://github.com/hsinyuHsu)
  * 創建活動/揪團功能
  * 歷史紀錄

* Noid [github](https://github.com/Noiddddddd)
  * 個人檔案管理(前端)
  * 建立封鎖/檢舉資料庫

* wen-yu-tsai [github](https://github.com/wen-yu-tsai)
  * 購物車系統
  * 創建活動（前端）

* Jun-Liang-Guo [github](https://github.com/Jun-Liang-Guo)
  * 推薦顯示邏輯
  * 訂閱頁面切版
