import { Component, type ReactNode } from 'react';

/** True when the browser can create a WebGL context. */
export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Few cores, little memory or Save-Data: skip optional 3D. */
export function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData === true;
}

/** Why optional 3D cannot run here, or null when it can. */
export function sceneUnavailableReason(): string | null {
  if (!canUseWebGL()) return 'This browser cannot draw WebGL.';
  if (isLowEndDevice()) return 'This device is set to save data or has limited memory.';
  return null;
}

/** Renders nothing and reports once if a scene throws, so the page around it survives. */
export class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
