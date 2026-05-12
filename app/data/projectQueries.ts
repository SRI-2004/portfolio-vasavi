import 'server-only';

import { createSupabaseServerClient } from '@/app/lib/supabase/server';
import { projectTags, type Project, type ProjectDetail, type ProjectImage, type ProjectTag } from '@/app/data/projects';

type ProjectRow = {
  slug: string;
  title: string;
  tags: string[] | null;
  disciplines: string[] | null;
  card_image: ProjectImage | null;
  featured_on_home: boolean | null;
  sort_order: number | null;
  detail?: ProjectDetail | null;
};

function isProjectTag(value: string): value is ProjectTag {
  return (projectTags as readonly string[]).includes(value);
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeTags(value: unknown): ProjectTag[] {
  return normalizeStringArray(value).filter(isProjectTag);
}

function normalizeImage(value: unknown, fallbackTitle: string): ProjectImage {
  if (value && typeof value === 'object' && 'src' in value && typeof value.src === 'string') {
    return {
      src: value.src,
      alt: 'alt' in value && typeof value.alt === 'string' ? value.alt : fallbackTitle,
      caption: 'caption' in value && typeof value.caption === 'string' ? value.caption : undefined,
      aspect:
        'aspect' in value && ['wide', 'square', 'portrait'].includes(String(value.aspect))
          ? (value.aspect as ProjectImage['aspect'])
          : undefined,
    };
  }

  return {
    src: '/images/projects/project-01.svg',
    alt: fallbackTitle,
  };
}

function normalizeDetail(value: unknown, row: ProjectRow): ProjectDetail {
  const raw = value && typeof value === 'object' ? value : {};
  const headline = 'headline' in raw && typeof raw.headline === 'string' ? raw.headline : row.title;
  const summary = 'summary' in raw ? normalizeStringArray(raw.summary) : [];

  return {
    projectType: raw && 'projectType' in raw && raw.projectType === 'scrapbook' ? 'scrapbook' : 'normal',
    headline,
    summary,
    media: 'media' in raw && Array.isArray(raw.media) ? (raw.media as ProjectDetail['media']) : [],
    client: 'client' in raw && typeof raw.client === 'string' ? raw.client : undefined,
    year: 'year' in raw && typeof raw.year === 'string' ? raw.year : undefined,
    categories: 'categories' in raw ? normalizeStringArray(raw.categories) : undefined,
    heroImage: 'heroImage' in raw ? normalizeImage(raw.heroImage, row.title) : undefined,
    links: 'links' in raw && Array.isArray(raw.links) ? (raw.links as ProjectDetail['links']) : undefined,
    credits: 'credits' in raw ? normalizeStringArray(raw.credits) : undefined,
    buzz: 'buzz' in raw ? normalizeStringArray(raw.buzz) : undefined,
  };
}

function mapProjectRow(row: ProjectRow, includeDetail = true): Project {
  return {
    slug: row.slug,
    title: row.title,
    tags: normalizeTags(row.tags),
    disciplines: normalizeStringArray(row.disciplines),
    cardImage: normalizeImage(row.card_image, row.title),
    featuredOnHome: Boolean(row.featured_on_home),
    sortOrder: row.sort_order ?? 100,
    detail: includeDetail
      ? normalizeDetail(row.detail, row)
      : {
          headline: row.title,
          summary: [],
          media: [],
        },
  };
}

export async function getPublishedProjects() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('slug,title,tags,disciplines,card_image,featured_on_home,sort_order')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return (data as ProjectRow[]).map((row) => mapProjectRow(row, false));
}

export async function getProjects() {
  return getPublishedProjects();
}

export async function getFeaturedProjects(limit = 4) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('slug,title,disciplines,card_image,featured_on_home,sort_order')
    .eq('status', 'published')
    .eq('featured_on_home', true)
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProjectRow[]).map((row) => mapProjectRow(row, false));
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from('projects')
    .select('slug,title,tags,disciplines,card_image,featured_on_home,sort_order,detail')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return undefined;
  return mapProjectRow(data as ProjectRow);
}
