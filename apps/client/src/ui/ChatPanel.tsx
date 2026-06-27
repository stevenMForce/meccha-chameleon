import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CLIENT_MESSAGES } from "@meccha/shared";
import { useNetworkStore, useGameUIStore } from "../stores";

interface ChatPanelProps {
  embedded?: boolean;
}

export function ChatPanel({ embedded = false }: ChatPanelProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const messages = useNetworkStore((s) => s.chatMessages);
  const lobbyRoom = useNetworkStore((s) => s.lobbyRoom);
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const setChatOpen = useGameUIStore((s) => s.setChatOpen);

  const send = () => {
    if (!text.trim()) return;
    const room = gameRoom ?? lobbyRoom;
    room?.send(CLIENT_MESSAGES.CHAT, { text: text.trim() });
    setText("");
  };

  return (
    <div className={embedded
      ? "w-full h-full flex flex-col"
      : "fixed bottom-16 right-4 z-50 w-80 h-64 flex flex-col rounded-xl bg-meccha-panel/95 border border-white/10 backdrop-blur"
    }>
      <div className="flex justify-between items-center p-2 border-b border-white/10">
        <span className="font-bold text-sm">{t("chat.title")}</span>
        {!embedded && (
          <button onClick={() => setChatOpen(false)} className="text-white/50">✕</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
        {messages.map((m, i) => (
          <div key={i}>
            <span className="text-meccha-green font-semibold">{m.playerName}: </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("chat.placeholder")}
          className="flex-1 px-2 py-1 rounded bg-white/10 text-sm outline-none"
        />
        <button onClick={send} className="px-3 py-1 rounded bg-meccha-green text-meccha-dark text-sm font-bold">
          {t("chat.send")}
        </button>
      </div>
    </div>
  );
}
