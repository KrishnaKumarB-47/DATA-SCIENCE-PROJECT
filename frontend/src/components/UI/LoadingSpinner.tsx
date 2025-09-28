import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const { isLoading } = useAuth();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <>
      {/* Global loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              "animate-spin rounded-full border-2 border-primary border-t-transparent",
              sizeClasses[size],
              className
            )} />
            {text && (
              <p className="text-sm text-muted-foreground">{text}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Component-level spinner */}
      {!isLoading && (
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "animate-spin rounded-full border-2 border-primary border-t-transparent",
            sizeClasses[size],
            className
          )} />
          {text && (
            <p className="text-sm text-muted-foreground">{text}</p>
          )}
        </div>
      )}
    </>
  );
};

export default LoadingSpinner;
