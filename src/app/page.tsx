import Link from "next/link";
import { memo } from "react";
import { MediaDisplay } from "~/components/media-display";
import {
  ClientProject,
  clientProjects,
  PersonalProject,
  personalProjects,
} from "~/data";

export const ClientProjectCard = memo<{ project: ClientProject }>(
  ({ project }) => {
    const [firstMedia] = project.media;

    return (
      <Link prefetch href={`/work/${project.id}`}>
        <MediaDisplay
          type={firstMedia.type}
          src={firstMedia.src}
          alt={firstMedia.alt ?? project.name}
          style={{ aspectRatio: `${firstMedia.width}/${firstMedia.height}` }}
        />
      </Link>
    );
  }
);
ClientProjectCard.displayName = "ClientProjectCard";

export const PersonalProjectCard = memo<{ project: PersonalProject }>(
  ({ project }) => {
    const [firstMedia] = project.media;

    return (
      <Link prefetch href={`/projects/${project.id}`}>
        <MediaDisplay
          type={firstMedia.type}
          src={firstMedia.src}
          alt={firstMedia.alt ?? project.name}
          style={{ aspectRatio: `${firstMedia.width}/${firstMedia.height}` }}
        />
      </Link>
    );
  }
);
PersonalProjectCard.displayName = "PersonalProjectCard";

const HomePage = memo(() => {
  return (
    <main className="w-full px-4 pt-8 pb-8 flex flex-col gap-8">
      <h1 className="text-2xl font-semibold lowercase">Work</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientProjects.map((project) => (
          <ClientProjectCard key={project.id} project={project} />
        ))}
      </div>
      <h1 className="text-2xl font-semibold lowercase">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personalProjects.map((project) => (
          <PersonalProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
});
HomePage.displayName = "HomePage";

export default HomePage;
