import { installInnerHTMLWarning } from './dom-utils';
import { actions, initializeContext } from './actions';
import { renderTodoApp } from './manual-render';

// Enable innerHTML warnings in development
if (import.meta.env.DEV) {
  installInnerHTMLWarning({
    enabled: true,
    throwError: false // Set to true to prevent innerHTML completely
  });
}

// Initialize context with todos from localStorage
const context = initializeContext();

// Render function
function render() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Clear and render
  appContainer.innerHTML = '';
  const appElement = renderTodoApp(context);
  appContainer.appendChild(appElement);
}

// Set rerender function
context.rerender = render;

// Event delegation system for data-action attributes
document.addEventListener('DOMContentLoaded', () => {
  // Initial render
  render();

  // Click events
  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const actionName = target.dataset.action;
    if (actionName && target.dataset.event === 'click') {
      const action = actions[actionName as keyof typeof actions];
      if (action) {
        action(e, context);
      }
    }
  });

  // Change events (for checkboxes)
  document.body.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    const actionName = target.dataset.action;
    if (actionName && target.dataset.event === 'change') {
      const action = actions[actionName as keyof typeof actions];
      if (action) {
        action(e, context);
      }
    }
  });

  // Handle Enter key in input for better UX
  document.body.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.id === 'todoInput') {
        actions.addTodo(e, context);
      }
    }
  });
});
