/**
 * DOM Utilities for StoneScriptUI
 *
 * These utilities help developers avoid common XSS vulnerabilities
 * by providing safe alternatives to innerHTML and other dangerous patterns.
 */

// Track if warnings have been shown (to avoid spam)
const shownWarnings = new Set<string>();

/**
 * Logs a warning about innerHTML usage.
 * This is called automatically when innerHTML is detected.
 *
 * @internal
 */
function warnInnerHTML(element: Element, trace: string): void {
  const warningKey = `innerHTML-${trace}`;

  if (shownWarnings.has(warningKey)) {
    return; // Already warned about this location
  }

  shownWarnings.add(warningKey);

  console.warn(
    '%c⚠️ StoneScriptUI Warning: innerHTML detected',
    'color: #ff9800; font-weight: bold; font-size: 14px;',
    '\n\n' +
    '❌ Avoid using innerHTML - it can cause XSS vulnerabilities!\n\n' +
    'Instead, use one of these safe alternatives:\n' +
    '  1. element.appendChild(childElement)\n' +
    '  2. addHtms(container, templateFunction, context)\n' +
    '  3. element.textContent = "text" (for text only)\n\n' +
    'Element:', element,
    '\n\nStack trace:', trace
  );
}

/**
 * Safely clears all children from a DOM element.
 * This is the safe alternative to `element.innerHTML = ''`
 *
 * @param element - The element to clear
 *
 * @example
 * ```typescript
 * const container = document.getElementById('app');
 * clearElement(container); // Safe alternative to container.innerHTML = ''
 * ```
 */
export function clearElement(element: Element | null): void {
  if (!element) return;

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Safely replaces the content of a container with a new element.
 * This is the safe alternative to `container.innerHTML = htmlString`
 *
 * @param container - The container element
 * @param newElement - The new element to insert
 *
 * @example
 * ```typescript
 * const container = document.getElementById('app');
 * const newContent = document.createElement('div');
 * newContent.textContent = 'Hello';
 *
 * replaceContent(container, newContent);
 * ```
 */
export function replaceContent(container: Element | null, newElement: HTMLElement): void {
  if (!container) return;

  clearElement(container);
  container.appendChild(newElement);
}

/**
 * Adds HTMS-generated content to a container element.
 * This is the recommended way to dynamically add HTMS templates to the DOM.
 *
 * @param container - The container element (or selector string)
 * @param templateFunction - An HTMS-generated template function
 * @param context - The context object to pass to the template
 * @param options - Options for how to add the content
 *
 * @example
 * ```typescript
 * import { HomePage } from './generated/templates';
 *
 * // Add to element
 * const container = document.getElementById('app');
 * addHtms(container, HomePage, { user: 'John' });
 *
 * // Or use selector
 * addHtms('#app', HomePage, { user: 'John' });
 *
 * // Append instead of replace
 * addHtms(container, HomePage, context, { mode: 'append' });
 * ```
 */
export function addHtms<T extends Record<string, unknown>>(
  container: Element | string | null,
  templateFunction: (ctx: T) => HTMLElement,
  context: T,
  options: { mode?: 'replace' | 'append' } = {}
): void {
  const { mode = 'replace' } = options;

  // Resolve container
  let element: Element | null = null;
  if (typeof container === 'string') {
    element = document.querySelector(container);
    if (!element) {
      console.error(`addHtms: Container not found: "${container}"`);
      return;
    }
  } else {
    element = container;
  }

  if (!element) {
    console.error('addHtms: Container element is null');
    return;
  }

  // Generate element from template
  const newElement = templateFunction(context);

  // Add to DOM
  if (mode === 'replace') {
    clearElement(element);
    element.appendChild(newElement);
  } else {
    element.appendChild(newElement);
  }
}

/**
 * Safely sets text content. This is the safe alternative to innerHTML for text.
 *
 * @param element - The element to update
 * @param text - The text to set
 *
 * @example
 * ```typescript
 * const div = document.createElement('div');
 * setText(div, 'Hello World'); // Safe alternative to div.innerHTML = 'Hello World'
 * ```
 */
export function setText(element: Element | null, text: string): void {
  if (!element) return;
  element.textContent = text;
}

/**
 * Installs the innerHTML warning system.
 * This patches Element.prototype.innerHTML to warn when it's used.
 *
 * Call this once at app startup to enable warnings in development.
 *
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * // In your main.ts
 * if (import.meta.env.DEV) {
 *   installInnerHTMLWarning();
 * }
 * ```
 */
export function installInnerHTMLWarning(options: {
  enabled?: boolean;
  throwError?: boolean;
} = {}): void {
  const { enabled = true, throwError = false } = options;

  if (!enabled) return;

  // Store original descriptor
  const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (!originalDescriptor) return;

  // Create new descriptor with warnings
  Object.defineProperty(Element.prototype, 'innerHTML', {
    get: originalDescriptor.get,
    set: function(this: Element, value: string) {
      // Get stack trace
      const stack = new Error().stack || '';
      const stackLines = stack.split('\n');
      const callerLine = stackLines[2] || stackLines[1] || 'unknown';

      // Warn about innerHTML usage
      warnInnerHTML(this, callerLine);

      if (throwError) {
        throw new Error(
          'innerHTML usage is not allowed! Use appendChild, addHtms, or clearElement instead.'
        );
      }

      // Still allow it, but warn
      if (originalDescriptor.set) {
        originalDescriptor.set.call(this, value);
      }
    },
    configurable: true,
    enumerable: true
  });
}

/**
 * Uninstalls the innerHTML warning system.
 * This restores the original innerHTML behavior.
 */
export function uninstallInnerHTMLWarning(): void {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (originalDescriptor) {
    delete (Element.prototype as any).innerHTML;
  }
}

// Export a namespace for convenience
export const DOM = {
  clearElement,
  replaceContent,
  addHtms,
  setText,
  installInnerHTMLWarning,
  uninstallInnerHTMLWarning
};

export default DOM;
