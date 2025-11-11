import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { memo } from "react";
import {
  MultimediaContainer,
  MultimediaDisplay,
  MultimediaSpinner,
} from "~/components/multimedia-display";
import { clientProjects } from "~/data";
import { PresenceStatus } from "~/presence/status";

function formatUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = clientProjects.find((project) => project.id === id);
  if (!project) {
    notFound();
  }

  return {
    title: project.name,
    openGraph: {
      siteName: "Braden",
      videos: project.media
        .filter((media) => media.type === "video")
        .map((media) => ({ url: media.src })),
      images: project.media
        .filter((media) => media.type === "image")
        .map((media) => ({ url: media.src })),
    },
  };
}

const ClientProjectPage = memo<PageProps<"/work/[id]">>(async ({ params }) => {
  const { id } = await params;
  const project = clientProjects.find((project) => project.id === id);
  if (!project) {
    notFound();
  }

  return (
    <main className="w-full px-4 pt-8 pb-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold lowercase">
            <Link prefetch href="/">
              <span className="font-semibold">Work</span>
            </Link>
            <span className="text-foreground/25 font-normal"> / </span>
            <span>{project.name}</span>
          </h1>
          <PresenceStatus />
        </div>
        {project.url && (
          <Link
            href={project.url}
            target={`client-project-${project.id}`}
            className="underline"
          >
            {formatUrl(project.url)}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.media.map((media, index) => (
          <MultimediaContainer
            key={index}
            style={{ aspectRatio: `${media.width}/${media.height}` }}
          >
            <MultimediaSpinner />
            <MultimediaDisplay
              key={media.src}
              type={media.type}
              src={media.src}
              imageProps={{ alt: media.alt ?? project.name }}
            />
          </MultimediaContainer>
        ))}
      </div>
    </main>
  );
});
ClientProjectPage.displayName = "ClientProjectPage";

export default ClientProjectPage;
