# MECCHA CHAMELEON

多人連線躲貓貓遊戲（React + Three.js + Colyseus monorepo）。

## 本地開發

```bash
npm install
npm run build --workspace=@meccha/shared
npm run dev
```

- 前端：http://localhost:5173
- 遊戲伺服器：ws://localhost:2567

## 部署架構

| 元件 | 平台 | 說明 |
|------|------|------|
| 前端 (`apps/client`) | **Vercel** | 靜態 SPA + Vite build |
| 遊戲伺服器 (`apps/server`) | **Railway** 等 | Colyseus WebSocket，需長連線 |

### Vercel 環境變數

在 Vercel 專案設定：

```
VITE_COLYSEUS_URL=wss://your-game-server.example.com
```

### Railway 遊戲伺服器（正式環境）

1. 登入 Railway：`npx @railway/cli login`
2. 在專案根目錄執行：
   ```bash
   npx @railway/cli init
   npx @railway/cli up --detach
   npx @railway/cli domain
   ```
3. 取得公開網址後，在 Vercel 更新 `VITE_COLYSEUS_URL` 為 `wss://你的-railway-網址`，再重新部署前端。

或使用 [Render Blueprint](https://render.com/deploy?repo=https://github.com/stevenMForce/meccha-chameleon) 一鍵部署 `render.yaml`。
