'use client';

import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactElement;
}

let toastCount = 0;

// Global state (simple singleton)
let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function dispatch(toast: Toast) {
  toasts = [toast, ...toasts].slice(0, 5);
  listeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id);
    listeners.forEach((l) => l(toasts));
  }, 4000);
}

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = String(++toastCount);
  dispatch({ id, title, description, variant });
}

export function useToast() {
  const [activeToasts, setActiveToasts] = useState<Toast[]>(toasts);

  useCallback(() => {
    listeners.push(setActiveToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setActiveToasts);
    };
  }, [])();

  // Register listener on mount
  if (!listeners.includes(setActiveToasts)) {
    listeners.push(setActiveToasts);
  }

  return { toasts: activeToasts, toast };
}
