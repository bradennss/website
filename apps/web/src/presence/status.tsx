"use client";

import { memo } from "react";
import { Spinner } from "~/components/spinner";
import { pluralize } from "~/utils";
import { usePresenceState } from "./state";

export const PresenceStatus = memo(() => {
  const state = usePresenceState();

  return (
    <div className="flex items-center gap-2 select-none text-foreground/50">
      {state.connectionState === "connected" ? (
        <span>
          {pluralize(state.clientCount ?? 0, "person", "people")} on this page
        </span>
      ) : (
        <Spinner className="size-6 p-0.5 bg-foreground/50" />
      )}
    </div>
  );
});
PresenceStatus.displayName = "PresenceStatus";
