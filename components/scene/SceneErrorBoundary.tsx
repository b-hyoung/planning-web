"use client";

import React from "react";

export class SceneErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[Scene]", error);
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
