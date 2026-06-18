import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[min(50vh,20rem)] flex-col items-center justify-center rounded-sm border border-base bg-surface px-6 py-12 text-center">
          <p className="text-body font-medium">{this.props.title ?? 'Something went wrong'}</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            {this.state.error.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            type="button"
            className="mt-4 rounded-sm border border-base bg-surface-2 px-4 py-2 text-sm font-medium text-body hover:bg-surface-3"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
