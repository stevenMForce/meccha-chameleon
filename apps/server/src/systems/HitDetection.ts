import type { ShootMessage } from "@meccha/shared";
import type { GameState } from "@meccha/shared";

const PLAYER_RADIUS = 0.6;
const PLAYER_HEIGHT = 1.8;
const SHOTGUN_RANGE = 25;
const SHOTGUN_SPREAD = 0.08;
const SHOTGUN_PELLETS = 8;
const SHOOT_COOLDOWN_MS = 800;

export class HitDetection {
  private lastShot = new Map<string, number>();

  validateShot(
    state: GameState,
    shooterId: string,
    message: ShootMessage,
  ): string | null {
    const shooter = state.players.get(shooterId);
    if (!shooter || shooter.role !== "seeker" || !shooter.isAlive) return null;
    if (state.phase !== "hunt") return null;

    const now = Date.now();
    const last = this.lastShot.get(shooterId) ?? 0;
    if (now - last < SHOOT_COOLDOWN_MS) return null;
    this.lastShot.set(shooterId, now);

    const dir = normalize(message.direction);
    let closestId: string | null = null;
    let closestDist = SHOTGUN_RANGE;

    for (let pellet = 0; pellet < SHOTGUN_PELLETS; pellet++) {
      const spreadDir = applySpread(dir, SHOTGUN_SPREAD);
      const hit = this.raycastPlayers(state, message.origin, spreadDir, shooterId);
      if (hit && hit.distance < closestDist) {
        closestDist = hit.distance;
        closestId = hit.playerId;
      }
    }

    return closestId;
  }

  private raycastPlayers(
    state: GameState,
    origin: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    excludeId: string,
  ): { playerId: string; distance: number } | null {
    let closest: { playerId: string; distance: number } | null = null;

    for (const [id, player] of state.players.entries()) {
      if (id === excludeId) continue;
      if (player.role !== "hider" || !player.isAlive) continue;

      const center = { x: player.x, y: player.y + PLAYER_HEIGHT / 2, z: player.z };
      const hit = rayCapsuleIntersect(origin, direction, center, PLAYER_RADIUS, PLAYER_HEIGHT);

      if (hit !== null && (closest === null || hit < closest.distance)) {
        closest = { playerId: id, distance: hit };
      }
    }

    return closest;
  }
}

function normalize(v: { x: number; y: number; z: number }) {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function applySpread(dir: { x: number; y: number; z: number }, spread: number) {
  return normalize({
    x: dir.x + (Math.random() - 0.5) * spread,
    y: dir.y + (Math.random() - 0.5) * spread,
    z: dir.z + (Math.random() - 0.5) * spread,
  });
}

function rayCapsuleIntersect(
  origin: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  center: { x: number; y: number; z: number },
  radius: number,
  height: number,
): number | null {
  const halfH = height / 2 - radius;
  const bottom = { x: center.x, y: center.y - halfH, z: center.z };
  const top = { x: center.x, y: center.y + halfH, z: center.z };

  const tBottom = raySphere(origin, dir, bottom, radius);
  const tTop = raySphere(origin, dir, top, radius);
  const tBody = rayCylinder(origin, dir, center, radius, halfH * 2);

  const hits = [tBottom, tTop, tBody].filter((t): t is number => t !== null && t >= 0);
  return hits.length > 0 ? Math.min(...hits) : null;
}

function raySphere(
  origin: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  center: { x: number; y: number; z: number },
  radius: number,
): number | null {
  const ox = origin.x - center.x;
  const oy = origin.y - center.y;
  const oz = origin.z - center.z;
  const b = 2 * (ox * dir.x + oy * dir.y + oz * dir.z);
  const c = ox * ox + oy * oy + oz * oz - radius * radius;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / 2;
  return t >= 0 ? t : null;
}

function rayCylinder(
  origin: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  center: { x: number; y: number; z: number },
  radius: number,
  height: number,
): number | null {
  const ox = origin.x - center.x;
  const oz = origin.z - center.z;
  const a = dir.x * dir.x + dir.z * dir.z;
  const b = 2 * (ox * dir.x + oz * dir.z);
  const c = ox * ox + oz * oz - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  if (t < 0) return null;
  const hitY = origin.y + dir.y * t;
  const halfH = height / 2;
  if (Math.abs(hitY - center.y) <= halfH) return t;
  return null;
}
