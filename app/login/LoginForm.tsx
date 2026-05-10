'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/browser';

type LoginState = 'idle' | 'loading' | 'authenticated' | 'error' | 'missing-config';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<LoginState>('idle');
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) {
      setState('missing-config');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setState('authenticated');
    });
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState('missing-config');
      return;
    }

    setState('loading');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }

    setState('authenticated');
    setPassword('');
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setState('idle');
    setMessage('');
  }

  if (state === 'missing-config') {
    return (
      <div className="login-panel">
        <h1>Login</h1>
        <p>Supabase environment variables are not configured.</p>
      </div>
    );
  }

  if (state === 'authenticated') {
    return (
      <div className="login-panel">
        <h1>Logged in</h1>
        <p>You are authenticated.</p>
        <Link className="login-panel__link" href="/login/projects">
          Project dashboard
        </Link>
        <Link className="login-panel__link" href="/login/projects/new">
          Create project
        </Link>
        <button type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form className="login-panel" onSubmit={handleSubmit}>
      <h1>Login</h1>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Signing in...' : 'Sign in'}
      </button>
      {message ? <p role="alert">{message}</p> : null}
    </form>
  );
}
