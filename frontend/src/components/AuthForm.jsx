import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const AuthForm = ({ mode }) => {
  const navigate = useNavigate();
  const { login, signup, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  // Initialize demo map
  useEffect(() => {
    if (!mapboxgl.accessToken) return;
    if (mapInstance.current) return;
    if (!mapContainer.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.1025, 28.7041],
      zoom: 10
    });

    // Add a marker
    new mapboxgl.Marker({ color: 'rgb(37, 156, 235)' })
      .setLngLat([77.1025, 28.7041])
      .addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

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
    <div className="auth-page-container">
      {/* Left Side - Interactive Preview */}
      <div className="auth-preview">
        <div className="auth-preview-content">
          <div className="auth-hero-text">
            <h1 className="auth-title">
              <span className="title-word">Weather</span>
              <span className="title-plus">+</span>
              <span className="title-word">Map</span>
              <span className="title-word">Dashboard</span>
            </h1>
            <p className="auth-subtitle">Explore weather around the world with interactive maps</p>
          </div>

          {/* Demo Map */}
          <div className="auth-map-preview">
            <div className="map" ref={mapContainer} />
            {!mapboxgl.accessToken && (
              <div className="map-placeholder">Map preview</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Get started'}</h2>
            <p>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Enter your name"
                  required 
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Enter your email"
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Enter your password"
                required 
                minLength={6} 
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          
          <div className="auth-card-footer">
            <p>
              {mode === 'login' ? (
                <>
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </>
              ) : (
                <>
                  Already have an account? <Link to="/login">Sign in</Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
