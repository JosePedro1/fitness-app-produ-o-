import React from 'react';

const AuthInput = ({ label, type = 'text', name, value, onChange, placeholder = '', icon: Icon, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
    <label
      htmlFor={name}
      style={{ fontSize: 13, color: 'rgba(240,240,248,.6)', fontWeight: 400 }}
    >
      {label}
    </label>

    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
        style={{
          width: '100%',
          height: 46,
          background: '#1e1e28',
          border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,.14)'}`,
          borderRadius: 8,
          color: '#f0f0f8',
          padding: Icon ? '0 46px 0 14px' : '0 14px',
          fontSize: 15,
          outline: 'none',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'border-color .2s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = '#5B4FFF'; }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,.14)'; }}
      />
      {Icon && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(91,79,255,.15)', borderRadius: '0 8px 8px 0',
          borderLeft: '1px solid rgba(255,255,255,.08)',
          pointerEvents: 'none',
        }}>
          <Icon size={18} color="rgba(91,79,255,.9)" />
        </div>
      )}
    </div>

    {error && (
      <span style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</span>
    )}
  </div>
);

export default AuthInput;
