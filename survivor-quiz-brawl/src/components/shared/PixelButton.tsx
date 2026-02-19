import React from 'react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: PixelButtonProps) {
  const baseStyles = 'font-pixel transition-all duration-150 border-b-4 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-pixel-blue text-white border-blue-700 hover:bg-blue-500',
    secondary: 'bg-pixel-purple text-white border-purple-900 hover:bg-purple-700',
    danger: 'bg-pixel-red text-white border-red-800 hover:bg-red-500',
    success: 'bg-pixel-green text-black border-green-700 hover:bg-green-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
