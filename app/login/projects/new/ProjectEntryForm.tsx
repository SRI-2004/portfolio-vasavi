'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/browser';
import { projectTags, type ProjectImage, type ProjectMediaBlock, type ProjectTag } from '@/app/data/projects';
import type { AdminProjectRow, AdminProjectStatus } from '@/app/login/projects/adminTypes';

type Status = AdminProjectStatus;
type FormMode = 'create' | 'edit';
type FormState =
  | 'checking'
  | 'ready'
  | 'submitting'
  | 'success'
  | 'error'
  | 'unauthenticated'
  | 'unauthorized'
  | 'missing-config';
type Aspect = NonNullable<ProjectImage['aspect']>;
type MediaType = ProjectMediaBlock['type'];
type VideoProvider = 'youtube' | 'vimeo' | 'file';
type GalleryLayout = 'grid' | 'masonry' | 'strip' | 'collage' | 'scrapbook';
type ImageSourceMode = 'url' | 'upload';
type PdfSourceMode = 'url' | 'upload';

type ImageForm = {
  src: string;
  alt: string;
  caption: string;
  aspect: Aspect;
  sourceMode: ImageSourceMode;
};

type LinkForm = {
  label: string;
  href: string;
};

type PdfForm = {
  src: string;
  name: string;
  sourceMode: PdfSourceMode;
};

type MediaForm =
  | {
      type: 'video';
      provider: VideoProvider;
      url: string;
      poster: string;
      title: string;
    }
  | ({
      type: 'image';
    } & ImageForm)
  | {
      type: 'gallery';
      title: string;
      caption: string;
      layout: GalleryLayout;
      pdf: PdfForm;
      items: ImageForm[];
    }
  | {
      type: 'text';
      eyebrow: string;
      title: string;
      body: string[];
    };

const emptyImage: ImageForm = {
  src: '',
  alt: '',
  caption: '',
  aspect: 'wide',
  sourceMode: 'url',
};

const maxImageUploadBytes = 10 * 1024 * 1024;
const maxPdfUploadBytes = 20 * 1024 * 1024;

const emptyPdf: PdfForm = {
  src: '',
  name: '',
  sourceMode: 'url',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function compactStrings(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function repeatableStrings(values?: string[] | null) {
  const compacted = compactStrings(values ?? []);
  return compacted.length ? compacted : [''];
}

function toImageForm(image?: ProjectImage | null): ImageForm {
  return {
    src: image?.src ?? '',
    alt: image?.alt ?? '',
    caption: image?.caption ?? '',
    aspect: image?.aspect ?? 'wide',
    sourceMode: image?.src?.startsWith('data:image/') ? 'upload' : 'url',
  };
}

function toImagePayload(image: ImageForm): ProjectImage {
  return {
    src: image.src.trim(),
    alt: image.alt.trim(),
    caption: image.caption.trim() || undefined,
    aspect: image.aspect,
  };
}

function toMediaForm(block: ProjectMediaBlock): MediaForm {
  if (block.type === 'video') {
    return {
      type: 'video',
      provider: block.provider,
      url: block.url,
      poster: block.poster ?? '',
      title: block.title ?? '',
    };
  }

  if (block.type === 'image') {
    return {
      type: 'image',
      ...toImageForm(block),
    };
  }

  if (block.type === 'gallery') {
    return {
      type: 'gallery',
      title: block.title ?? '',
      caption: block.caption ?? '',
      layout: block.layout ?? 'grid',
      pdf: {
        src: block.pdf?.src ?? '',
        name: block.pdf?.name ?? '',
        sourceMode: block.pdf?.src?.startsWith('data:application/pdf') ? 'upload' : 'url',
      },
      items: block.items?.length ? block.items.map(toImageForm) : [{ ...emptyImage }],
    };
  }

  return {
    type: 'text',
    eyebrow: block.eyebrow ?? '',
    title: block.title ?? '',
    body: repeatableStrings(block.body),
  };
}

function isProjectTag(value: string): value is ProjectTag {
  return (projectTags as readonly string[]).includes(value);
}

function normalizeTags(values?: string[] | null): ProjectTag[] {
  return (values ?? []).filter(isProjectTag);
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file.'));
      return;
    }

    if (file.size > maxImageUploadBytes) {
      reject(new Error('Please keep uploaded images under 10 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function readPdfFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (file.type !== 'application/pdf') {
      reject(new Error('Please upload a PDF file.'));
      return;
    }

    if (file.size > maxPdfUploadBytes) {
      reject(new Error('Please keep uploaded PDFs under 20 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected PDF.'));
    reader.readAsDataURL(file);
  });
}

function toMediaPayload(block: MediaForm): ProjectMediaBlock {
  if (block.type === 'video') {
    return {
      type: 'video',
      provider: block.provider,
      url: block.url.trim(),
      poster: block.poster.trim() || undefined,
      title: block.title.trim() || undefined,
    };
  }

  if (block.type === 'image') {
    return {
      type: 'image',
      ...toImagePayload(block),
    };
  }

  if (block.type === 'gallery') {
    return {
      type: 'gallery',
      title: block.title.trim() || undefined,
      caption: block.caption.trim() || undefined,
      layout: block.layout,
      pdf: block.pdf.src.trim()
        ? {
            src: block.pdf.src.trim(),
            name: block.pdf.name.trim() || undefined,
          }
        : undefined,
      items: block.items.map(toImagePayload),
    };
  }

  return {
    type: 'text',
    eyebrow: block.eyebrow.trim() || undefined,
    title: block.title.trim() || undefined,
    body: compactStrings(block.body),
  };
}

function newMediaBlock(type: MediaType): MediaForm {
  if (type === 'video') {
    return { type, provider: 'youtube', url: '', poster: '', title: '' };
  }

  if (type === 'image') {
    return { type, ...emptyImage };
  }

  if (type === 'gallery') {
    return { type, title: '', caption: '', layout: 'grid', pdf: { ...emptyPdf }, items: [{ ...emptyImage }] };
  }

  return { type, eyebrow: '', title: '', body: [''] };
}

export function ProjectEntryForm({
  mode = 'create',
  initialProject,
  originalSlug,
}: {
  mode?: FormMode;
  initialProject?: AdminProjectRow;
  originalSlug?: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const initialDetail = initialProject?.detail;
  const [state, setState] = useState<FormState>('checking');
  const [message, setMessage] = useState('');
  const [targetSlug, setTargetSlug] = useState(originalSlug ?? initialProject?.slug ?? '');
  const [title, setTitle] = useState(initialProject?.title ?? '');
  const [slug, setSlug] = useState(initialProject?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProject?.slug));
  const [status, setStatus] = useState<Status>(initialProject?.status ?? 'draft');
  const [featuredOnHome, setFeaturedOnHome] = useState(Boolean(initialProject?.featured_on_home));
  const [sortOrder, setSortOrder] = useState(initialProject?.sort_order ?? 100);
  const [tags, setTags] = useState<ProjectTag[]>(normalizeTags(initialProject?.tags));
  const [disciplines, setDisciplines] = useState<string[]>(repeatableStrings(initialProject?.disciplines));
  const [cardImage, setCardImage] = useState<ImageForm>(toImageForm(initialProject?.card_image));
  const [client, setClient] = useState(initialDetail?.client ?? '');
  const [year, setYear] = useState(initialDetail?.year ?? '');
  const [categories, setCategories] = useState<string[]>(repeatableStrings(initialDetail?.categories));
  const [headline, setHeadline] = useState(initialDetail?.headline ?? '');
  const [summary, setSummary] = useState<string[]>(repeatableStrings(initialDetail?.summary));
  const [heroImage, setHeroImage] = useState<ImageForm>(toImageForm(initialDetail?.heroImage));
  const [useHeroImage, setUseHeroImage] = useState(Boolean(initialDetail?.heroImage?.src));
  const [buzz, setBuzz] = useState<string[]>(repeatableStrings(initialDetail?.buzz));
  const [credits, setCredits] = useState<string[]>(repeatableStrings(initialDetail?.credits));
  const [links, setLinks] = useState<LinkForm[]>(
    initialDetail?.links?.length ? initialDetail.links.map((link) => ({ label: link.label, href: link.href })) : [{ label: '', href: '' }],
  );
  const [mediaBlocks, setMediaBlocks] = useState<MediaForm[]>(
    initialDetail?.media?.length ? initialDetail.media.map(toMediaForm) : [],
  );

  useEffect(() => {
    if (!supabase) {
      setState('missing-config');
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState('unauthenticated');
        return;
      }

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      setState(!error && adminUser ? 'ready' : 'unauthorized');
    });
  }, [supabase]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [slugTouched, title]);

  const canSubmit = useMemo(() => state === 'ready' || state === 'error' || state === 'success', [state]);

  function validate() {
    const errors: string[] = [];
    const cleanSlug = slug.trim();
    const cleanDisciplines = compactStrings(disciplines);
    const cleanSummary = compactStrings(summary);

    if (!title.trim()) errors.push('Title is required.');
    if (!cleanSlug) errors.push('Slug is required.');
    if (cleanSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      errors.push('Slug must use lowercase letters, numbers, and hyphens only.');
    }
    if (!cleanDisciplines.length) errors.push('At least one discipline is required.');
    if (!cardImage.src.trim()) errors.push('Card image source is required.');
    if (!cardImage.alt.trim()) errors.push('Card image alt text is required.');
    if (!headline.trim()) errors.push('Headline is required.');
    if (!cleanSummary.length) errors.push('At least one summary paragraph is required.');
    if (useHeroImage && heroImage.src.trim() && !heroImage.alt.trim()) errors.push('Hero image alt text is required.');

    mediaBlocks.forEach((block, index) => {
      const label = `Media block ${index + 1}`;
      if (block.type === 'video' && !block.url.trim()) errors.push(`${label}: video URL is required.`);
      if (block.type === 'image') {
        if (!block.src.trim()) errors.push(`${label}: image source is required.`);
        if (!block.alt.trim()) errors.push(`${label}: image alt text is required.`);
      }
      if (block.type === 'gallery') {
        if (!block.items.length) errors.push(`${label}: gallery needs at least one image.`);
        block.items.forEach((item, itemIndex) => {
          if (!item.src.trim()) errors.push(`${label}, image ${itemIndex + 1}: image source is required.`);
          if (!item.alt.trim()) errors.push(`${label}, image ${itemIndex + 1}: alt text is required.`);
        });
      }
      if (block.type === 'text' && !compactStrings(block.body).length) {
        errors.push(`${label}: text block needs at least one paragraph.`);
      }
    });

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState('missing-config');
      return;
    }

    const errors = validate();
    if (errors.length) {
      setState('error');
      setMessage(errors.join(' '));
      return;
    }

    setState('submitting');
    setMessage('');

    const detail = {
      headline: headline.trim(),
      summary: compactStrings(summary),
      media: mediaBlocks.map(toMediaPayload),
      client: client.trim() || undefined,
      year: year.trim() || undefined,
      categories: compactStrings(categories),
      heroImage: useHeroImage && heroImage.src.trim() ? toImagePayload(heroImage) : undefined,
      links: links
        .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
        .filter((link) => link.label && link.href),
      credits: compactStrings(credits),
      buzz: compactStrings(buzz),
    };

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      tags,
      disciplines: compactStrings(disciplines),
      card_image: toImagePayload(cardImage),
      featured_on_home: featuredOnHome,
      sort_order: sortOrder,
      status,
      detail,
    };

    const { error } =
      mode === 'edit'
        ? await supabase.from('projects').update(payload).eq('slug', targetSlug || slug.trim())
        : await supabase.from('projects').insert(payload);

    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }

    setState('success');
    setTargetSlug(slug.trim());
    setMessage(`Project "${title.trim()}" was ${mode === 'edit' ? 'updated' : 'created'} as ${status}.`);
  }

  if (state === 'checking') {
    return <p className="admin-status">Checking session...</p>;
  }

  if (state === 'missing-config') {
    return <p className="admin-status">Supabase environment variables are not configured.</p>;
  }

  if (state === 'unauthenticated') {
    return <p className="admin-status">You must log in before managing projects.</p>;
  }

  if (state === 'unauthorized') {
    return <p className="admin-status">Your account is not listed in admin_users.</p>;
  }

  return (
    <form className="admin-project-form" onSubmit={handleSubmit}>
      <header className="admin-form-header">
        <div>
          <p>Admin</p>
          <h1>{mode === 'edit' ? 'Edit project' : 'Create project'}</h1>
        </div>
        <button type="submit" disabled={!canSubmit || state === 'submitting'}>
          {state === 'submitting' ? 'Saving...' : mode === 'edit' ? 'Update project' : 'Save project'}
        </button>
      </header>

      <nav className="admin-toolbar" aria-label="Admin project navigation">
        <Link href="/login/projects">Projects</Link>
        <Link href="/login/projects/new">Create project</Link>
      </nav>

      {message ? <p className="admin-message" data-state={state}>{message}</p> : null}

      <fieldset className="admin-fieldset">
        <legend>Basics</legend>
        <label>
          Title *
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Slug *
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            required
          />
        </label>
        <div className="admin-grid admin-grid--compact">
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as Status)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            Sort order
            <input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={featuredOnHome}
              onChange={(event) => setFeaturedOnHome(event.target.checked)}
            />
            Featured on home
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Classification</legend>
        <div className="admin-check-list">
          {projectTags.map((tag) => (
            <label className="admin-check" key={tag}>
              <input
                type="checkbox"
                checked={tags.includes(tag)}
                onChange={(event) => {
                  setTags((current) =>
                    event.target.checked ? [...current, tag] : current.filter((currentTag) => currentTag !== tag),
                  );
                }}
              />
              {tag}
            </label>
          ))}
        </div>
        <RepeatableText label="Disciplines *" values={disciplines} onChange={setDisciplines} />
      </fieldset>

      <ImageFields title="Card image *" image={cardImage} onChange={setCardImage} requireSrc requireAlt />

      <fieldset className="admin-fieldset">
        <legend>Detail intro</legend>
        <div className="admin-grid admin-grid--compact">
          <label>
            Client
            <input value={client} onChange={(event) => setClient(event.target.value)} />
          </label>
          <label>
            Year
            <input value={year} onChange={(event) => setYear(event.target.value)} />
          </label>
        </div>
        <RepeatableText label="Categories" values={categories} onChange={setCategories} />
        <label>
          Headline *
          <textarea value={headline} onChange={(event) => setHeadline(event.target.value)} required />
        </label>
        <RepeatableText label="Summary paragraphs *" values={summary} onChange={setSummary} multiline />
        <label className="admin-check">
          <input type="checkbox" checked={useHeroImage} onChange={(event) => setUseHeroImage(event.target.checked)} />
          Add hero image override
        </label>
        {useHeroImage ? <ImageFields title="Hero image" image={heroImage} onChange={setHeroImage} /> : null}
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Sidebar extras</legend>
        <RepeatableText label="Buzz" values={buzz} onChange={setBuzz} multiline />
        <RepeatableText label="Credits" values={credits} onChange={setCredits} multiline />
        <div className="admin-repeatable">
          <div className="admin-repeatable__header">
            <h3>Links</h3>
            <button type="button" onClick={() => setLinks((current) => [...current, { label: '', href: '' }])}>
              Add link
            </button>
          </div>
          {links.map((link, index) => (
            <div className="admin-row" key={index}>
              <input
                placeholder="Label"
                value={link.label}
                onChange={(event) => updateItem(links, setLinks, index, { ...link, label: event.target.value })}
              />
              <input
                placeholder="URL"
                value={link.href}
                onChange={(event) => updateItem(links, setLinks, index, { ...link, href: event.target.value })}
              />
              <button type="button" onClick={() => removeItem(links, setLinks, index, { label: '', href: '' })}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Media blocks</legend>
        <div className="admin-media-actions">
          {(['video', 'image', 'gallery', 'text'] as MediaType[]).map((type) => (
            <button type="button" key={type} onClick={() => setMediaBlocks((current) => [...current, newMediaBlock(type)])}>
              Add {type}
            </button>
          ))}
        </div>
        <div className="admin-media-list">
          {mediaBlocks.map((block, index) => (
            <MediaBlockEditor
              block={block}
              index={index}
              key={index}
              onChange={(nextBlock) => updateItem(mediaBlocks, setMediaBlocks, index, nextBlock)}
              onRemove={() => setMediaBlocks((current) => current.filter((_, currentIndex) => currentIndex !== index))}
              onMoveUp={() => moveItem(mediaBlocks, setMediaBlocks, index, -1)}
              onMoveDown={() => moveItem(mediaBlocks, setMediaBlocks, index, 1)}
            />
          ))}
        </div>
      </fieldset>
    </form>
  );
}

function RepeatableText({
  label,
  values,
  onChange,
  multiline = false,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  multiline?: boolean;
}) {
  return (
    <div className="admin-repeatable">
      <div className="admin-repeatable__header">
        <h3>{label}</h3>
        <button type="button" onClick={() => onChange([...values, ''])}>
          Add
        </button>
      </div>
      {values.map((value, index) => (
        <div className="admin-row" key={index}>
          {multiline ? (
            <textarea
              value={value}
              onChange={(event) => updateItem(values, onChange, index, event.target.value)}
            />
          ) : (
            <input value={value} onChange={(event) => updateItem(values, onChange, index, event.target.value)} />
          )}
          <button type="button" onClick={() => removeItem(values, onChange, index, '')}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function ImageFields({
  title,
  image,
  onChange,
  requireSrc = false,
  requireAlt = false,
}: {
  title: string;
  image: ImageForm;
  onChange: (image: ImageForm) => void;
  requireSrc?: boolean;
  requireAlt?: boolean;
}) {
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const src = await readImageFile(file);
      onChange({
        ...image,
        src,
        sourceMode: 'upload',
        alt: image.alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that image.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <fieldset className="admin-fieldset">
      <legend>{title}</legend>
      <div className="admin-source-toggle" role="group" aria-label={`${title} source`}>
        <label className="admin-check">
          <input
            type="radio"
            checked={image.sourceMode === 'url'}
            onChange={() => onChange({ ...image, sourceMode: 'url' })}
          />
          URL
        </label>
        <label className="admin-check">
          <input
            type="radio"
            checked={image.sourceMode === 'upload'}
            onChange={() => onChange({ ...image, sourceMode: 'upload' })}
          />
          Upload
        </label>
      </div>
      <label>
        Image source {requireSrc ? '*' : ''}
        {image.sourceMode === 'upload' ? (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        ) : (
          <input value={image.src} onChange={(event) => onChange({ ...image, src: event.target.value })} required={requireSrc} />
        )}
      </label>
      {image.src ? (
        <figure className="admin-image-preview">
          <img src={image.src} alt="" />
          <figcaption>{image.sourceMode === 'upload' ? 'Base64 upload stored in project JSON' : 'URL preview'}</figcaption>
        </figure>
      ) : null}
      <label>
        Alt text {requireAlt ? '*' : ''}
        <input value={image.alt} onChange={(event) => onChange({ ...image, alt: event.target.value })} required={requireAlt} />
      </label>
      <label>
        Caption
        <input value={image.caption} onChange={(event) => onChange({ ...image, caption: event.target.value })} />
      </label>
      <label>
        Aspect
        <select value={image.aspect} onChange={(event) => onChange({ ...image, aspect: event.target.value as Aspect })}>
          <option value="wide">Wide</option>
          <option value="square">Square</option>
          <option value="portrait">Portrait</option>
        </select>
      </label>
    </fieldset>
  );
}

function MediaBlockEditor({
  block,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: MediaForm;
  index: number;
  onChange: (block: MediaForm) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  async function handlePosterUpload(event: ChangeEvent<HTMLInputElement>) {
    if (block.type !== 'video') return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const poster = await readImageFile(file);
      onChange({ ...block, poster });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that poster image.');
    } finally {
      event.target.value = '';
    }
  }

  async function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    if (block.type !== 'gallery') return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const src = await readPdfFile(file);
      onChange({
        ...block,
        pdf: {
          src,
          name: block.pdf.name || file.name,
          sourceMode: 'upload',
        },
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that PDF.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <section className="admin-media-block">
      <header>
        <h3>{index + 1}. {block.type}</h3>
        <div>
          <button type="button" onClick={onMoveUp}>Up</button>
          <button type="button" onClick={onMoveDown}>Down</button>
          <button type="button" onClick={onRemove}>Remove</button>
        </div>
      </header>

      {block.type === 'video' ? (
        <>
          <label>
            Provider
            <select value={block.provider} onChange={(event) => onChange({ ...block, provider: event.target.value as VideoProvider })}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="file">File</option>
            </select>
          </label>
          <label>
            Video URL
            <input value={block.url} onChange={(event) => onChange({ ...block, url: event.target.value })} />
          </label>
          <label>
            Poster URL or base64
            <input value={block.poster} onChange={(event) => onChange({ ...block, poster: event.target.value })} />
          </label>
          <label>
            Upload poster
            <input type="file" accept="image/*" onChange={handlePosterUpload} />
          </label>
          {block.poster ? (
            <figure className="admin-image-preview">
              <img src={block.poster} alt="" />
              <figcaption>Poster preview</figcaption>
            </figure>
          ) : null}
          <label>
            Title
            <input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
          </label>
        </>
      ) : null}

      {block.type === 'image' ? <ImageInline image={block} onChange={(image) => onChange({ type: 'image', ...image })} /> : null}

      {block.type === 'gallery' ? (
        <>
          <label>
            Gallery title
            <input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
          </label>
          <label>
            Gallery caption
            <input value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
          </label>
          <label>
            Layout
            <select value={block.layout} onChange={(event) => onChange({ ...block, layout: event.target.value as GalleryLayout })}>
              <option value="grid">Grid</option>
              <option value="masonry">Masonry</option>
              <option value="strip">Strip</option>
              <option value="collage">Collage</option>
              <option value="scrapbook">Scrapbook</option>
            </select>
          </label>
          {block.layout === 'scrapbook' ? (
            <div className="admin-nested">
              <div className="admin-repeatable__header">
                <h3>Scrapbook PDF</h3>
              </div>
              <p className="admin-help">
                If a PDF is provided, it will be used as the scrapbook pages. Gallery images are used only when no PDF is provided.
              </p>
              <div className="admin-source-toggle" role="group" aria-label="Scrapbook PDF source">
                <label className="admin-check">
                  <input
                    type="radio"
                    checked={block.pdf.sourceMode === 'url'}
                    onChange={() => onChange({ ...block, pdf: { ...block.pdf, sourceMode: 'url' } })}
                  />
                  URL
                </label>
                <label className="admin-check">
                  <input
                    type="radio"
                    checked={block.pdf.sourceMode === 'upload'}
                    onChange={() => onChange({ ...block, pdf: { ...block.pdf, sourceMode: 'upload' } })}
                  />
                  Upload
                </label>
              </div>
              <label>
                PDF source
                {block.pdf.sourceMode === 'upload' ? (
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
                ) : (
                  <input
                    value={block.pdf.src}
                    onChange={(event) => onChange({ ...block, pdf: { ...block.pdf, src: event.target.value } })}
                  />
                )}
              </label>
              <label>
                PDF name
                <input
                  value={block.pdf.name}
                  onChange={(event) => onChange({ ...block, pdf: { ...block.pdf, name: event.target.value } })}
                />
              </label>
              {block.pdf.src ? (
                <p className="admin-help">
                  PDF selected{block.pdf.name ? `: ${block.pdf.name}` : ''}. Uploaded PDFs are stored in this project entry.
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="admin-repeatable">
            <div className="admin-repeatable__header">
              <h3>Gallery images</h3>
              <button type="button" onClick={() => onChange({ ...block, items: [...block.items, { ...emptyImage }] })}>
                Add image
              </button>
            </div>
            {block.items.map((item, itemIndex) => (
              <div className="admin-nested" key={itemIndex}>
                <ImageInline
                  image={item}
                  onChange={(image) => updateItem(block.items, (items) => onChange({ ...block, items }), itemIndex, image)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(block.items, (items) => onChange({ ...block, items }), itemIndex, { ...emptyImage })}
                >
                  Remove image
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {block.type === 'text' ? (
        <>
          <label>
            Eyebrow
            <input value={block.eyebrow} onChange={(event) => onChange({ ...block, eyebrow: event.target.value })} />
          </label>
          <label>
            Title
            <input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
          </label>
          <RepeatableText label="Body paragraphs" values={block.body} onChange={(body) => onChange({ ...block, body })} multiline />
        </>
      ) : null}
    </section>
  );
}

function ImageInline({ image, onChange }: { image: ImageForm; onChange: (image: ImageForm) => void }) {
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const src = await readImageFile(file);
      onChange({
        ...image,
        src,
        sourceMode: 'upload',
        alt: image.alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that image.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="admin-grid admin-grid--compact">
      <div className="admin-source-toggle" role="group" aria-label="Image source">
        <label className="admin-check">
          <input
            type="radio"
            checked={image.sourceMode === 'url'}
            onChange={() => onChange({ ...image, sourceMode: 'url' })}
          />
          URL
        </label>
        <label className="admin-check">
          <input
            type="radio"
            checked={image.sourceMode === 'upload'}
            onChange={() => onChange({ ...image, sourceMode: 'upload' })}
          />
          Upload
        </label>
      </div>
      <label>
        Image source
        {image.sourceMode === 'upload' ? (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        ) : (
          <input value={image.src} onChange={(event) => onChange({ ...image, src: event.target.value })} />
        )}
      </label>
      {image.src ? (
        <figure className="admin-image-preview">
          <img src={image.src} alt="" />
          <figcaption>{image.sourceMode === 'upload' ? 'Base64 upload' : 'URL preview'}</figcaption>
        </figure>
      ) : null}
      <label>
        Alt
        <input value={image.alt} onChange={(event) => onChange({ ...image, alt: event.target.value })} />
      </label>
      <label>
        Caption
        <input value={image.caption} onChange={(event) => onChange({ ...image, caption: event.target.value })} />
      </label>
      <label>
        Aspect
        <select value={image.aspect} onChange={(event) => onChange({ ...image, aspect: event.target.value as Aspect })}>
          <option value="wide">Wide</option>
          <option value="square">Square</option>
          <option value="portrait">Portrait</option>
        </select>
      </label>
    </div>
  );
}

function updateItem<T>(items: T[], setItems: (items: T[]) => void, index: number, value: T) {
  setItems(items.map((item, currentIndex) => (currentIndex === index ? value : item)));
}

function removeItem<T>(items: T[], setItems: (items: T[]) => void, index: number, fallback: T) {
  const nextItems = items.filter((_, currentIndex) => currentIndex !== index);
  setItems(nextItems.length ? nextItems : [fallback]);
}

function moveItem<T>(items: T[], setItems: (items: T[]) => void, index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return;

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);
  setItems(nextItems);
}
