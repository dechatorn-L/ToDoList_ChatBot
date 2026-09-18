import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock scrollIntoView for jsdom environment
if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}
