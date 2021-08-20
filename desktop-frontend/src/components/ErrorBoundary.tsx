import React from 'react';

interface ErrorBoundaryProps {
  handler:(error:Error) => React.ReactElement
}

interface ErrorBoundaryState {
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error:null };
  }

  static getDerivedStateFromError(error:Error):ErrorBoundaryState {    // Update state so the next render will show the fallback UI.
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.handler(this.state.error);
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
