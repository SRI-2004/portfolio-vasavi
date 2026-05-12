'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectMeta, projectTags, type Project, type ProjectTag } from '@/app/data/projects';

type FilterValue = 'All' | ProjectTag;

const allFilter: FilterValue = 'All';
const filters: FilterValue[] = [allFilter, ...projectTags];

function canUseNextImage(src: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return src.startsWith('/') || Boolean(supabaseUrl && src.startsWith(supabaseUrl));
}

function isProjectTag(filter: FilterValue): filter is ProjectTag {
  return filter !== allFilter;
}

export function ProjectsIndexClient({ projects, basePath = '/projects' }: { projects: Project[]; basePath?: string }) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(allFilter);

  const tagCounts = useMemo(() => {
    return filters.reduce<Record<FilterValue, number>>((counts, filter) => {
      counts[filter] = isProjectTag(filter)
        ? projects.filter((project) => project.tags.includes(filter)).length
        : projects.length;
      return counts;
    }, {} as Record<FilterValue, number>);
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (!isProjectTag(activeFilter)) return projects;
    return projects.filter((project) => project.tags.includes(activeFilter));
  }, [activeFilter, projects]);

  return (
    <>
      <div className="project-filters" aria-label="Project filters">
        {filters.map((filter) => (
          <button
            className="project-filter"
            data-active={activeFilter === filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            key={filter}
          >
            <span>{filter.toUpperCase()}</span>
            <sup>{tagCounts[filter]}</sup>
          </button>
        ))}
      </div>

      {visibleProjects.length ? (
        <div className="projects-grid-page">
          {visibleProjects.map((project) => (
            <Link href={`${basePath}/${project.slug}`} className="project-card project-card--grid" key={project.slug}>
              {canUseNextImage(project.cardImage.src) ? (
                <Image
                  className="project-thumb"
                  src={project.cardImage.src}
                  alt={project.cardImage.alt}
                  width={1200}
                  height={828}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  draggable={false}
                />
              ) : (
                <img
                  className="project-thumb"
                  src={project.cardImage.src}
                  alt={project.cardImage.alt}
                  draggable={false}
                />
              )}
              <p className="project-meta">{getProjectMeta(project)}</p>
              <h2 className="project-name">{project.title.toUpperCase()}</h2>
            </Link>
          ))}
        </div>
      ) : (
        <p className="project-empty">No published projects found.</p>
      )}
    </>
  );
}
