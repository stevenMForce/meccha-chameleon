import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGameUIStore, useNetworkStore } from "../stores";
import { cn } from "../lib/utils";

export function AnswerCheck() {
  const { t } = useTranslation();
  const show = useGameUIStore((s) => s.showAnswerCheck);
  const index = useGameUIStore((s) => s.answerCheckIndex);
  const setIndex = useGameUIStore((s) => s.setAnswerCheckIndex);
  const snapshots = useNetworkStore((s) => s.roundSnapshots);
  const winner = useNetworkStore((s) => s.roundWinner);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!show || !autoPlay || snapshots.length === 0) return;
    const timer = setInterval(() => {
      setIndex((index + 1) % snapshots.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [show, autoPlay, index, snapshots.length, setIndex]);

  if (!show) return null;

  const snap = snapshots[index];

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-black/70 backdrop-blur border border-meccha-yellow/50">
        <h2 className="text-xl font-bold text-meccha-yellow text-center">
          {t("answerCheck.title")}
        </h2>
        {winner && (
          <p className="text-center text-meccha-green font-semibold mt-1">
            {t(`answerCheck.winner.${winner}`)}
          </p>
        )}
      </div>

      {snap && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 p-4 rounded-xl bg-meccha-panel/90 border border-white/10 pointer-events-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">{snap.playerName}</span>
            <span className="text-sm text-white/60">
              {index + 1} / {snapshots.length}
            </span>
          </div>
          <p className="text-sm">
            {t("answerCheck.pose")}: {t(`pose.${snap.pose}`)}
          </p>
          <p className="text-sm">
            {snap.foundBy
              ? t("answerCheck.found")
              : t("answerCheck.missed")}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
            >
              ←
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={cn(
                "flex-1 py-1 rounded text-sm font-semibold",
                autoPlay ? "bg-meccha-green text-meccha-dark" : "bg-white/10",
              )}
            >
              {autoPlay ? t("answerCheck.autoOn") : t("answerCheck.autoOff")}
            </button>
            <button
              onClick={() => setIndex(Math.min(snapshots.length - 1, index + 1))}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
