export const projectTags = ['Biomaterials', 'CMF', 'Social Impact', 'Fashion', 'Systems Design'] as const;

export type ProjectTag = (typeof projectTags)[number];

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

export type ProjectMediaBlock =
  | ({ type: 'video' } & ProjectVideo)
  | ({ type: 'image' } & ProjectImage)
  | {
      type: 'gallery';
      title?: string;
      layout?: 'grid' | 'masonry' | 'strip';
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
  tags: ProjectTag[];
  disciplines: string[];
  cardImage: ProjectImage;
  featuredOnHome: boolean;
  sortOrder: number;
  detail: ProjectDetail;
};

const placeholderImages = {
  biomaterial: {
    src: '/images/projects/project-01.svg',
    alt: 'Biomaterial samples arranged on a neutral surface',
  },
  blueBottle: {
    src: '/images/projects/project-02.svg',
    alt: 'Blue sculptural perfume bottle floating over water',
  },
  materialAtlas: {
    src: '/images/projects/project-03.svg',
    alt: 'Material field study with green forms and research panels',
  },
  circularLab: {
    src: '/images/projects/project-04.svg',
    alt: 'Circular craft system diagram with warm color forms',
  },
  bioInterface: {
    src: '/images/projects/project-05.svg',
    alt: 'Blue interface study with circular forms and wave lines',
  },
  systemsNotes: {
    src: '/images/projects/project-06.svg',
    alt: 'Systems field notes diagram with nodes and connecting lines',
  },
} satisfies Record<string, ProjectImage>;

export const projects: Project[] = [
  {
    slug: 'pseudocorium',
    title: 'PSUDOCORIUM',
    tags: ['Biomaterials', 'Systems Design'],
    disciplines: ['Material Development', 'Biodesign', 'Systems Design'],
    cardImage: placeholderImages.biomaterial,
    featuredOnHome: true,
    sortOrder: 1,
    detail: {
      client: 'Independent Research',
      year: '2024',
      categories: ['Material Innovation', 'Biodesign', 'Systems Design'],
      headline: 'Developing a biomaterial language through flexible samples, pigment, and surface behavior.',
      summary: [
        'Pseudocorium explores biomaterial development through hands-on experiments with texture, color, opacity, and flexible material behavior.',
        'The project frames material research as a design system, connecting speculative making with practical applications for future textiles and product surfaces.',
      ],
      heroImage: placeholderImages.biomaterial,
      buzz: ['Research-led material study for future-facing product and textile applications.'],
      credits: ['Research, material development, and visual direction by Vasavi Sridhar'],
      media: [
        {
          type: 'image',
          ...placeholderImages.biomaterial,
          aspect: 'wide',
          caption: 'Material swatches and pigment studies.',
        },
        {
          type: 'gallery',
          title: 'Material tests',
          layout: 'grid',
          items: [
            { ...placeholderImages.biomaterial, aspect: 'square' },
            { ...placeholderImages.materialAtlas, aspect: 'square' },
            { ...placeholderImages.circularLab, aspect: 'square' },
          ],
        },
      ],
    },
  },
  {
    slug: '11-bleu',
    title: '11 BLEU',
    tags: ['CMF', 'Fashion', 'Systems Design'],
    disciplines: ['Material Development', 'Biodesign', 'Systems Design'],
    cardImage: placeholderImages.blueBottle,
    featuredOnHome: true,
    sortOrder: 2,
    detail: {
      client: 'Concept Fragrance Study',
      year: '2024',
      categories: ['Product Design', 'CMF', 'Creative Direction'],
      headline: 'A perfume object imagined through form, color, material finish, and sensory storytelling.',
      summary: [
        'The project envisions a creative direction of what a perfume would look like if an avant-garde brand like Iris Van Herpen were to explore the possibilities. The scent bottle, its design and packaging were overseen.',
        'All the senses come together for an exuberant experience in “11 bleu” with vivid exploration of form, texture material, and colors in a dynamic interplay.',
        'Inspired by the form of a Klein bottle, the object encloses expansion with its boundaryless form, capturing scent and senses.',
      ],
      heroImage: placeholderImages.blueBottle,
      links: [
        {
          label: 'Project website',
          href: '/projects/11-bleu',
        },
      ],
      buzz: [
        'Featured on Forbes, Associated Press, CBS, NBC, New York Post, The Guardian, Vogue, and more',
      ],
      credits: ['Field: Packaging Design + Color Material Finish + Creative Direction'],
      media: [
        {
          type: 'video',
          provider: 'youtube',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          poster: placeholderImages.blueBottle.src,
          title: '11 BLEU concept film',
        },
        {
          type: 'image',
          ...placeholderImages.blueBottle,
          aspect: 'wide',
          caption: 'Hero object study.',
        },
        {
          type: 'gallery',
          title: 'Object and package system',
          layout: 'grid',
          items: [
            { ...placeholderImages.blueBottle, aspect: 'wide' },
            { ...placeholderImages.bioInterface, aspect: 'square' },
            { ...placeholderImages.circularLab, aspect: 'square' },
            { ...placeholderImages.systemsNotes, aspect: 'square' },
          ],
        },
        {
          type: 'gallery',
          title: 'Detail studies',
          layout: 'strip',
          items: [
            { ...placeholderImages.circularLab, aspect: 'portrait' },
            { ...placeholderImages.blueBottle, aspect: 'portrait' },
            { ...placeholderImages.systemsNotes, aspect: 'portrait' },
            { ...placeholderImages.bioInterface, aspect: 'portrait' },
          ],
        },
      ],
    },
  },
  {
    slug: 'living-material-atlas',
    title: 'LIVING MATERIAL ATLAS',
    tags: ['Biomaterials', 'Social Impact', 'Systems Design'],
    disciplines: ['Material Development', 'Biodesign', 'Systems Design'],
    cardImage: placeholderImages.materialAtlas,
    featuredOnHome: true,
    sortOrder: 3,
    detail: {
      client: 'Research Archive',
      year: '2023',
      categories: ['Research Systems', 'Material Mapping', 'Visual Storytelling'],
      headline: 'A visual atlas for comparing biological, textile, and field research.',
      summary: [
        'Living Material Atlas organizes biological, textile, and field research into a visual system for comparing emerging materials.',
        'The archive supports decisions around application, sustainability, craft behavior, and future material scenarios.',
      ],
      heroImage: placeholderImages.materialAtlas,
      buzz: ['A visual research framework for emerging material practice.'],
      credits: ['Research and systems design by Vasavi Sridhar'],
      media: [
        {
          type: 'image',
          ...placeholderImages.materialAtlas,
          aspect: 'wide',
        },
        {
          type: 'text',
          eyebrow: 'Framework',
          title: 'Material signals',
          body: [
            'The atlas treats each material as a set of signals: source, behavior, lifecycle, craft potential, and visual language.',
          ],
        },
      ],
    },
  },
  {
    slug: 'circular-craft-lab',
    title: 'CIRCULAR CRAFT LAB',
    tags: ['Social Impact', 'Fashion', 'Systems Design'],
    disciplines: ['Material Development', 'Biodesign', 'Systems Design'],
    cardImage: placeholderImages.circularLab,
    featuredOnHome: true,
    sortOrder: 4,
    detail: {
      client: 'Workshop Prototype',
      year: '2023',
      categories: ['Circular Design', 'Workshop Strategy', 'Material Systems'],
      headline: 'Turning craft practice into a repeatable system for material reuse and collaborative making.',
      summary: [
        'Circular Craft Lab studies how craft processes can become repeatable systems for material reuse, education, and collaborative making.',
        'The work connects physical workshops with design strategy, translating circularity into tactile and accessible formats.',
      ],
      heroImage: placeholderImages.circularLab,
      buzz: ['A systems-led craft research project.'],
      credits: ['Concept, facilitation, and design system by Vasavi Sridhar'],
      media: [
        {
          type: 'video',
          provider: 'file',
          url: '',
          poster: placeholderImages.circularLab.src,
          title: 'Circular Craft Lab process film',
        },
        {
          type: 'gallery',
          title: 'Workshop system',
          layout: 'masonry',
          items: [
            { ...placeholderImages.circularLab, aspect: 'wide' },
            { ...placeholderImages.biomaterial, aspect: 'square' },
            { ...placeholderImages.systemsNotes, aspect: 'portrait' },
          ],
        },
      ],
    },
  },
  {
    slug: 'bio-interface-study',
    title: 'BIO INTERFACE STUDY',
    tags: ['Biomaterials', 'CMF'],
    disciplines: ['Material Development', 'Biodesign', 'Systems Design'],
    cardImage: placeholderImages.bioInterface,
    featuredOnHome: false,
    sortOrder: 5,
    detail: {
      client: 'Speculative Interface Study',
      year: '2022',
      categories: ['Interaction Study', 'Speculative Systems', 'Visual Research'],
      headline: 'A speculative interface study for communicating biological data and sensory feedback.',
      summary: [
        'Bio Interface Study examines how speculative interfaces can communicate biological data, sensory feedback, and material transformation.',
        'The project uses visual systems to connect complex technical behavior with emotionally legible design cues.',
      ],
      heroImage: placeholderImages.bioInterface,
      buzz: ['A speculative interface exploration for biological systems.'],
      credits: ['Interaction concept and visual research by Vasavi Sridhar'],
      media: [
        {
          type: 'image',
          ...placeholderImages.bioInterface,
          aspect: 'wide',
        },
      ],
    },
  },
  {
    slug: 'systems-field-notes',
    title: 'SYSTEMS FIELD NOTES',
    tags: ['Social Impact', 'Systems Design'],
    disciplines: ['Material Development', 'Biodesign', 'Systems Design'],
    cardImage: placeholderImages.systemsNotes,
    featuredOnHome: false,
    sortOrder: 6,
    detail: {
      client: 'Field Research',
      year: '2022',
      categories: ['Fieldwork', 'Mapping', 'Systems Research'],
      headline: 'Mapping relationships between people, materials, places, and decisions.',
      summary: [
        'Systems Field Notes translates field observations into maps, diagrams, and design prompts for future-facing research.',
        'The project documents relationships between people, materials, places, and decisions to support clearer systems thinking.',
      ],
      heroImage: placeholderImages.systemsNotes,
      buzz: ['Field research notes developed into a visual decision system.'],
      credits: ['Fieldwork, mapping, and visual synthesis by Vasavi Sridhar'],
      media: [],
    },
  },
];

export const sortedProjects = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

export function getFeaturedProjects(limit = 4) {
  return sortedProjects.filter((project) => project.featuredOnHome).slice(0, limit);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMeta(project: Project) {
  return project.disciplines.join(' | ');
}
