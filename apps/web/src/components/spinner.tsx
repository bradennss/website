import { ComponentProps, memo } from "react";
import { cn } from "~/utils";
import styles from "./spinner.module.css";

export const Spinner = memo<ComponentProps<"div">>(
  ({ className, ...props }) => {
    return (
      <div
        className={cn(
          "bg-foreground w-12 p-1 aspect-square",
          styles.spinner,
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = "Spinner";
