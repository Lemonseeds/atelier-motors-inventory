import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../api.js';
import { Modal } from './Modal.jsx';

/**
 * Authentication dialog for Sign In and Register.
 */
export function AuthDialog({ mode, setMode, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(mode === 'register' ? form : { email: form.email, password: form.password }),
      });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <Modal
      title={isLogin ? 'Welcome back.' : 'Join the collection.'}
      subtitle={
        isLogin
          ? 'Sign in to explore live availability and reserve your next drive.'
          : 'Create your account to explore and purchase from our collection.'
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!isLogin && (
          <label className="field-label">
            Full name
            <input
              required
              autoComplete="name"
              className="field-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </label>
        )}
        <label className="field-label">
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            className="field-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
        <label className="field-label">
          Password
          <input
            required
            type="password"
            minLength={!isLogin ? 10 : undefined}
            autoComplete={!isLogin ? 'new-password' : 'current-password'}
            className="field-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={!isLogin ? 'At least 10 characters' : 'Enter your password'}
          />
        </label>

        {error && (
          <p className="border border-rose-200 bg-rose p-2.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <button disabled={busy} className="btn btn-dark w-full mt-2" type="submit">
          {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={18} />
        </button>
      </form>

      {isLogin && (
        <div className="mt-4 border border-[#cfdbee] bg-[#edf2fb] p-3 text-xs text-[#354870]">
          <div className="flex items-center justify-between">
            <span className="font-bold tracking-wide text-[11px] text-royal">DEMO ADMIN CREDENTIALS</span>
            <button
              type="button"
              className="font-bold text-royal hover:underline text-[11px]"
              onClick={() => {
                setForm({ name: '', email: 'admin@example.com', password: 'AdminPass123!' });
                setError('');
              }}
            >
              Fill demo admin
            </button>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted">
            admin@example.com &bull; AdminPass123!
          </p>
        </div>
      )}

      <p className="mt-5 text-center text-xs text-muted">
        {isLogin ? 'New to Atelier?' : 'Already have an account?'}{' '}
        <button
          type="button"
          className="font-extrabold text-royal hover:underline"
          onClick={() => {
            setError('');
            setMode(isLogin ? 'register' : 'login');
          }}
        >
          {isLogin ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </Modal>
  );
}
