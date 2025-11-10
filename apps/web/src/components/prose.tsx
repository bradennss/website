import { ComponentProps, memo } from "react";
import { cn } from "~/utils";
import styles from "./prose.module.css";

export const Prose = memo<ComponentProps<"div">>(
  ({ children, className, ...props }) => {
    return (
      <div className={cn(styles.prose, className)} {...props}>
        {children}
      </div>
    );
  }
);

Prose.displayName = "Prose";
