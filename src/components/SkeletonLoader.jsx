import React from 'react';
import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * Displays placeholder content while async data loads
 * Prevents layout shift by reserving space for dynamic elements
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='text'] - Skeleton variant ('text' | 'circle' | 'rect' | 'message')
 * @param {number} [props.width] - Width in pixels or percentage
 * @param {number} [props.height] - Height in pixels
 * @param {number} [props.count=1] - Number of skeleton elements to render
 * @param {string} [props.className] - Additional CSS classes
 */
const SkeletonLoader = ({ 
  variant = 'text', 
  width, 
  height, 
  count = 1,
  className = ''
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`SkeletonLoader SkeletonLoader--${variant} ${className}`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined
      }}
      aria-hidden="true"
      role="presentation"
    >
      <div className="SkeletonLoader__shimmer" />
    </div>
  ));

  return <>{skeletons}</>;
};

/**
 * MessageSkeleton Component
 * Specialized skeleton for message loading
 */
export const MessageSkeleton = ({ count = 3 }) => {
  return (
    <div className="MessageSkeleton" role="status" aria-label="Loading messages">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="MessageSkeleton__item">
          <SkeletonLoader variant="circle" width={32} height={32} />
          <div className="MessageSkeleton__content">
            <SkeletonLoader variant="text" width={120} height={16} />
            <SkeletonLoader variant="text" width={280} height={14} />
            <SkeletonLoader variant="text" width={200} height={14} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading messages...</span>
    </div>
  );
};

/**
 * StatsSkeleton Component
 * Specialized skeleton for statistics loading
 */
export const StatsSkeleton = () => {
  return (
    <div className="StatsSkeleton" role="status" aria-label="Loading statistics">
      <div className="StatsSkeleton__grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="StatsSkeleton__item">
            <SkeletonLoader variant="text" width={60} height={12} />
            <SkeletonLoader variant="text" width={40} height={24} />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading statistics...</span>
    </div>
  );
};

export default SkeletonLoader;
