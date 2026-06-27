import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import type { CustomMap, SceneObject } from "@meccha/shared";
import { customMapSchema } from "@meccha/shared";
import { CustomMapScene } from "../game/maps/CustomMapScene";

const PREFABS = [
  { type: "wall", color: "#888888", scale: [4, 2, 0.3] as [number, number, number] },
  { type: "pillar", color: "#654321", scale: [0.5, 3, 0.5] as [number, number, number] },
  { type: "crate", color: "#8b6914", scale: [1, 1, 1] as [number, number, number] },
  { type: "furniture", color: "#4a3728", scale: [2, 1, 1.5] as [number, number, number] },
];

export function MapEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mapName, setMapName] = useState("My Custom Map");
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedPrefab, setSelectedPrefab] = useState(0);

  const addObject = useCallback(() => {
    const prefab = PREFABS[selectedPrefab];
    const id = `obj-${Date.now()}`;
    setObjects((prev) => [
      ...prev,
      {
        id,
        type: prefab.type,
        transform: {
          position: { x: (Math.random() - 0.5) * 10, y: prefab.scale[1] / 2, z: (Math.random() - 0.5) * 10 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: prefab.scale[0], y: prefab.scale[1], z: prefab.scale[2] },
        },
        material: { color: prefab.color },
        collider: "box",
      },
    ]);
  }, [selectedPrefab]);

  const exportMap = () => {
    const map: CustomMap = {
      id: `custom-${Date.now()}`,
      name: mapName,
      author: "Editor",
      version: 1,
      spawnPoints: {
        hider: [{ x: -3, y: 0, z: -3 }, { x: 3, y: 0, z: 3 }],
        seeker: [{ x: 0, y: 0, z: -8 }],
      },
      objects,
    };
    const parsed = customMapSchema.safeParse(map);
    if (!parsed.success) {
      alert("Invalid map");
      return;
    }
    const blob = new Blob([JSON.stringify(parsed.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mapName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const parsed = customMapSchema.safeParse(data);
        if (parsed.success) {
          setMapName(parsed.data.name);
          setObjects(parsed.data.objects);
        }
      } catch {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const previewMap: CustomMap = {
    id: "preview",
    name: mapName,
    author: "Editor",
    version: 1,
    spawnPoints: { hider: [], seeker: [] },
    objects,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate("/")} className="text-white/60 hover:text-white">
          ← {t("common.back")}
        </button>
        <h1 className="font-bold">{t("editor.title")}</h1>
        <input
          value={mapName}
          onChange={(e) => setMapName(e.target.value)}
          className="px-2 py-1 rounded bg-white/10 text-sm"
        />
        <select
          value={selectedPrefab}
          onChange={(e) => setSelectedPrefab(Number(e.target.value))}
          className="px-2 py-1 rounded bg-white/10 text-sm"
        >
          {PREFABS.map((p, i) => (
            <option key={p.type} value={i}>{p.type}</option>
          ))}
        </select>
        <button onClick={addObject} className="px-3 py-1 rounded bg-meccha-green text-meccha-dark text-sm font-bold">
          {t("editor.add")}
        </button>
        <button onClick={exportMap} className="px-3 py-1 rounded bg-meccha-yellow text-meccha-dark text-sm font-bold">
          {t("editor.export")}
        </button>
        <label className="px-3 py-1 rounded bg-white/10 text-sm font-bold cursor-pointer">
          {t("editor.import")}
          <input type="file" accept=".json" onChange={importMap} className="hidden" />
        </label>
        <button
          onClick={() => setObjects([])}
          className="px-3 py-1 rounded bg-red-500/30 text-sm"
        >
          {t("editor.clear")}
        </button>
      </div>
      <div className="flex-1">
        <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Grid infiniteGrid fadeDistance={30} />
          <CustomMapScene map={previewMap} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
