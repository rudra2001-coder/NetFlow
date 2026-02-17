'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './Button';
import { Card, CardBody } from './Card';

// Error Boundary Props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: unknown[];
}

// Error Boundary State
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasKeyChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-error-200 dark:border-error-800">
            <CardBody className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-error-600 dark:text-error-400" />
              </div>

              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Something went wrong
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>

              {showDetails && error && (
                <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left overflow-auto max-h-48">
                  <p className="text-sm font-mono text-error-600 dark:text-error-400 mb-2">
                    {error.message}
                  </p>
                  {errorInfo?.componentStack && (
                    <pre className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={this.reset}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
                <Button
                  variant="primary"
                  onClick={this.handleGoHome}
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go Home
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Error Fallback Component - For manual use
export interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  message?: string;
  showDetails?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'Something went wrong',
  showDetails = false,
}) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-error-200 dark:border-error-800">
        <CardBody className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-error-100 dark:bg-error-900/30 rounded-full mb-3">
            <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
          </div>

          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            {message}
          </h3>

          {showDetails && error && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 font-mono">
              {error.message}
            </p>
          )}

          {resetErrorBoundary && (
            <Button
              variant="primary"
              size="sm"
              onClick={resetErrorBoundary}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// withErrorBoundary HOC
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundaryComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundaryComponent;
}

// useErrorBoundary Hook - For functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetBoundary = React.useCallback(() => {
    setError(null);
  }, []);

  const showBoundary = React.useCallback((err: Error) => {
    setError(err);
  }, []);

  if (error) {
    throw error;
  }

  return { showBoundary, resetBoundary };
};

// Network Error Component
export interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'Unable to connect to the server. Please check your internet connection.',
}) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-full mb-3">
            <Bug className="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>

          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Connection Error
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {message}
          </p>

          {onRetry && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// NotFound Error Component
export interface NotFoundErrorProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  title = 'Page Not Found',
  message = "The page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center py-8">
          <div className="text-6xl font-bold text-neutral-200 dark:text-neutral-700 mb-4">
            404
          </div>

          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {title}
          </h3>

          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {message}
          </p>

          {showHomeButton && (
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/')}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go Home
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// Permission Error Component
export interface PermissionErrorProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  title = 'Access Denied',
  message = "You don't have permission to access this resource.",
  requiredPermission,
}) => {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-warning-200 dark:border-warning-800">
        <CardBody className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-full mb-3">
            <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>

          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            {title}
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            {message}
          </p>

          {requiredPermission && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-4 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded inline-block">
              Required: {requiredPermission}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => (window.location.href = '/')}
            >
              Go Home
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ErrorBoundary;