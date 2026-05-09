'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getProjectMeta, projectTags, sortedProjects, type ProjectTag } from '@/app/data/projects';

type FilterValue = 'All' | ProjectTag;

const allFilter: FilterValue = 'All';
const filters: FilterValue[] = [allFilter, ...projectTags];

function isProjectTag(filter: FilterValue): filter is ProjectTag {
  return filter !== allFilter;
}

export function ProjectsIndexClient() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(allFilter);

  const tagCounts = useMemo(() => {
    return filters.reduce<Record<FilterValue, number>>((counts, filter) => {
      counts[filter] = isProjectTag(filter)
        ? sortedProjects.filter((project) => project.tags.includes(filter)).length
        : sortedProjects.length;
      return counts;
    }, {} as Record<FilterValue, number>);
  }, []);

  const visibleProjects = useMemo(() => {
    if (!isProjectTag(activeFilter)) return sortedProjects;
    return sortedProjects.filter((project) => project.tags.includes(activeFilter));
  }, [activeFilter]);

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

      <div className="projects-grid-page">
        {visibleProjects.map((project) => (
          <Link href={`/projects/${project.slug}`} className="project-card project-card--grid" key={project.slug}>
            <img className="project-thumb" src={project.cardImage.src} alt={project.cardImage.alt} draggable={false} />
            <p className="project-meta">{getProjectMeta(project)}</p>
            <h2 className="project-name">{project.title}</h2>
          </Link>
        ))}
      </div>
    </>
  );
}
