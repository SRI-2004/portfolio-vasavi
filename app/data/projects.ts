export const projectTags = ['Biomaterials', 'CMF', 'Social Impact', 'Fashion', 'Systems Design'] as const;

export type ProjectTag = (typeof projectTags)[number];

export type ProjectSection = 'projects' | 'research' | 'play';

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
  aspect?: 'wide' | 'square' | 'portrait';
};

export type ProjectVideo = {
  provider: 'youtube' | 'vimeo' | 'file';
  url: string;
  poster?: string;
  title?: string;
};

export type ProjectPdf = {
  src: string;
  name?: string;
};

export type ProjectMediaBlock =
  | ({ type: 'video' } & ProjectVideo)
  | ({ type: 'image' } & ProjectImage)
  | {
      type: 'gallery';
      title?: string;
      caption?: string;
      layout?: 'grid' | 'masonry' | 'strip' | 'collage' | 'scrapbook';
      pdf?: ProjectPdf;
      items: ProjectImage[];
    }
  | {
      type: 'text';
      eyebrow?: string;
      title?: string;
      body: string[];
    };

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectDetail = {
  projectType?: 'normal' | 'scrapbook';
  headline: string;
  summary: string[];
  media: ProjectMediaBlock[];
  client?: string;
  year?: string;
  categories?: string[];
  heroImage?: ProjectImage;
  links?: ProjectLink[];
  credits?: string[];
  buzz?: string[];
};

export type Project = {
  slug: string;
  title: string;
  section: ProjectSection;
  tags: ProjectTag[];
  disciplines: string[];
  cardImage: ProjectImage;
  featuredOnHome: boolean;
  sortOrder: number;
  detail: ProjectDetail;
};

export function getProjectMeta(project: Project) {
  return project.disciplines.join(' | ');
}
