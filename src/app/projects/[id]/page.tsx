import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { memo } from "react";
import { MediaDisplay } from "~/components/media-display";
import { personalProjects } from "~/data";

function formatUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = personalProjects.find((project) => project.id === id);
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

const PersonalProjectPage = memo<PageProps<"/projects/[id]">>(
  async ({ params }) => {
    const { id } = await params;
    const project = personalProjects.find((project) => project.id === id);
    if (!project) {
      notFound();
    }

    return (
      <main className="w-full px-4 pt-8 pb-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold lowercase">
            <Link prefetch href="/">
              <span className="font-semibold">Projects</span>
            </Link>
            <span className="text-foreground/25 font-normal"> / </span>
            <span>{project.name}</span>
          </h1>
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
            <MediaDisplay
              key={index}
              type={media.type}
              src={media.src}
              alt={media.alt ?? project.name}
              style={{ aspectRatio: `${media.width}/${media.height}` }}
            />
          ))}
        </div>
      </main>
    );
  }
);
PersonalProjectPage.displayName = "PersonalProjectPage";

export default PersonalProjectPage;
