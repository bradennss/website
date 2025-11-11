import { b } from "@zorsh/zorsh";

const serverUpdateSchema = b.struct({
  myId: b.option(b.u32()),
  roomName: b.option(b.string()),
  clientCount: b.option(b.u16()),
  clientUpdates: b.option(
    b.vec(
      b.struct({
        id: b.u32(),
        pointerXPercent: b.option(b.f32()),
        pointerYPercent: b.option(b.f32()),
      }),
    ),
  ),
  removeClientIds: b.option(b.vec(b.u32())),
});
export type ServerUpdate = b.infer<typeof serverUpdateSchema>;

export function serializeServerUpdate(update: ServerUpdate): Uint8Array {
  return serverUpdateSchema.serialize(update);
}

export function deserializeServerUpdate(data: Uint8Array): ServerUpdate {
  return serverUpdateSchema.deserialize(data);
}
