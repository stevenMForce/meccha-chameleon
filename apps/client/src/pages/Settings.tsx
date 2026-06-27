import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../stores";

export function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sensitivity = useSettingsStore((s) => s.mouseSensitivity);
  const volume = useSettingsStore((s) => s.volume);
  const colorblind = useSettingsStore((s) => s.colorblindMode);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const setSensitivity = useSettingsStore((s) => s.setMouseSensitivity);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const setColorblind = useSettingsStore((s) => s.setColorblindMode);
  const setVoiceEnabled = useSettingsStore((s) => s.setVoiceEnabled);

  return (
    <div className="min-h-full p-8 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="text-white/60 mb-6 hover:text-white">
        ← {t("common.back")}
      </button>
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-white/60">{t("settings.sensitivity")}</label>
          <input
            type="range"
            min={0.0005}
            max={0.01}
            step={0.0005}
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm text-white/60">{t("settings.volume")}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={colorblind} onChange={(e) => setColorblind(e.target.checked)} />
          <span>{t("settings.colorblind")}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} />
          <span>{t("settings.voice")}</span>
        </label>
      </div>
    </div>
  );
}
