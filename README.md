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

### Railway 遊戲伺服器

使用根目錄 `Dockerfile` 或 `railway.toml` 部署 `apps/server`（port 2567，health: `/health`）。
