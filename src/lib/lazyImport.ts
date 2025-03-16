import React from 'react';

/**
 * Creates a lazy-loaded component with loading and error states
 * @param importFn Function that imports the component
 * @param LoadingComponent Component to show while loading
 * @param ErrorComponent Component to show on error
 * @returns Lazy-loaded component
 */
export function lazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent: React.ComponentType = () => <div>Loading...</div>,
  ErrorComponent: React.ComponentType<{ error: Error }> = ({ error }) => <div>Error loading component: {error.message.toString()}</div>
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent: React.FC<React.ComponentProps<T>> = (props) => {
    return (
      <React.Suspense fallback={<LoadingComponent />}>
        <ErrorBoundary ErrorComponent={ErrorComponent}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </React.Suspense>
    );
  };

  // Copy display name
  if (LazyComponent.displayName) {
    WrappedComponent.displayName = `LazyLoaded(${LazyComponent.displayName})`;
  } else {
    WrappedComponent.displayName = 'LazyLoaded(Component)';
  }

  return WrappedComponent;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  ErrorComponent: React.ComponentType<{ error: Error }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error loading lazy component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { ErrorComponent } = this.props;
      return <ErrorComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}
