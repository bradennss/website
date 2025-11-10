"use client";

import Image from "next/image";
import {
  ComponentProps,
  CSSProperties,
  Key,
  memo,
  useCallback,
  useState,
} from "react";
import { cn } from "~/utils";
import { Spinner } from "./spinner";

export const MultimediaContainer = memo<ComponentProps<"div">>(
  ({ className, children, ...props }) => {
    return (
      <div
        className={cn(
          "relative overflow-hidden border border-foreground bg-linear-to-b from-foreground/5 to-foreground/25",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const MultimediaSpinner = memo<ComponentProps<typeof Spinner>>(
  ({ className, ...props }) => {
    return (
      <Spinner
        className={cn(
          "absolute bg-background top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          className
        )}
        {...props}
      />
    );
  }
);
MultimediaSpinner.displayName = "MultimediaSpinner";

export const MultimediaDisplay = memo<{
  type: "image" | "video";
  key: Key;
  src: string;
  imageProps: Omit<
    ComponentProps<typeof Image>,
    "src" | "fill" | "width" | "height" | "onLoad"
  >;
  videoProps?: Omit<ComponentProps<"video">, "src" | "onCanPlayThrough">;
  className?: string;
  style?: CSSProperties;
}>(({ type, src, className, style, imageProps, videoProps }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoaded = useCallback(() => setIsLoaded(true), []);

  if (type === "image") {
    const { className: imageClassName, ...rest } = imageProps;
    return (
      <Image
        src={src}
        fill
        onLoad={handleLoaded}
        className={cn(
          "object-cover object-center transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          imageClassName,
          className
        )}
        style={style}
        {...rest}
      />
    );
  }

  if (type === "video") {
    const { className: videoClassName, ...rest } = videoProps ?? {};
    return (
      <video
        src={src}
        autoPlay
        playsInline
        muted
        loop
        controls={false}
        onCanPlayThrough={handleLoaded}
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          videoClassName,
          className
        )}
        style={style}
        {...rest}
      />
    );
  }

  throw new Error(`Invalid media type: ${type}`);
});
MultimediaDisplay.displayName = "MultimediaDisplay";
