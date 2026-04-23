// src/components/common/LoadingSkeleton.tsx
import React from 'react';
import './LoadingSkeleton.css';

interface SkeletonProps {
  type?: 'card' | 'text' | 'avatar' | 'line' | 'button';
  count?: number;
  width?: string;
  height?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({
  type = 'card',
  count = 1,
  width = '100%',
  height = '200px',
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton skeleton-image" style={{ height: '120px' }} />
            <div className="skeleton-content">
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              <div className="skeleton skeleton-text" style={{ width: '90%', marginTop: '12px' }} />
            </div>
          </div>
        );
      case 'avatar':
        return <div className="skeleton skeleton-avatar" style={{ width, height }} />;
      case 'text':
        return (
          <div>
            <div className="skeleton skeleton-text" style={{ width, height }} />
          </div>
        );
      case 'line':
        return <div className="skeleton skeleton-text" style={{ width, height: '12px' }} />;
      case 'button':
        return <div className="skeleton skeleton-button" style={{ width, height: '40px' }} />;
      default:
        return null;
    }
  };

  return (
    <div className={`loading-skeleton ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-wrapper">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
