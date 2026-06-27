import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../stores";
import { leaveCurrentLobby, leaveCurrentGame } from "../network/client";
import { LANGUAGES } from "../i18n";

export function MainMenu() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  useEffect(() => {
    void leaveCurrentLobby();
    void leaveCurrentGame();
  }, []);

  const changeLang = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-b from-meccha-dark to-meccha-panel p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-meccha-green mb-2 tracking-tight">
          MECCHA
        </h1>
        <h2 className="text-3xl font-bold text-meccha-yellow">CHAMELEON</h2>
        <p className="text-white/60 mt-4 max-w-md">{t("menu.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate("/create")}
          className="w-full py-4 rounded-xl bg-meccha-green text-meccha-dark font-bold text-lg hover:scale-105 transition shadow-lg"
        >
          {t("menu.createRoom")}
        </button>
        <button
          onClick={() => navigate("/browse")}
          className="w-full py-4 rounded-xl bg-meccha-yellow text-meccha-dark font-bold text-lg hover:scale-105 transition"
        >
          {t("menu.browseRooms")}
        </button>
        <button
          onClick={() => navigate("/editor")}
          className="w-full py-3 rounded-xl bg-white/10 font-bold hover:bg-white/20 transition"
        >
          {t("menu.mapEditor")}
        </button>
        <button
          onClick={() => navigate("/workshop")}
          className="w-full py-3 rounded-xl bg-white/10 font-bold hover:bg-white/20 transition"
        >
          {t("menu.workshop")}
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="w-full py-3 rounded-xl bg-white/5 font-semibold text-white/70 hover:bg-white/10 transition"
        >
          {t("menu.settings")}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLang(lang.code)}
            className={`px-2 py-1 rounded text-xs ${
              language === lang.code ? "bg-meccha-green text-meccha-dark" : "bg-white/10"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
