import { useTranslation } from "react-i18next";
import {
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  hexToRgb,
} from "@meccha/shared";
import { usePaintStore } from "../stores";
import { cn } from "../lib/utils";

export function PaintMenu() {
  const { t } = useTranslation();
  const isOpen = usePaintStore((s) => s.isOpen);
  const color = usePaintStore((s) => s.currentColor);
  const brushSize = usePaintStore((s) => s.brushSize);
  const activeTool = usePaintStore((s) => s.activeTool);
  const setColor = usePaintStore((s) => s.setColor);
  const setBrushSize = usePaintStore((s) => s.setBrushSize);
  const setTool = usePaintStore((s) => s.setTool);
  const setOpen = usePaintStore((s) => s.setOpen);

  if (!isOpen) return null;

  const presets = [
    "#ffffff", "#8b4513", "#c4a035", "#228b22", "#4169e1",
    "#ff69b4", "#333333", "#654321", "#f5f0e8", "#1a1a2e",
  ];

  const updateHsv = (key: "h" | "s" | "v", value: number) => {
    const next = { ...color, [key]: value };
    const rgb = hsvToRgb(next.h, next.s, next.v);
    setColor({ ...next, hex: rgbToHex(rgb.r, rgb.g, rgb.b) });
  };

  const updateHex = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const hsv = rgbToHsv(r, g, b);
    setColor({ hex, ...hsv });
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-72 rounded-xl bg-meccha-panel/95 border border-white/10 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-meccha-green">{t("paint.title")}</h3>
        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">✕</button>
      </div>

      <div className="flex gap-1 mb-3">
        {(["brush", "eyedropper", "fill", "clear"] as const).map((tool) => (
          <button
            key={tool}
            onClick={() => setTool(tool)}
            className={cn(
              "flex-1 py-1.5 rounded text-xs font-semibold transition",
              activeTool === tool
                ? "bg-meccha-green text-meccha-dark"
                : "bg-white/10 hover:bg-white/20",
            )}
          >
            {t(`paint.tool.${tool}`)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded border-2 border-white/30"
          style={{ backgroundColor: color.hex }}
        />
        <input
          type="color"
          value={color.hex}
          onChange={(e) => updateHex(e.target.value)}
          className="w-full h-8 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-5 gap-1 mb-3">
        {presets.map((hex) => (
          <button
            key={hex}
            onClick={() => updateHex(hex)}
            className="w-full aspect-square rounded border border-white/20"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      {(["h", "s", "v"] as const).map((key) => (
        <div key={key} className="mb-2">
          <label className="text-xs text-white/60 uppercase">{key}</label>
          <input
            type="range"
            min={0}
            max={key === "h" ? 360 : 100}
            value={color[key]}
            onChange={(e) => updateHsv(key, Number(e.target.value))}
            className="w-full"
          />
        </div>
      ))}

      <div className="mb-2">
        <label className="text-xs text-white/60">{t("paint.metallic")}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={color.metallic * 100}
          onChange={(e) => setColor({ metallic: Number(e.target.value) / 100 })}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label className="text-xs text-white/60">{t("paint.roughness")}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={color.roughness * 100}
          onChange={(e) => setColor({ roughness: Number(e.target.value) / 100 })}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-white/60">{t("paint.brushSize")}</label>
        <input
          type="range"
          min={1}
          max={30}
          value={brushSize * 100}
          onChange={(e) => setBrushSize(Number(e.target.value) / 100)}
          className="w-full"
        />
      </div>

      <p className="text-xs text-white/40 mt-2">{t("paint.noUndo")}</p>
    </div>
  );
}
