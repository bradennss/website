import { memo } from "react";
import { Spinner } from "~/components/spinner";

const LoadingPage = memo(() => {
  return (
    <div className="relative w-full h-[100svh]">
      <div className="absolute inset-0 bg-linear-to-b from-foreground/5 to-foreground/25 flex items-center justify-center">
        <Spinner className="bg-background" />
      </div>
    </div>
  );
});
LoadingPage.displayName = "LoadingPage";

export default LoadingPage;
