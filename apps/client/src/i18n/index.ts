export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "zh-CN", label: "简体中文" },
  { code: "ko", label: "한국어" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt-BR", label: "Português" },
  { code: "ar", label: "العربية" },
];

const base = {
  menu: {
    subtitle: "Paint yourself to blend in! Hide-and-seek with artistic camouflage.",
    createRoom: "Create Room",
    browseRooms: "Browse Rooms",
    mapEditor: "Map Editor",
    workshop: "Workshop",
    settings: "Settings",
  },
  common: { back: "Back", loading: "Loading..." },
  create: {
    title: "Create Room",
    playerName: "Player Name",
    roomName: "Room Name",
    map: "Map",
    mode: "Mode",
    private: "Private Room",
    whistle: "Enable Whistle Hints",
    create: "Create",
  },
  browse: { title: "Browse Rooms", empty: "No public rooms found", join: "Join" },
  lobby: {
    players: "Players",
    ready: "Ready",
    notReady: "Not Ready",
    toggleReady: "Toggle Ready",
    startGame: "Start Game",
  },
  hud: {
    hiders: "Hiders",
    seekers: "Seekers",
    paint: "Paint",
    pose: "Pose",
    chat: "Chat",
    nextRound: "Next Round",
    returnLobby: "Return to Lobby",
  },
  paint: {
    title: "Meccha Paint",
    metallic: "Metallic",
    roughness: "Roughness",
    brushSize: "Brush Size",
    noUndo: "No undo — paint carefully!",
    tool: { brush: "Brush", eyedropper: "Dropper", fill: "Fill", clear: "Clear" },
  },
  pose: {
    stand: "Stand",
    crouch: "Crouch",
    curl: "Curl",
    wallFlat: "Wall Flat",
    lieDown: "Lie Down",
    mimicFrame: "Mimic Frame",
  },
  phase: {
    lobby: "Lobby",
    roleAssign: "Assigning Roles",
    preparation: "Preparation",
    hunt: "Hunt",
    answerCheck: "Answer Check",
    roundEnd: "Round End",
  },
  role: { hider: "Hider", seeker: "Seeker", spectator: "Spectator" },
  answerCheck: {
    title: "Answer Check!",
    pose: "Pose",
    found: "Found by Seeker",
    missed: "Seeker walked past!",
    autoOn: "Auto ▶",
    autoOff: "Manual",
    winner: { hider: "Hiders Win!", seeker: "Seekers Win!", draw: "Draw!" },
  },
  chat: { title: "Chat", placeholder: "Type a message...", send: "Send" },
  settings: {
    title: "Settings",
    sensitivity: "Mouse Sensitivity",
    volume: "Volume",
    colorblind: "Colorblind Mode",
    voice: "Voice Chat",
  },
  editor: {
    title: "Map Editor",
    add: "Add Object",
    export: "Export JSON",
    import: "Import JSON",
    clear: "Clear All",
  },
  workshop: {
    title: "Workshop",
    empty: "No community maps yet",
    by: "by",
    downloads: "downloads",
    subscribe: "Subscribe",
    subscribed: "Subscribed",
  },
};

const zhTW = {
  ...base,
  menu: {
    subtitle: "把自己畫成環境的一部分！用藝術偽裝的躲貓貓遊戲。",
    createRoom: "建立房間",
    browseRooms: "瀏覽房間",
    mapEditor: "地圖編輯器",
    workshop: "工作坊",
    settings: "設定",
  },
  common: { back: "返回", loading: "載入中..." },
  create: {
    title: "建立房間",
    playerName: "玩家名稱",
    roomName: "房間名稱",
    map: "地圖",
    mode: "模式",
    private: "私人房間",
    whistle: "啟用口哨提示",
    create: "建立",
  },
  browse: { title: "瀏覽房間", empty: "找不到公開房間", join: "加入" },
  lobby: {
    players: "玩家",
    ready: "已準備",
    notReady: "未準備",
    toggleReady: "切換準備",
    startGame: "開始遊戲",
  },
  hud: {
    hiders: "躲藏者",
    seekers: "尋找者",
    paint: "繪畫",
    pose: "姿勢",
    chat: "聊天",
    nextRound: "下一回合",
    returnLobby: "返回大廳",
  },
  paint: {
    title: "めっちゃ彩繪",
    metallic: "金屬度",
    roughness: "粗糙度",
    brushSize: "筆刷大小",
    noUndo: "無法復原 — 請謹慎繪製！",
    tool: { brush: "筆刷", eyedropper: "吸管", fill: "填滿", clear: "清除" },
  },
  answerCheck: {
    title: "答案揭曉！",
    pose: "姿勢",
    found: "被 Seeker 發現",
    missed: "Seeker 走過了！",
    autoOn: "自動 ▶",
    autoOff: "手動",
    winner: { hider: "躲藏者勝！", seeker: "尋找者勝！", draw: "平手！" },
  },
};

const ja = {
  ...base,
  menu: {
    subtitle: "体を塗ってステージに溶け込もう！新感覚かくれんぼ",
    createRoom: "ルーム作成",
    browseRooms: "ルーム一覧",
    mapEditor: "マップエディター",
    workshop: "ワークショップ",
    settings: "設定",
  },
};

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLang = localStorage.getItem("meccha-lang") || "zh-TW";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: base },
    "zh-TW": { translation: zhTW },
    ja: { translation: ja },
    "zh-CN": { translation: { ...zhTW, menu: { ...zhTW.menu, subtitle: "把自己画成环境的一部分！" } } },
    ko: { translation: base },
    es: { translation: base },
    fr: { translation: base },
    de: { translation: base },
    it: { translation: base },
    "pt-BR": { translation: base },
    ar: { translation: base },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
