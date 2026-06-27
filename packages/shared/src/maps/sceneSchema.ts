import { z } from "zod";

export const transformSchema = z.object({
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotation: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  scale: z.object({ x: z.number(), y: z.number(), z: z.number() }).default({ x: 1, y: 1, z: 1 }),
});

export const sceneObjectSchema = z.object({
  id: z.string(),
  type: z.string(),
  transform: transformSchema,
  material: z
    .object({
      color: z.string().optional(),
      textureUrl: z.string().optional(),
      metallic: z.number().optional(),
      roughness: z.number().optional(),
    })
    .optional(),
  collider: z.enum(["box", "none"]).default("box"),
});

export const customMapSchema = z.object({
  id: z.string(),
  name: z.string(),
  author: z.string(),
  thumbnail: z.string().optional(),
  version: z.number().default(1),
  spawnPoints: z.object({
    hider: z.array(z.object({ x: z.number(), y: z.number(), z: z.number() })),
    seeker: z.array(z.object({ x: z.number(), y: z.number(), z: z.number() })),
  }),
  lighting: z
    .object({
      ambientIntensity: z.number().default(0.4),
      directionalIntensity: z.number().default(1),
      fogColor: z.string().optional(),
      fogNear: z.number().optional(),
      fogFar: z.number().optional(),
    })
    .optional(),
  skybox: z.string().optional(),
  bounds: z
    .object({
      min: z.object({ x: z.number(), y: z.number(), z: z.number() }),
      max: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    })
    .optional(),
  objects: z.array(sceneObjectSchema),
});

export type CustomMap = z.infer<typeof customMapSchema>;
export type SceneObject = z.infer<typeof sceneObjectSchema>;

export interface WorkshopEntry {
  id: string;
  name: string;
  author: string;
  thumbnail?: string;
  downloads: number;
  mapUrl: string;
  createdAt: string;
}
