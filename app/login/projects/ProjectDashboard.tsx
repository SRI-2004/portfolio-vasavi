'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/browser';
import { adminProjectSelect, type AdminProjectRow, type AdminProjectStatus } from '@/app/login/projects/adminTypes';

type DashboardState = 'checking' | 'ready' | 'loading' | 'error' | 'unauthenticated' | 'unauthorized' | 'missing-config';

export function ProjectDashboard() {
  const supabase = createSupabaseBrowserClient();
  const [state, setState] = useState<DashboardState>('checking');
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) {
      setState('missing-config');
      return;
    }

    const client = supabase;

    async function loadProjects() {
      setState('loading');
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
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (error) {
        setMessage(error.message);
        setState('error');
        return;
      }

      setProjects((data ?? []) as AdminProjectRow[]);
      setState('ready');
    }

    loadProjects();
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setState('unauthenticated');
    setProjects([]);
  }

  async function updateStatus(project: AdminProjectRow) {
    if (!supabase) return;

    const nextStatus: AdminProjectStatus = project.status === 'published' ? 'draft' : 'published';
    setMessage('');

    const { error } = await supabase.from('projects').update({ status: nextStatus }).eq('slug', project.slug);

    if (error) {
      setMessage(error.message);
      setState('error');
      return;
    }

    setProjects((current) =>
      current.map((currentProject) =>
        currentProject.slug === project.slug ? { ...currentProject, status: nextStatus } : currentProject,
      ),
    );
    setState('ready');
  }

  async function deleteProject(project: AdminProjectRow) {
    if (!supabase) return;

    const confirmed = window.confirm(`Delete "${project.title}" (${project.slug}) from Supabase?`);
    if (!confirmed) return;

    setMessage('');
    const { error } = await supabase.from('projects').delete().eq('slug', project.slug);

    if (error) {
      setMessage(error.message);
      setState('error');
      return;
    }

    setProjects((current) => current.filter((currentProject) => currentProject.slug !== project.slug));
    setState('ready');
  }

  if (state === 'checking' || state === 'loading') {
    return <p className="admin-status">Loading projects...</p>;
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
    <section className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <p>Admin</p>
          <h1>Projects</h1>
        </div>
        <nav className="admin-toolbar" aria-label="Project admin actions">
          <Link href="/login/projects/new">Create project</Link>
          <button type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </nav>
      </header>

      {message ? <p className="admin-message" data-state={state}>{message}</p> : null}

      {projects.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Location</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Sort</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.slug}>
                  <td>{project.title}</td>
                  <td>{project.slug}</td>
                  <td>{project.section === 'play' ? 'Play' : project.section === 'research' ? 'Research' : 'Projects'}</td>
                  <td>
                    <span className="admin-status-badge" data-status={project.status}>
                      {project.status}
                    </span>
                  </td>
                  <td>{project.featured_on_home ? 'Yes' : 'No'}</td>
                  <td>{project.sort_order ?? 100}</td>
                  <td>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" onClick={() => updateStatus(project)}>
                        {project.status === 'published' ? 'Draft' : 'Publish'}
                      </button>
                      <Link href={project.section === 'play' ? '/login/play' : `/login/projects/${encodeURIComponent(project.slug)}/edit`}>
                        Edit
                      </Link>
                      <button type="button" onClick={() => deleteProject(project)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty">
          <p>No projects yet.</p>
          <Link href="/login/projects/new">Create the first project</Link>
        </div>
      )}
    </section>
  );
}
