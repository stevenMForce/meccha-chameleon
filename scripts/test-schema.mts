import { Schema, type, MapSchema, Encoder } from "@colyseus/schema";
import { LobbyRoomState, PlayerState } from "@meccha/shared";

// Inline test schema
class InlinePlayer extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
}

class InlineLobby extends Schema {
  @type({ map: InlinePlayer }) players = new MapSchema<InlinePlayer>();
}

function testEncode(label: string, state: Schema, setPlayer: () => void) {
  setPlayer();
  try {
    const enc = new Encoder(state);
    const bytes = enc.encodeAll();
    console.log(`${label}: OK (${bytes.length} bytes)`);
  } catch (e) {
    console.error(`${label}: FAIL`, (e as Error).message);
  }
}

const shared = new LobbyRoomState();
testEncode("shared empty", shared, () => {});

const sharedWithPlayer = new LobbyRoomState();
testEncode("shared with player", sharedWithPlayer, () => {
  const p = new PlayerState();
  p.id = "a";
  p.name = "Test";
  sharedWithPlayer.players.set("a", p);
});

const inline = new InlineLobby();
testEncode("inline with player", inline, () => {
  const p = new InlinePlayer();
  p.id = "a";
  p.name = "Test";
  inline.players.set("a", p);
});
