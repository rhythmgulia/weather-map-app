import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ mode }) => {
  const navigate = useNavigate();
  const { login, signup, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({ name: form.name, email: form.email, password: form.password });
      }
      navigate('/dashboard');
    } catch (_) {
      // errors handled by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        {mode === 'signup' && (
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        )}
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
        </label>
        {error && <div className="error-text">{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : mode === 'login' ? 'Login' : 'Sign up'}
        </button>
        <p>
          {mode === 'login' ? (
            <>
              Need an account? <Link to="/signup">Sign up</Link>
            </>
          ) : (
            <>
              Already registered? <Link to="/login">Log in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
