import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWorkshopMaps } from "../network/client";
import type { WorkshopEntry } from "@meccha/shared";

export function Workshop() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [maps, setMaps] = useState<WorkshopEntry[]>([]);
  const [subscribed, setSubscribed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("meccha-subscribed") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchWorkshopMaps().then(setMaps);
  }, []);

  const subscribe = (id: string) => {
    const next = subscribed.includes(id)
      ? subscribed.filter((s) => s !== id)
      : [...subscribed, id];
    setSubscribed(next);
    localStorage.setItem("meccha-subscribed", JSON.stringify(next));
  };

  return (
    <div className="min-h-full p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate("/")} className="text-white/60 mb-6 hover:text-white">
        ← {t("common.back")}
      </button>
      <h1 className="text-2xl font-bold mb-6">{t("workshop.title")}</h1>

      {maps.length === 0 ? (
        <p className="text-white/60">{t("workshop.empty")}</p>
      ) : (
        <div className="space-y-3">
          {maps.map((map) => (
            <div
              key={map.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div>
                <p className="font-bold">{map.name}</p>
                <p className="text-sm text-white/60">
                  {t("workshop.by")} {map.author} · {map.downloads} {t("workshop.downloads")}
                </p>
              </div>
              <button
                onClick={() => subscribe(map.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm ${
                  subscribed.includes(map.id)
                    ? "bg-meccha-green text-meccha-dark"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {subscribed.includes(map.id) ? t("workshop.subscribed") : t("workshop.subscribe")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
