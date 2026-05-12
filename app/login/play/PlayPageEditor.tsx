'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/browser';
import type {
  ProjectImage,
  ProjectMediaBlock,
  ProjectPdf,
  ProjectVideo,
} from '@/app/data/projects';
import type { AdminProjectRow } from '@/app/login/projects/adminTypes';

type EditorState = 'checking' | 'ready' | 'saving' | 'success' | 'error' | 'unauthenticated' | 'unauthorized' | 'missing-config';
type AssetKind = 'images' | 'gallery' | 'poster' | 'pdf' | 'videos';
type VideoProvider = ProjectVideo['provider'];
type GalleryLayout = 'grid' | 'masonry' | 'strip' | 'collage' | 'scrapbook';

const assetBucket = 'project-assets';
const maxImageUploadBytes = 10 * 1024 * 1024;
const maxPdfUploadBytes = 20 * 1024 * 1024;
const maxVideoUploadBytes = 50 * 1024 * 1024;

const emptyImage: ProjectImage = {
  src: '',
  alt: '',
  caption: '',
  aspect: 'wide',
};

function sanitizeFileName(value: string) {
  const cleanName = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleanName || 'asset';
}

function compactStrings(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function validateAsset(file: File, kind: AssetKind) {
  if (kind === 'pdf') {
    if (file.type !== 'application/pdf') throw new Error('Please upload a PDF file.');
    if (file.size > maxPdfUploadBytes) throw new Error('Please keep uploaded PDFs under 20 MB.');
    return;
  }

  if (kind === 'videos') {
    if (!file.type.startsWith('video/')) throw new Error('Please upload a video file.');
    if (file.size > maxVideoUploadBytes) throw new Error('Please keep uploaded videos under 50 MB.');
    return;
  }

  if (!file.type.startsWith('image/')) throw new Error('Please upload an image file.');
  if (file.size > maxImageUploadBytes) throw new Error('Please keep uploaded images under 10 MB.');
}

function newBlock(type: ProjectMediaBlock['type'] | 'scrapbook'): ProjectMediaBlock {
  if (type === 'video') return { type: 'video', provider: 'youtube', url: '', title: '' };
  if (type === 'image') return { type: 'image', ...emptyImage };
  if (type === 'gallery') return { type: 'gallery', title: '', caption: '', layout: 'grid', items: [{ ...emptyImage }] };
  if (type === 'scrapbook') {
    return {
      type: 'gallery',
      title: '',
      caption: '',
      layout: 'scrapbook',
      pdf: { src: '', name: '' },
      items: [{ ...emptyImage }],
    };
  }
  return { type: 'text', eyebrow: '', title: '', body: [''] };
}

function cleanImage(image: ProjectImage): ProjectImage {
  return {
    src: image.src.trim(),
    alt: image.alt.trim(),
    caption: image.caption?.trim() || undefined,
    aspect: image.aspect || 'wide',
  };
}

function cleanBlock(block: ProjectMediaBlock): ProjectMediaBlock {
  if (block.type === 'video') {
    return {
      type: 'video',
      provider: block.provider,
      url: block.url.trim(),
      poster: block.poster?.trim() || undefined,
      title: block.title?.trim() || undefined,
    };
  }

  if (block.type === 'image') return { type: 'image', ...cleanImage(block) };

  if (block.type === 'gallery') {
    return {
      type: 'gallery',
      title: block.title?.trim() || undefined,
      caption: block.caption?.trim() || undefined,
      layout: block.layout || 'grid',
      pdf: block.pdf?.src.trim()
        ? { src: block.pdf.src.trim(), name: block.pdf.name?.trim() || undefined }
        : undefined,
      items: block.items.filter((item) => item.src.trim()).map(cleanImage),
    };
  }

  return {
    type: 'text',
    eyebrow: block.eyebrow?.trim() || undefined,
    title: block.title?.trim() || undefined,
    body: compactStrings(block.body),
  };
}

function validateBlocks(blocks: ProjectMediaBlock[]) {
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const label = `Block ${index + 1}`;
    if (block.type === 'video' && !block.url.trim()) errors.push(`${label}: video URL is required.`);
    if (block.type === 'image') {
      if (!block.src.trim()) errors.push(`${label}: image source is required.`);
      if (!block.alt.trim()) errors.push(`${label}: image alt text is required.`);
    }
    if (block.type === 'gallery') {
      const isScrapbook = block.layout === 'scrapbook';
      const images = block.items.filter((item) => item.src.trim());
      if (isScrapbook && !block.pdf?.src.trim() && !images.length) {
        errors.push(`${label}: scrapbook needs a PDF or at least one fallback page image.`);
      }
      if (!isScrapbook && !images.length) errors.push(`${label}: gallery needs at least one image.`);
      images.forEach((item, itemIndex) => {
        if (!item.alt.trim()) errors.push(`${label}, image ${itemIndex + 1}: alt text is required.`);
      });
    }
    if (block.type === 'text' && !compactStrings(block.body).length) {
      errors.push(`${label}: text block needs at least one paragraph.`);
    }
  });

  return errors;
}

export function PlayPageEditor() {
  const supabase = createSupabaseBrowserClient();
  const [state, setState] = useState<EditorState>('checking');
  const [message, setMessage] = useState('');
  const [headline, setHeadline] = useState('Play');
  const [summary, setSummary] = useState<string[]>(['']);
  const [blocks, setBlocks] = useState<ProjectMediaBlock[]>([]);

  useEffect(() => {
    if (!supabase) {
      setState('missing-config');
      return;
    }

    const client = supabase;

    async function loadPlayPage() {
      const { data: userData } = await client.auth.getUser();
      if (!userData.user) {
        setState('unauthenticated');
        return;
      }

      const { data: adminUser, error: adminError } = await client
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (adminError || !adminUser) {
        setState('unauthorized');
        return;
      }

      const { data, error } = await client
        .from('projects')
        .select('slug,title,section,status,featured_on_home,sort_order,updated_at,tags,disciplines,card_image,detail')
        .eq('slug', 'play')
        .eq('section', 'play')
        .maybeSingle();

      if (error) {
        setState('error');
        setMessage(error.message);
        return;
      }

      const playRow = data as AdminProjectRow | null;
      if (playRow?.detail) {
        setHeadline(playRow.detail.headline || 'Play');
        setSummary(playRow.detail.summary?.length ? playRow.detail.summary : ['']);
        setBlocks(playRow.detail.media || []);
      }
      setState('ready');
    }

    loadPlayPage();
  }, [supabase]);

  async function uploadAsset(file: File, kind: AssetKind) {
    if (!supabase) throw new Error('Supabase is not configured.');
    validateAsset(file, kind);

    const path = `projects/play/${kind}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from(assetBucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`${error.message}. Confirm the public "${assetBucket}" Supabase Storage bucket exists and upload policies allow admin users.`);
    }

    const { data } = supabase.storage.from(assetBucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setState('missing-config');
      return;
    }

    const errors = validateBlocks(blocks);
    if (errors.length) {
      setState('error');
      setMessage(errors.join(' '));
      return;
    }

    setState('saving');
    setMessage('');

    const payload = {
      slug: 'play',
      title: 'Play',
      section: 'play',
      tags: [],
      disciplines: [],
      card_image: { src: '', alt: 'Play page' },
      featured_on_home: false,
      sort_order: 999,
      status: 'published',
      detail: {
        projectType: 'normal',
        headline: headline.trim() || 'Play',
        summary: compactStrings(summary),
        media: blocks.map(cleanBlock),
      },
    };

    const { error } = await supabase.from('projects').upsert(payload, { onConflict: 'slug' });

    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }

    setState('success');
    setMessage('Play page saved and published.');
  }

  if (state === 'checking') return <p className="admin-status">Checking session...</p>;
  if (state === 'missing-config') return <p className="admin-status">Supabase environment variables are not configured.</p>;
  if (state === 'unauthenticated') return <p className="admin-status">You must log in before editing Play.</p>;
  if (state === 'unauthorized') return <p className="admin-status">Your account is not listed in admin_users.</p>;

  return (
    <form className="admin-project-form" onSubmit={handleSubmit}>
      <header className="admin-form-header">
        <div>
          <p>Admin</p>
          <h1>Edit Play page</h1>
        </div>
        <button type="submit" disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving...' : 'Save Play page'}
        </button>
      </header>

      <nav className="admin-toolbar" aria-label="Play admin navigation">
        <Link href="/login/projects">Projects</Link>
        <Link href="/login/projects/new">Create project</Link>
        <Link href="/play">View Play</Link>
      </nav>

      {message ? <p className="admin-message" data-state={state}>{message}</p> : null}

      <fieldset className="admin-fieldset">
        <legend>Page intro</legend>
        <label>
          Heading
          <input value={headline} onChange={(event) => setHeadline(event.target.value)} />
        </label>
        <RepeatableText label="Intro paragraphs" values={summary} onChange={setSummary} multiline />
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Play blocks</legend>
        <p className="admin-help">Add blocks in the order they should appear on the Play page.</p>
        <div className="admin-media-actions">
          <button type="button" onClick={() => setBlocks((current) => [...current, newBlock('text')])}>
            Add text
          </button>
          <button type="button" onClick={() => setBlocks((current) => [...current, newBlock('image')])}>
            Add image
          </button>
          <button type="button" onClick={() => setBlocks((current) => [...current, newBlock('video')])}>
            Add video
          </button>
          <button type="button" onClick={() => setBlocks((current) => [...current, newBlock('gallery')])}>
            Add gallery
          </button>
          <button type="button" onClick={() => setBlocks((current) => [...current, newBlock('scrapbook')])}>
            Add scrapbook
          </button>
        </div>

        <div className="admin-media-list">
          {blocks.map((block, index) => (
            <PlayBlockEditor
              block={block}
              index={index}
              key={index}
              onChange={(nextBlock) => updateItem(blocks, setBlocks, index, nextBlock)}
              onRemove={() => setBlocks((current) => current.filter((_, currentIndex) => currentIndex !== index))}
              onMoveUp={() => moveItem(blocks, setBlocks, index, -1)}
              onMoveDown={() => moveItem(blocks, setBlocks, index, 1)}
              onUpload={uploadAsset}
            />
          ))}
        </div>
      </fieldset>
    </form>
  );
}

function PlayBlockEditor({
  block,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpload,
}: {
  block: ProjectMediaBlock;
  index: number;
  onChange: (block: ProjectMediaBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpload: (file: File, kind: AssetKind) => Promise<string>;
}) {
  const isScrapbook = block.type === 'gallery' && block.layout === 'scrapbook';

  return (
    <section className="admin-media-block">
      <header>
        <h3>{index + 1}. {isScrapbook ? 'scrapbook' : block.type}</h3>
        <div>
          <button type="button" onClick={onMoveUp}>Up</button>
          <button type="button" onClick={onMoveDown}>Down</button>
          <button type="button" onClick={onRemove}>Remove</button>
        </div>
      </header>

      {block.type === 'text' ? (
        <>
          <label>
            Eyebrow
            <input value={block.eyebrow || ''} onChange={(event) => onChange({ ...block, eyebrow: event.target.value })} />
          </label>
          <label>
            Title
            <input value={block.title || ''} onChange={(event) => onChange({ ...block, title: event.target.value })} />
          </label>
          <RepeatableText label="Body paragraphs" values={block.body.length ? block.body : ['']} onChange={(body) => onChange({ ...block, body })} multiline />
        </>
      ) : null}

      {block.type === 'image' ? (
        <ImageInline image={block} onChange={(image) => onChange({ type: 'image', ...image })} onUpload={(file) => onUpload(file, 'images')} />
      ) : null}

      {block.type === 'video' ? (
        <VideoFields block={block} onChange={onChange} onUpload={onUpload} />
      ) : null}

      {block.type === 'gallery' ? (
        <GalleryFields block={block} onChange={onChange} onUpload={onUpload} />
      ) : null}
    </section>
  );
}

function VideoFields({
  block,
  onChange,
  onUpload,
}: {
  block: Extract<ProjectMediaBlock, { type: 'video' }>;
  onChange: (block: ProjectMediaBlock) => void;
  onUpload: (file: File, kind: AssetKind) => Promise<string>;
}) {
  async function uploadVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await onUpload(file, 'videos');
      onChange({ ...block, provider: 'file', url });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that video.');
    } finally {
      event.target.value = '';
    }
  }

  async function uploadPoster(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const poster = await onUpload(file, 'poster');
      onChange({ ...block, poster });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that poster.');
    } finally {
      event.target.value = '';
    }
  }

  return (
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
        Upload video file
        <input type="file" accept="video/*" onChange={uploadVideo} />
      </label>
      <label>
        Poster URL
        <input value={block.poster || ''} onChange={(event) => onChange({ ...block, poster: event.target.value })} />
      </label>
      <label>
        Upload poster
        <input type="file" accept="image/*" onChange={uploadPoster} />
      </label>
      <label>
        Title
        <input value={block.title || ''} onChange={(event) => onChange({ ...block, title: event.target.value })} />
      </label>
    </>
  );
}

function GalleryFields({
  block,
  onChange,
  onUpload,
}: {
  block: Extract<ProjectMediaBlock, { type: 'gallery' }>;
  onChange: (block: ProjectMediaBlock) => void;
  onUpload: (file: File, kind: AssetKind) => Promise<string>;
}) {
  const isScrapbook = block.layout === 'scrapbook';

  async function uploadPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const src = await onUpload(file, 'pdf');
      onChange({ ...block, pdf: { src, name: block.pdf?.name || file.name } });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not upload that PDF.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <>
      <label>
        {isScrapbook ? 'Scrapbook title' : 'Gallery title'}
        <input value={block.title || ''} onChange={(event) => onChange({ ...block, title: event.target.value })} />
      </label>
      <label>
        {isScrapbook ? 'Scrapbook caption' : 'Gallery caption'}
        <input value={block.caption || ''} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
      </label>
      {!isScrapbook ? (
        <label>
          Layout
          <select value={block.layout || 'grid'} onChange={(event) => onChange({ ...block, layout: event.target.value as GalleryLayout })}>
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
            <option value="strip">Strip</option>
            <option value="collage">Collage</option>
          </select>
        </label>
      ) : (
        <div className="admin-nested">
          <h3>Scrapbook PDF</h3>
          <label>
            PDF URL
            <input
              value={block.pdf?.src || ''}
              onChange={(event) => onChange({ ...block, pdf: { ...(block.pdf || { name: '' }), src: event.target.value } })}
            />
          </label>
          <label>
            Upload PDF
            <input type="file" accept="application/pdf" onChange={uploadPdf} />
          </label>
          <label>
            PDF name
            <input
              value={block.pdf?.name || ''}
              onChange={(event) => onChange({ ...block, pdf: { ...(block.pdf || { src: '' }), name: event.target.value } })}
            />
          </label>
        </div>
      )}

      <div className="admin-repeatable">
        <div className="admin-repeatable__header">
          <h3>{isScrapbook ? 'Fallback page images' : 'Gallery images'}</h3>
          <button type="button" onClick={() => onChange({ ...block, items: [...block.items, { ...emptyImage }] })}>
            Add image
          </button>
        </div>
        {block.items.map((item, itemIndex) => (
          <div className="admin-nested" key={itemIndex}>
            <ImageInline
              image={item}
              onChange={(image) => updateItem(block.items, (items) => onChange({ ...block, items }), itemIndex, image)}
              onUpload={(file) => onUpload(file, 'gallery')}
            />
            <button type="button" onClick={() => removeItem(block.items, (items) => onChange({ ...block, items }), itemIndex, { ...emptyImage })}>
              Remove image
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function ImageInline({
  image,
  onChange,
  onUpload,
}: {
  image: ProjectImage;
  onChange: (image: ProjectImage) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const src = await onUpload(file);
      onChange({
        ...image,
        src,
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
      <label>
        Image URL
        <input value={image.src} onChange={(event) => onChange({ ...image, src: event.target.value })} />
      </label>
      <label>
        Upload image
        <input type="file" accept="image/*" onChange={handleUpload} />
      </label>
      {image.src ? (
        <figure className="admin-image-preview">
          <img src={image.src} alt="" />
          <figcaption>Preview</figcaption>
        </figure>
      ) : null}
      <label>
        Alt
        <input value={image.alt} onChange={(event) => onChange({ ...image, alt: event.target.value })} />
      </label>
      <label>
        Caption
        <input value={image.caption || ''} onChange={(event) => onChange({ ...image, caption: event.target.value })} />
      </label>
      <label>
        Aspect
        <select value={image.aspect || 'wide'} onChange={(event) => onChange({ ...image, aspect: event.target.value as ProjectImage['aspect'] })}>
          <option value="wide">Wide</option>
          <option value="square">Square</option>
          <option value="portrait">Portrait</option>
        </select>
      </label>
    </div>
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
            <textarea value={value} onChange={(event) => updateItem(values, onChange, index, event.target.value)} />
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
