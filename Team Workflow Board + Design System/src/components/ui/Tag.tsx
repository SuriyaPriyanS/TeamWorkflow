import React from 'react';

interface TagProps {
  variant?: 'low' | 'medium' | 'high' | 'backlog' | 'in-progress' | 'done' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span className={`tag tag-${variant} ${className}`}>
      {children}
    </span>
  );
};
