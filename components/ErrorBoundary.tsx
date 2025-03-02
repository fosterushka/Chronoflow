import { Component, ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  fallback?: (error: Error) => ComponentChildren;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state = { error: null };

  static override getDerivedStateFromError(error: Error): State {
    return { error };
  }

  // deno-lint-ignore no-explicit-any
  override componentDidCatch(error: Error, errorInfo: any): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      return fallback
        ? (
          fallback(error)
        )
        : (
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h2 class="text-lg font-semibold text-red-700 dark:text-red-400">
              Something went wrong
            </h2>
            <p class="mt-2 text-sm text-red-600 dark:text-red-300">
              {/* @ts-ignore */}
              {error.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              class="mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        );
    }

    return children;
  }
}
