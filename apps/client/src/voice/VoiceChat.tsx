import { useEffect, useRef } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { useSettingsStore, useNetworkStore } from "../stores";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || "";

interface VoiceChatProps {
  roomId: string;
}

export function VoiceChat({ roomId }: VoiceChatProps) {
  const roomRef = useRef<Room | null>(null);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const playerName = useNetworkStore((s) => s.playerName);

  useEffect(() => {
    if (!voiceEnabled || !LIVEKIT_URL) return;

    let room: Room | null = null;

    const connect = async () => {
      try {
        const tokenRes = await fetch(
          `/api/livekit/token?room=${roomId}&name=${encodeURIComponent(playerName)}`,
        );
        if (!tokenRes.ok) return;
        const { token } = await tokenRes.json();

        room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach();
            el.id = `audio-${participant.identity}`;
            document.body.appendChild(el);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach().forEach((el) => el.remove());
        });

        await room.connect(LIVEKIT_URL, token);
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (err) {
        console.warn("Voice chat unavailable:", err);
      }
    };

    connect();

    return () => {
      room?.disconnect();
      roomRef.current = null;
    };
  }, [voiceEnabled, roomId, playerName]);

  if (!voiceEnabled || !LIVEKIT_URL) return null;

  return (
    <div className="fixed top-4 right-4 z-20 px-2 py-1 rounded bg-green-500/20 text-xs text-green-300">
      🎤 Voice
    </div>
  );
}
