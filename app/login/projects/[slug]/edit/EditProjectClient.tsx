'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/browser';
import { adminProjectSelect, type AdminProjectRow } from '@/app/login/projects/adminTypes';
import { ProjectEntryForm } from '@/app/login/projects/new/ProjectEntryForm';

type EditState = 'checking' | 'ready' | 'error' | 'not-found' | 'unauthenticated' | 'unauthorized' | 'missing-config';

export function EditProjectClient({ slug }: { slug: string }) {
  const supabase = createSupabaseBrowserClient();
  const [state, setState] = useState<EditState>('checking');
  const [project, setProject] = useState<AdminProjectRow | undefined>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) {
      setState('missing-config');
      return;
    }

    const client = supabase;

    async function loadProject() {
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
        .select(adminProjectSelect)
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setState('error');
        return;
      }

      if (!data) {
        setState('not-found');
        return;
      }

      setProject(data as AdminProjectRow);
      setState('ready');
    }

    loadProject();
  }, [slug, supabase]);

  if (state === 'checking') {
    return <p className="admin-status">Loading project...</p>;
  }

  if (state === 'missing-config') {
    return <p className="admin-status">Supabase environment variables are not configured.</p>;
  }

  if (state === 'unauthenticated') {
    return <p className="admin-status">You must log in before editing projects.</p>;
  }

  if (state === 'unauthorized') {
    return <p className="admin-status">Your account is not listed in admin_users.</p>;
  }

  if (state === 'not-found') {
    return (
      <div className="admin-empty">
        <p>Project not found.</p>
        <Link href="/login/projects">Back to projects</Link>
      </div>
    );
  }

  if (state === 'error') {
    return <p className="admin-status">{message || 'Could not load project.'}</p>;
  }

  return project ? <ProjectEntryForm mode="edit" initialProject={project} originalSlug={slug} /> : null;
}
