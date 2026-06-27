import type { GameMode, GamePhase, RevealSnapshot, TeamId } from "@meccha/shared";
import type { GameState, PlayerState } from "@meccha/shared";

export interface RoundManagerCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onRoundResult: (winner: TeamId | "draw", snapshots: RevealSnapshot[]) => void;
  onWhistle: (playerId: string) => void;
}

export class RoundManager {
  private phaseTimer: ReturnType<typeof setInterval> | null = null;
  private whistleTimer: ReturnType<typeof setInterval> | null = null;
  private snapshots: RevealSnapshot[] = [];
  private doubleHuntPhase = false;

  constructor(
    private state: GameState,
    private callbacks: RoundManagerCallbacks,
  ) {}

  startGame(): void {
    this.state.roundNumber = 1;
    this.assignRoles();
    this.transitionTo("preparation");
  }

  nextRound(): void {
    this.state.roundNumber += 1;
    this.resetPlayersForRound();
    this.assignRoles();
    this.transitionTo("preparation");
  }

  returnToLobby(): void {
    this.clearTimers();
    this.state.phase = "lobby";
    this.state.winnerTeam = "";
    this.state.doublePhase = "";
    this.doubleHuntPhase = false;
    for (const player of this.state.players.values()) {
      player.isReady = false;
      player.isAlive = true;
      player.foundBy = "";
      player.foundAt = 0;
      player.kills = 0;
    }
    this.callbacks.onPhaseChange("lobby");
  }

  handlePlayerFound(seekerId: string, hiderId: string): void {
    const hider = this.state.players.get(hiderId);
    const seeker = this.state.players.get(seekerId);
    if (!hider || !seeker || !hider.isAlive) return;

    hider.isAlive = false;
    hider.foundBy = seekerId;
    hider.foundAt = Date.now();
    seeker.kills += 1;

    const snapshot = this.snapshots.find((s) => s.playerId === hiderId);
    if (snapshot) {
      snapshot.foundBy = seekerId;
      snapshot.foundAt = hider.foundAt;
    }

    if (this.state.mode === "increasingOni") {
      hider.role = "seeker";
      hider.isAlive = true;
    }

    this.checkWinCondition();
  }

  private assignRoles(): void {
    const playerList = Array.from(this.state.players.values());
    const count = playerList.length;
    let seekerCount = Math.max(1, Math.floor(count / 4));

    if (this.state.mode === "double") {
      for (const p of playerList) {
        p.role = "hider";
        p.isAlive = true;
      }
      this.state.doublePhase = "hide";
      this.doubleHuntPhase = false;
      return;
    }

    const shuffled = [...playerList].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      shuffled[i].role = i < seekerCount ? "seeker" : "hider";
      shuffled[i].isAlive = true;
      shuffled[i].foundBy = "";
      shuffled[i].foundAt = 0;
    }
  }

  private resetPlayersForRound(): void {
    for (const player of this.state.players.values()) {
      player.isAlive = true;
      player.foundBy = "";
      player.foundAt = 0;
      player.paintVersion += 1;
    }
  }

  transitionTo(phase: GamePhase): void {
    this.clearTimers();
    this.state.phase = phase;

    switch (phase) {
      case "preparation":
        this.snapshots = [];
        this.captureSnapshots();
        this.state.timeRemaining = this.state.prepDuration;
        this.startCountdown(() => {
          if (this.state.mode === "double" && !this.doubleHuntPhase) {
            this.startDoubleHunt();
          } else {
            this.transitionTo("hunt");
          }
        });
        break;

      case "hunt":
        this.state.timeRemaining = this.state.huntDuration;
        this.startCountdown(() => this.endHunt("draw"));
        if (this.state.whistleEnabled) this.startWhistle();
        break;

      case "answerCheck":
        this.captureSnapshots();
        this.startCountdown(() => this.transitionTo("roundEnd"), 8);
        break;

      case "roundEnd":
        break;

      case "roleAssign":
        this.assignRoles();
        this.transitionTo("preparation");
        break;
    }

    this.callbacks.onPhaseChange(phase);
  }

  private startDoubleHunt(): void {
    this.doubleHuntPhase = true;
    this.state.doublePhase = "hunt";
    for (const player of this.state.players.values()) {
      player.role = "seeker";
      player.isAlive = true;
    }
    this.transitionTo("hunt");
  }

  private startCountdown(onEnd: () => void, duration?: number): void {
    if (duration !== undefined) {
      this.state.timeRemaining = duration;
    }
    this.phaseTimer = setInterval(() => {
      this.state.timeRemaining -= 1;
      if (this.state.timeRemaining <= 0) {
        this.clearTimers();
        onEnd();
      }
    }, 1000);
  }

  private startWhistle(): void {
    this.whistleTimer = setInterval(() => {
      for (const player of this.state.players.values()) {
        if (player.role === "hider" && player.isAlive) {
          this.callbacks.onWhistle(player.id);
        }
      }
    }, this.state.whistleInterval * 1000);
  }

  private checkWinCondition(): void {
    const mode = this.state.mode as GameMode;

    if (mode === "double" && this.doubleHuntPhase) {
      const alive = Array.from(this.state.players.values()).filter((p) => p.isAlive);
      if (alive.length <= 1) {
        this.endHunt("seeker");
      }
      return;
    }

    const hiders = Array.from(this.state.players.values()).filter(
      (p) => p.role === "hider" && p.isAlive,
    );

    if (hiders.length === 0) {
      this.endHunt("seeker");
    }
  }

  private endHunt(winner: TeamId | "draw"): void {
    this.clearTimers();

    if (this.state.mode === "double" && !this.doubleHuntPhase) {
      this.startDoubleHunt();
      return;
    }

    const hidersAlive = Array.from(this.state.players.values()).filter(
      (p) => (p.role === "hider" || this.state.mode === "double") && p.isAlive,
    );

    let finalWinner = winner;
    if (winner === "draw" && hidersAlive.length > 0) {
      finalWinner = "hider";
    } else if (hidersAlive.length === 0) {
      finalWinner = "seeker";
    }

    this.state.winnerTeam = finalWinner;
    this.captureSnapshots();
    this.callbacks.onRoundResult(finalWinner, this.snapshots);
    this.transitionTo("answerCheck");
  }

  private captureSnapshots(): void {
    this.snapshots = Array.from(this.state.players.values())
      .filter((p) => p.role === "hider" || this.state.phase === "answerCheck")
      .map((p) => this.playerToSnapshot(p));
  }

  private playerToSnapshot(player: PlayerState): RevealSnapshot {
    return {
      playerId: player.id,
      playerName: player.name,
      position: { x: player.x, y: player.y, z: player.z },
      rotation: player.rotationY,
      pose: player.pose as RevealSnapshot["pose"],
      foundBy: player.foundBy || undefined,
      foundAt: player.foundAt || undefined,
    };
  }

  private clearTimers(): void {
    if (this.phaseTimer) {
      clearInterval(this.phaseTimer);
      this.phaseTimer = null;
    }
    if (this.whistleTimer) {
      clearInterval(this.whistleTimer);
      this.whistleTimer = null;
    }
  }

  destroy(): void {
    this.clearTimers();
  }
}
