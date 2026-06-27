import {
  PAINT_TEXTURE_SIZE,
  hexToRgb,
  type PaintStrokeMessage,
  type PaintColor,
} from "@meccha/shared";
import * as THREE from "three";

export class PaintEngine {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private metallicCanvas: HTMLCanvasElement;
  private roughnessCanvas: HTMLCanvasElement;
  private metallicTexture: THREE.CanvasTexture;
  private roughnessTexture: THREE.CanvasTexture;
  private lastStrokeTime = 0;

  constructor(size = PAINT_TEXTURE_SIZE) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
    this.reset();

    this.metallicCanvas = document.createElement("canvas");
    this.metallicCanvas.width = size;
    this.metallicCanvas.height = size;
    const mctx = this.metallicCanvas.getContext("2d")!;
    mctx.fillStyle = "#000000";
    mctx.fillRect(0, 0, size, size);

    this.roughnessCanvas = document.createElement("canvas");
    this.roughnessCanvas.width = size;
    this.roughnessCanvas.height = size;
    const rctx = this.roughnessCanvas.getContext("2d")!;
    rctx.fillStyle = "#cccccc";
    rctx.fillRect(0, 0, size, size);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.metallicTexture = new THREE.CanvasTexture(this.metallicCanvas);
    this.roughnessTexture = new THREE.CanvasTexture(this.roughnessCanvas);
  }

  reset(): void {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.texture) this.texture.needsUpdate = true;
  }

  applyStroke(stroke: PaintStrokeMessage | (PaintColor & { uvX: number; uvY: number; radius: number; tool?: string; color?: string })): void {
    const x = stroke.uvX * this.canvas.width;
    const y = (1 - stroke.uvY) * this.canvas.height;
    const radius = stroke.radius * this.canvas.width;

    if ("tool" in stroke && stroke.tool === "clear") {
      this.reset();
      return;
    }

    const colorHex = "color" in stroke && stroke.color ? stroke.color : ("hex" in stroke ? stroke.hex : "#ffffff");

    if ("tool" in stroke && stroke.tool === "fill") {
      this.ctx.fillStyle = colorHex;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.markDirty();
      return;
    }

    const { r, g, b } = hexToRgb(colorHex);
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    const metallic = stroke.metallic ?? 0;
    const roughness = stroke.roughness ?? 0.8;
    const mVal = Math.round(metallic * 255);
    const rVal = Math.round(roughness * 255);

    const mctx = this.metallicCanvas.getContext("2d")!;
    const rctx = this.roughnessCanvas.getContext("2d")!;
    mctx.fillStyle = `rgb(${mVal},${mVal},${mVal})`;
    mctx.beginPath();
    mctx.arc(x, y, radius, 0, Math.PI * 2);
    mctx.fill();
    rctx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
    rctx.beginPath();
    rctx.arc(x, y, radius, 0, Math.PI * 2);
    rctx.fill();

    this.markDirty();
  }

  paintAtUV(uvX: number, uvY: number, color: PaintColor, radius: number, tool: string): PaintStrokeMessage | null {
    const now = Date.now();
    if (now - this.lastStrokeTime < 16) return null;
    this.lastStrokeTime = now;

    const stroke: PaintStrokeMessage = {
      playerId: "",
      uvX,
      uvY,
      radius,
      color: color.hex,
      metallic: color.metallic,
      roughness: color.roughness,
      tool: tool as PaintStrokeMessage["tool"],
    };
    this.applyStroke(stroke);
    return stroke;
  }

  getSnapshotDataUrl(): string {
    return this.canvas.toDataURL("image/webp", 0.8);
  }

  getMaterials(): {
    map: THREE.CanvasTexture;
    metalnessMap: THREE.CanvasTexture;
    roughnessMap: THREE.CanvasTexture;
  } {
    return {
      map: this.texture,
      metalnessMap: this.metallicTexture,
      roughnessMap: this.roughnessTexture,
    };
  }

  private markDirty(): void {
    this.texture.needsUpdate = true;
    this.metallicTexture.needsUpdate = true;
    this.roughnessTexture.needsUpdate = true;
  }

  dispose(): void {
    this.texture.dispose();
    this.metallicTexture.dispose();
    this.roughnessTexture.dispose();
  }
}

export function sampleColorFromMaterial(
  material: THREE.MeshStandardMaterial,
  uv?: THREE.Vector2,
): string {
  if (material.map && uv) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const img = material.map.image as HTMLCanvasElement | HTMLImageElement;
    if (img) {
      const w = material.map.image.width;
      const h = material.map.image.height;
      ctx.drawImage(img, uv.x * w, (1 - uv.y) * h, 1, 1, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
  const c = material.color;
  return `#${c.getHexString()}`;
}
