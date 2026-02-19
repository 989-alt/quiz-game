import React from 'react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: string;
}

export function PixelButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
}: PixelButtonProps) {
  const variantMap: Record<string, string> = {
    primary: 'btn-purple',
    secondary: 'btn-blue',
    success: 'btn-green',
    danger: 'btn-red',
    warning: 'btn-orange',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: 'clamp(4px, 0.5vw, 8px) clamp(8px, 1vw, 16px)', fontSize: 'clamp(6px, 0.65vw, 8px)' },
    md: { padding: 'clamp(8px, 1vw, 14px) clamp(14px, 1.8vw, 24px)', fontSize: 'clamp(7px, 0.8vw, 10px)' },
    lg: { padding: 'clamp(10px, 1.3vw, 18px) clamp(18px, 2.2vw, 32px)', fontSize: 'clamp(8px, 1vw, 13px)' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-pixel ${variantMap[variant]} ${className}`}
      style={sizeStyles[size]}
    >
      {icon && <span style={{ marginRight: 'clamp(4px, 0.4vw, 6px)' }}>{icon}</span>}
      {children}
    </button>
  );
}
