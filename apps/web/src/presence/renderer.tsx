"use client";

import { ComponentRef, memo, useRef } from "react";
import { Cursor } from "~/components/cursor";
import {
  AnimationFrameProvider,
  useAnimationFrame,
} from "~/providers/animation-frame";
import { presenceState, usePresenceState } from "./state";

const PointerRenderer = memo<{ id: number }>(({ id }) => {
  const ref = useRef<ComponentRef<"div">>(null);

  useAnimationFrame(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const liveState = presenceState.clients?.get(id);
    if (!liveState) {
      return;
    }

    if (liveState.id === presenceState.myId) {
      element.style.opacity = "0";
      return;
    }

    if (
      liveState.pointerXPercent !== null &&
      liveState.pointerYPercent !== null
    ) {
      const x =
        liveState.pointerXPercent * window.document.body.clientWidth -
        element.offsetWidth / 2;
      const y =
        liveState.pointerYPercent * window.document.body.clientHeight -
        element.offsetHeight / 2;

      element.style.transform = `translate(${x}px, ${y}px)`;
      element.style.opacity = "0.5";
    } else {
      element.style.opacity = "0";
    }
  });

  return (
    <div ref={ref} className="absolute top-0 left-0">
      <Cursor className="size-8" />
    </div>
  );
});
PointerRenderer.displayName = "Pointer";

export const PresenceRenderer = memo(() => {
  const state = usePresenceState();

  return (
    <AnimationFrameProvider>
      <div className="pointer-events-none">
        {state.clients &&
          Array.from(state.clients.keys()).map((id) => (
            <PointerRenderer key={id} id={id} />
          ))}
      </div>
    </AnimationFrameProvider>
  );
});
PresenceRenderer.displayName = "PresenceRenderer";
