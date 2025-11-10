"use client";

import Image from "next/image";
import { ComponentProps, memo, useCallback, useState } from "react";
import { cn } from "~/utils";
import { Spinner } from "./spinner";

export const MediaDisplay = memo<
  ComponentProps<"div"> & {
    type: "image" | "video";
    src: string;
    alt: string;
  }
>(({ className, type, src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoaded = useCallback(() => setIsLoaded(true), []);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center aspect-video overflow-hidden border border-foreground bg-linear-to-b from-foreground/5 to-foreground/25",
        className
      )}
      {...props}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Spinner className="bg-background" />
        </div>
      )}
      {type === "image" ? (
        <Image
          src={src}
          alt={alt}
          priority
          loading="eager"
          unoptimized
          fill
          onLoad={handleLoaded}
          className={cn(
            "object-cover object-center",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <video
          src={src}
          autoPlay
          playsInline
          muted
          loop
          controls={false}
          onCanPlayThrough={handleLoaded}
          className={cn(
            "object-cover object-center",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
});
MediaDisplay.displayName = "MediaDisplay";
