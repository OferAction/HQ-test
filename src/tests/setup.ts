import '@testing-library/jest-dom';

// Stub CSS custom properties so inline style assertions work
const cssVars: Record<string, string> = {
  '--bg':            '#0b0d19',
  '--surface':       '#101320',
  '--elevated':      '#151929',
  '--hover':         '#131728',
  '--selected':      '#152040',
  '--border':        '#1c2133',
  '--border-subtle': '#181c2c',
  '--border-strong': '#273048',
  '--border-hover':  '#384568',
  '--t1':            '#f0f4ff',
  '--t2':            '#ccd4f0',
  '--t3':            '#9aa8cc',
  '--t4':            '#7888b0',
  '--t5':            '#586890',
};

beforeEach(() => {
  Object.entries(cssVars).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
});

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// jsdom doesn't implement requestAnimationFrame
global.requestAnimationFrame = (cb) =>
  setTimeout(() => cb(performance.now()), 0) as unknown as number;
global.cancelAnimationFrame = (id) => clearTimeout(id);
