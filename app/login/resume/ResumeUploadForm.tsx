'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/browser';
import { assetBucket, resumeStoragePath, resumeUrl } from '@/app/config/siteAssets';

type ResumeState = 'checking' | 'ready' | 'uploading' | 'success' | 'error' | 'unauthenticated' | 'unauthorized' | 'missing-config';

const maxResumeBytes = 20 * 1024 * 1024;

export function ResumeUploadForm() {
  const supabase = createSupabaseBrowserClient();
  const [state, setState] = useState<ResumeState>('checking');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');

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

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;

    if (file.type !== 'application/pdf') {
      setState('error');
      setMessage('Please upload a PDF file.');
      event.target.value = '';
      return;
    }

    if (file.size > maxResumeBytes) {
      setState('error');
      setMessage('Please keep the resume PDF under 20 MB.');
      event.target.value = '';
      return;
    }

    setState('uploading');
    setMessage('');

    const { error } = await supabase.storage.from(assetBucket).upload(resumeStoragePath, file, {
      contentType: 'application/pdf',
      upsert: true,
    });

    event.target.value = '';

    if (error) {
      setState('error');
      setMessage(`${error.message}. Confirm Storage update policies allow admin users.`);
      return;
    }

    setFileName(file.name);
    setState('success');
    setMessage('Resume uploaded and overwritten.');
  }

  if (state === 'checking') {
    return <p className="admin-status">Checking session...</p>;
  }

  if (state === 'missing-config') {
    return <p className="admin-status">Supabase environment variables are not configured.</p>;
  }

  if (state === 'unauthenticated') {
    return <p className="admin-status">You must log in before uploading a resume.</p>;
  }

  if (state === 'unauthorized') {
    return <p className="admin-status">Your account is not listed in admin_users.</p>;
  }

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <p>Admin</p>
          <h1>Resume</h1>
        </div>
        <nav className="admin-toolbar" aria-label="Resume admin actions">
          <Link href="/login/projects">Projects</Link>
          <Link href="/login/projects/new">Create project</Link>
        </nav>
      </header>

      {message ? <p className="admin-message" data-state={state}>{message}</p> : null}

      <fieldset className="admin-fieldset">
        <legend>Overwrite resume</legend>
        <p className="admin-help">
          Uploading a PDF replaces the public resume file used by the About section button.
        </p>
        <label>
          Resume PDF
          <input type="file" accept="application/pdf" onChange={handleUpload} disabled={state === 'uploading'} />
        </label>
        {fileName ? <p className="admin-help">Last uploaded: {fileName}</p> : null}
        <a className="login-panel__link" href={resumeUrl} target="_blank" rel="noreferrer">
          Open current resume
        </a>
      </fieldset>
    </section>
  );
}
