"use client";

import {
  createContext,
  memo,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";

const AnimationFrameContext = createContext<{
  callbacksRef: RefObject<Set<() => void>>;
} | null>(null);

export function useAnimationFrame(callback: () => void) {
  const context = useContext(AnimationFrameContext);
  if (context === null) {
    throw new Error(
      "useAnimationFrame must be used within a <AnimationFrameProvider />",
    );
  }

  useEffect(() => {
    context.callbacksRef.current.add(callback);

    return () => {
      context.callbacksRef.current.delete(callback);
    };
  }, [callback]);
}

export const AnimationFrameProvider = memo<PropsWithChildren>(
  ({ children }) => {
    const callbacksRef = useRef<Set<() => void>>(new Set());

    useEffect(() => {
      const handleAnimationFrame = () => {
        callbacksRef.current.forEach((callback) => callback());
        animationFrameId = requestAnimationFrame(handleAnimationFrame);
      };
      let animationFrameId = requestAnimationFrame(handleAnimationFrame);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [callbacksRef]);

    return (
      <AnimationFrameContext.Provider value={{ callbacksRef }}>
        {children}
      </AnimationFrameContext.Provider>
    );
  },
);
AnimationFrameProvider.displayName = "AnimationFrameProvider";
