import { b } from "@zorsh/zorsh";

const clientUpdateSchema = b.struct({
  roomName: b.option(b.string()),
  pointerXPercent: b.option(b.f32()),
  pointerYPercent: b.option(b.f32()),
});
export type ClientUpdate = b.infer<typeof clientUpdateSchema>;

export function deserializeClientUpdate(data: Uint8Array): ClientUpdate {
  return clientUpdateSchema.deserialize(data);
}

export function serializeClientUpdate(update: ClientUpdate): Uint8Array {
  return clientUpdateSchema.serialize(update);
}
