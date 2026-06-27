import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./i18n";
import "./index.css";
import { MainMenu } from "./pages/MainMenu";
import { CreateRoom } from "./pages/CreateRoom";
import { ServerBrowser } from "./pages/ServerBrowser";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";
import { Settings } from "./pages/Settings";
import { MapEditor } from "./pages/MapEditor";
import { Workshop } from "./pages/Workshop";
import { useNetworkStore } from "./stores";

function GameNavigationHandler() {
  const navigate = useNavigate();
  const gameRoom = useNetworkStore((s) => s.gameRoom);

  useEffect(() => {
    const handler = () => navigate("/play");
    window.addEventListener("meccha-enter-game", handler);
    return () => window.removeEventListener("meccha-enter-game", handler);
  }, [navigate]);

  useEffect(() => {
    if (gameRoom) navigate("/play");
  }, [gameRoom, navigate]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GameNavigationHandler />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/browse" element={<ServerBrowser />} />
        <Route path="/room/:roomId" element={<Lobby />} />
        <Route path="/play" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/editor" element={<MapEditor />} />
        <Route path="/workshop" element={<Workshop />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
