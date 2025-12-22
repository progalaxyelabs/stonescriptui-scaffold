# Security Guide: Avoiding innerHTML XSS Vulnerabilities

## Why innerHTML is Dangerous

Using `innerHTML` to build UI with user data or API responses can lead to **Cross-Site Scripting (XSS)** vulnerabilities, even if you think you're escaping the data.

### Common Mistake

```typescript
// ❌ DANGEROUS - XSS vulnerability!
function renderTodos(todos) {
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = todos.map(todo => `
    <div class="todo-item">
      <span>${escapeHtml(todo.title)}</span>
      <button onclick="deleteTodo(${todo.id})">Delete</button>
    </div>
  `).join('');
}
```

**Why this is dangerous:**
1. Even with `escapeHtml()`, the `onclick` attribute creates attack vectors
2. If `todo.id` contains malicious code like `'); alert('XSS'); //`, it executes
3. Browser parsing can be exploited in unexpected ways
4. Future code changes might forget to escape new fields

---

## StoneScriptUI Solution

StoneScriptUI automatically protects you by:
1. **Warning system** - Alerts you when you use innerHTML
2. **addHtms() helper** - Safe way to add HTMS templates dynamically
3. **DOM API only** - HTMS compiles to pure DOM manipulation

---

## When innerHTML is Detected

When you run `npm run dev`, StoneScriptUI monitors innerHTML usage:

```typescript
// This will trigger a warning in the console:
element.innerHTML = '<div>Hello</div>';
```

**Console output:**
```
⚠️ StoneScriptUI Warning: innerHTML detected

❌ Avoid using innerHTML - it can cause XSS vulnerabilities!

Instead, use one of these safe alternatives:
  1. element.appendChild(childElement)
  2. addHtms(container, templateFunction, context)
  3. element.textContent = "text" (for text only)

Element: <div id="todoList">...</div>
```

---

## Safe Alternatives

### 1. Use HTMS Templates (Recommended)

**Step 1:** Define your UI in `.htms` file

```htms
// src/app.htms
component TodoItem(todo: Todo) {
  div [class: "todo-item " + (todo.completed ? "completed" : "")] {
    input [
      type: "checkbox",
      checked: todo.completed,
      data-action: "toggleTodo",
      data-event: "change",
      data-id: todo.id
    ]
    span [class: "todo-title"] { {{ todo.title }} }
    @if todo.description {
      span [class: "todo-desc"] { {{ todo.description }} }
    }
    button [
      class: "delete-btn",
      data-action: "deleteTodo",
      data-event: "click",
      data-id: todo.id
    ] {
      {{ "Delete" }}
    }
  }
}

component TodoList(todos: Todo[]) {
  div [id: "todoList"] {
    @if todos.length == 0 {
      p [class: "empty"] { {{ "No todos yet. Add one above!" }} }
    } @else {
      @each todos as todo, index {
        TodoItem(todo: todo)
      }
    }
  }
}
```

**Step 2:** Use `addHtms()` to render dynamically

```typescript
// src/main.ts
import { addHtms } from './dom-utils';
import { TodoList } from './generated/templates';

async function fetchTodos() {
  const response = await fetch(`${API_URL}/api/todos`);
  const data = await response.json();

  if (data.status === 'ok') {
    const todos = Array.isArray(data.data) ? data.data : [];

    // ✅ SAFE - Uses HTMS template
    addHtms('#todoList', TodoList, { todos });
  }
}
```

---

### 2. Use DOM API Directly

```typescript
// ❌ DANGEROUS
todoList.innerHTML = `<p class="empty">No todos yet!</p>`;

// ✅ SAFE - DOM API
import { clearElement, setText } from './dom-utils';

clearElement(todoList);
const p = document.createElement('p');
p.className = 'empty';
setText(p, 'No todos yet!');
todoList.appendChild(p);
```

---

### 3. Use Helper Functions

```typescript
import { clearElement, replaceContent, addHtms } from './dom-utils';

// Clear content safely
clearElement(todoList);

// Replace content with a single element
const newElement = document.createElement('div');
replaceContent(todoList, newElement);

// Add HTMS template
addHtms(todoList, TodoItem, { todo: myTodo });
```

---

## Migration Examples

### Example 1: Simple Text Content

**Before (innerHTML):**
```typescript
❌ todoList.innerHTML = '<p class="empty">No todos yet. Add one above!</p>';
```

**After (DOM API):**
```typescript
✅ import { clearElement } from './dom-utils';

clearElement(todoList);
const p = document.createElement('p');
p.className = 'empty';
p.textContent = 'No todos yet. Add one above!';
todoList.appendChild(p);
```

**Best (HTMS template):**
```typescript
✅ import { addHtms } from './dom-utils';
import { EmptyState } from './generated/templates';

addHtms(todoList, EmptyState, { message: 'No todos yet. Add one above!' });
```

---

### Example 2: List Rendering

**Before (innerHTML with map):**
```typescript
❌ todoList.innerHTML = todos.map(todo => `
  <div class="todo-item ${todo.completed ? 'completed' : ''}">
    <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
    <span>${escapeHtml(todo.title)}</span>
    <button onclick="deleteTodo(${todo.id})">Delete</button>
  </div>
`).join('');
```

**After (HTMS template):**
```typescript
✅ // 1. Define in app.htms
component TodoList(todos: Todo[]) {
  div {
    @each todos as todo, i {
      div [class: "todo-item " + (todo.completed ? "completed" : "")] {
        input [
          type: "checkbox",
          checked: todo.completed,
          data-action: "toggleTodo",
          data-event: "change",
          data-id: todo.id
        ]
        span { {{ todo.title }} }
        button [
          data-action: "deleteTodo",
          data-event: "click",
          data-id: todo.id
        ] {
          {{ "Delete" }}
        }
      }
    }
  }
}

// 2. Use in main.ts
import { addHtms } from './dom-utils';
import { TodoList } from './generated/templates';

function renderTodos() {
  addHtms('#todoList', TodoList, { todos });
}
```

---

### Example 3: Conditional Rendering

**Before (innerHTML):**
```typescript
❌ if (todos.length == 0) {
  todoList.innerHTML = '<p class="empty">No todos yet!</p>';
} else {
  todoList.innerHTML = todos.map(todo => `...`).join('');
}
```

**After (HTMS template with @if):**
```htms
✅ component TodoList(todos: Todo[]) {
  div {
    @if todos.length == 0 {
      p [class: "empty"] { {{ "No todos yet!" }} }
    } @else {
      @each todos as todo, i {
        div [class: "todo-item"] {
          span { {{ todo.title }} }
        }
      }
    }
  }
}
```

```typescript
✅ import { addHtms } from './dom-utils';
import { TodoList } from './generated/templates';

addHtms('#todoList', TodoList, { todos });
```

---

## Complete Migration Example

Here's a complete before/after showing how to migrate a todo app:

### Before: Using innerHTML (DANGEROUS)

```typescript
// ❌ main.ts - DANGEROUS CODE
let todos: any[] = [];

function renderTodos() {
  const todoList = document.getElementById('todoList');
  if (!todoList) return;

  if (todos.length === 0) {
    todoList.innerHTML = '<p class="empty">No todos yet!</p>';
    return;
  }

  todoList.innerHTML = todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <input type="checkbox" ${todo.completed ? 'checked' : ''}
             onchange="toggleTodo(${todo.id})">
      <span>${escapeHtml(todo.title)}</span>
      <button onclick="deleteTodo(${todo.id})">Delete</button>
    </div>
  `).join('');
}

async function toggleTodo(id: number) {
  // Update todo...
  await fetchTodos();
}

async function deleteTodo(id: number) {
  // Delete todo...
  await fetchTodos();
}

// Make functions global for onclick
(window as any).toggleTodo = toggleTodo;
(window as any).deleteTodo = deleteTodo;
```

### After: Using HTMS (SAFE)

```htms
<!-- ✅ app.htms - SAFE -->
component TodoItem(todo: Todo, index: number) {
  div [class: "todo-item " + (todo.completed ? "completed" : "")] {
    input [
      type: "checkbox",
      checked: todo.completed,
      data-action: "toggleTodo",
      data-event: "change",
      data-id: todo.id
    ]
    span [class: "todo-title"] { {{ todo.title }} }
    button [
      class: "delete-btn",
      data-action: "deleteTodo",
      data-event: "click",
      data-id: todo.id
    ] {
      {{ "Delete" }}
    }
  }
}

page home "/" {
  div [class: "container"] {
    div [id: "todoList"] {
      @if ctx.todos.length === 0 {
        p [class: "empty"] { {{ "No todos yet. Add one above!" }} }
      } @else {
        @each ctx.todos as todo, index {
          TodoItem(todo: todo, index: index)
        }
      }
    }
  }
}
```

```typescript
// ✅ main.ts - SAFE
import { getContext, setContext, rerender } from './generated/router';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface AppContext {
  todos: Todo[];
}

// Initialize context
setContext({ todos: [] });

async function fetchTodos() {
  const response = await fetch(`${API_URL}/api/todos`);
  const data = await response.json();

  if (data.status === 'ok') {
    const ctx = getContext() as AppContext;
    ctx.todos = Array.isArray(data.data) ? data.data : [];
    rerender(); // Automatically re-renders using HTMS templates
  }
}

// Export actions (no need for window global pollution)
export const actions = {
  async toggleTodo(event: Event) {
    const input = event.target as HTMLInputElement;
    const id = parseInt(input.dataset.id || '0');

    await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: input.checked })
    });

    await fetchTodos();
  },

  async deleteTodo(event: Event) {
    const button = event.target as HTMLButtonElement;
    const id = parseInt(button.dataset.id || '0');

    await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE'
    });

    await fetchTodos();
  }
};

// Load on startup
document.addEventListener('DOMContentLoaded', fetchTodos);
```

---

## When innerHTML = '' is OK

Clearing content with `innerHTML = ''` is safe:

```typescript
// ✅ This is fine - just clearing
element.innerHTML = '';

// ✅ But this is better (more explicit)
import { clearElement } from './dom-utils';
clearElement(element);
```

---

## Summary

| Pattern | Security | Recommendation |
|---------|----------|----------------|
| `innerHTML = '<div>...</div>'` | ❌ Dangerous | Never use |
| `innerHTML = userInput` | ❌ Very Dangerous | Never use |
| `innerHTML = ''` | ✅ Safe | OK, but use `clearElement()` |
| `element.textContent = text` | ✅ Safe | Good for text |
| `element.appendChild(child)` | ✅ Safe | Good |
| `addHtms(container, template, ctx)` | ✅ Safe | **Best** |

---

## Disabling Warnings

If you understand the risks and want to disable warnings:

```typescript
// main.ts
import { installInnerHTMLWarning } from './dom-utils';

// Don't install warnings (not recommended)
if (import.meta.env.DEV) {
  installInnerHTMLWarning({ enabled: false });
}

// Or make it throw errors instead of warnings
if (import.meta.env.DEV) {
  installInnerHTMLWarning({
    enabled: true,
    throwError: true // Completely prevent innerHTML
  });
}
```

---

## Learn More

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: innerHTML Security Considerations](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations)
- [StoneScriptUI README](README.md)
- [HTMS Quick Reference](HTMS-QUICK-REFERENCE.md)
