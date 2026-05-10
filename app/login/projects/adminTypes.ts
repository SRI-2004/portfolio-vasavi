import type { ProjectDetail, ProjectImage, ProjectTag } from '@/app/data/projects';

export type AdminProjectStatus = 'draft' | 'published';

export type AdminProjectRow = {
  slug: string;
  title: string;
  tags: ProjectTag[] | string[] | null;
  disciplines: string[] | null;
  card_image: ProjectImage | null;
  featured_on_home: boolean | null;
  sort_order: number | null;
  status: AdminProjectStatus;
  detail: ProjectDetail | null;
  updated_at: string | null;
};

export const adminProjectSelect =
  'slug,title,status,featured_on_home,sort_order,updated_at,tags,disciplines,card_image,detail';
