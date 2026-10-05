import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Production intentionally avoids exposing stack traces to users.
  }

  render() {
    if (this.state.failed) return <main className="app-error" dir="rtl"><h1>حدث خطأ غير متوقع</h1><p>أعد تحميل الصفحة أو حاول مرة أخرى.</p><button type="button" onClick={() => window.location.reload()}>إعادة تحميل الصفحة</button></main>;
    return this.props.children;
  }
}
