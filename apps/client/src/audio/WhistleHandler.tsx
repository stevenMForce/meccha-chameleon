import { useEffect } from "react";
import { Howl } from "howler";
import { useSettingsStore } from "../stores";

export function WhistleHandler() {
  const volume = useSettingsStore((s) => s.volume);

  useEffect(() => {
    const whistle = new Howl({
      src: ["data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="],
      volume,
    });

    const handler = () => whistle.play();
    window.addEventListener("meccha-whistle", handler);
    return () => window.removeEventListener("meccha-whistle", handler);
  }, [volume]);

  return null;
}
