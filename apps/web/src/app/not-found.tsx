import { Metadata } from "next";
import { memo } from "react";

export const metadata: Metadata = {
  title: "Not Found",
};

const NotFoundPage = memo(() => {
  return (
    <main>
      <div className="w-full max-w-2xl mr-auto px-4 pt-8 pb-8 flex flex-col gap-8">
        <h1 className="text-3xl font-semibold lowercase">Not found</h1>
      </div>
    </main>
  );
});
NotFoundPage.displayName = "NotFoundPage";

export default NotFoundPage;
