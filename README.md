# StoneScriptUI Scaffold

A minimal starter template for building web applications with **HTMS** (HTM Script) - a declarative language that compiles to TypeScript with pure DOM API calls.

## Quick Start

```bash
# Clone this scaffold
git clone https://github.com/progalaxyelabs/stonescriptui-scaffold.git my-app
cd my-app

# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What is HTMS?

HTMS is a modern, declarative language that compiles to TypeScript with pure DOM API calls. It combines HTML's declarative syntax with compile-time validation and type safety.

**Key Features:**
- Compile-time safety - Component references validated at compile time
- Zero runtime - Compiles to vanilla TypeScript/JavaScript
- DOM API first - No innerHTML, no XSS vulnerabilities
- Hot module reload - Instant updates during development
- Framework agnostic - Works with any backend or frontend setup

## Development Workflow

### Hot Reload (Automatic)

When you run `npm run dev`, HTMS files are automatically watched and recompiled on changes:

1. Edit your `.htms` file
2. Save
3. Browser updates **automatically** (no manual refresh needed)

This happens in two ways:
- **HTMS Compiler** watches `.htms` files and regenerates TypeScript
- **Vite Plugin** triggers hot module reload when generated files change

### Manual Compilation

```bash
# Compile once
npm run compile

# Compile and watch for changes
htms compile src/app.htms -o src/generated/ --watch
```

## Project Structure

```
my-app/
├── src/
│   ├── app.htms           # Your app definition (pages, components)
│   ├── actions.ts         # Event handlers and business logic
│   ├── main.ts            # Entry point
│   ├── styles.css         # Your styles
│   └── generated/         # Auto-generated (DO NOT EDIT)
│       ├── templates.ts   # Compiled render functions
│       ├── router.ts      # SPA routing
│       └── events.ts      # Event system
├── index.html
├── package.json
└── vite.config.ts
```

**Important:** The `src/generated/` directory is auto-generated. Never edit these files manually - they will be overwritten on next compile.

## HTMS Syntax Reference

### Basic Elements

```htms
page home "/" {
  div [class: "container"] {
    h1 { {{ "Hello World" }} }
    p { {{ "Welcome to HTMS" }} }

    // Self-closing elements
    img [src: "/logo.png", alt: "Logo"]
    input [type: "text", placeholder: "Enter name"]
  }
}
```

**Syntactic Sugar for Simple Text:**

When an element only contains text, you can omit the body braces:

```htms
// Full syntax
button [type: "submit"] { {{ "Submit" }} }

// Shorthand (same result)
button [type: "submit"] {{ "Submit" }}

// Works without attributes too
h1 {{ "Title" }}
p {{ "Paragraph text" }}
```

### Components

Create reusable components:

```htms
component Button(text: string, variant: string) {
  button [
    class: "btn btn-" + variant,
    data-action: "handleClick",
    data-event: "click"
  ] {
    {{ text }}
  }
}

page home "/" {
  div {
    Button(text: "Submit", variant: "primary")
    Button(text: "Cancel", variant: "secondary")
  }
}
```

### Conditional Rendering

```htms
page dashboard "/" {
  div {
    @if ctx.isLoggedIn {
      p { {{ "Welcome, " + ctx.user.name }} }
      button [data-action: "logout", data-event: "click"] { {{ "Logout" }} }
    } @else {
      p { {{ "Please log in" }} }
      button [data-action: "login", data-event: "click"] { {{ "Login" }} }
    }
  }
}
```

### List Rendering

```htms
page todos "/" {
  div [class: "todo-list"] {
    @each ctx.todos as todo, index {
      div [class: "todo-item"] {
        span { {{ index + 1 }}. {{ todo.title }} }

        @if todo.completed {
          span [class: "badge"] { {{ "Done" }} }
        }
      }
    }
  }
}
```

### Event Handling

**CRITICAL:** HTMS does NOT support inline event handlers like `onclick: "myFunction()"`.

Instead, use the **data-action pattern**:

```htms
// ❌ WRONG - This will be silently stripped
button [onclick: "handleClick()"] { {{ "Click Me" }} }

// ✅ CORRECT - Use data-action and data-event
button [
  data-action: "handleClick",
  data-event: "click"
] { {{ "Click Me" }} }
```

Then define the action in `src/actions.ts`:

```typescript
// src/actions.ts
export const actions = {
  handleClick(event: Event, ctx: Context) {
    console.log('Button clicked!');
    // Update state
    ctx.counter++;
    // Trigger re-render
    ctx.rerender();
  },

  handleInput(event: Event, ctx: Context) {
    const input = event.target as HTMLInputElement;
    ctx.username = input.value;
  }
};
```

### Form Handling

```htms
page contact "/" {
  form [data-action: "submitForm", data-event: "submit"] {
    div {
      label [for: "email"] { {{ "Email:" }} }
      input [
        type: "email",
        id: "email",
        name: "email",
        required: "true",
        bind: ctx.email
      ]
    }

    div {
      label [for: "message"] { {{ "Message:" }} }
      textarea [
        id: "message",
        name: "message",
        rows: "5",
        bind: ctx.message
      ]
    }

    button [type: "submit"] { {{ "Send" }} }
  }
}
```

In `actions.ts`:

```typescript
export const actions = {
  async submitForm(event: Event, ctx: Context) {
    event.preventDefault();

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ctx.email,
        message: ctx.message
      })
    });

    if (response.ok) {
      alert('Message sent!');
      ctx.email = '';
      ctx.message = '';
      ctx.rerender();
    }
  }
};
```

## Routing

### Hash-Based Routing (Default)

HTMS uses hash-based routing by default (`#/`, `#/about`, etc.):

```htms
page home "/" {
  nav {
    a [href: "#/"] { {{ "Home" }} }
    a [href: "#/about"] { {{ "About" }} }
    a [href: "#/contact"] { {{ "Contact" }} }
  }

  main {
    h1 { {{ "Home Page" }} }
  }
}

page about "/about" {
  main {
    h1 { {{ "About Us" }} }
  }
}

page contact "/contact" {
  main {
    h1 { {{ "Contact" }} }
  }
}
```

### Programmatic Navigation

```typescript
// In actions.ts
export const actions = {
  goToAbout() {
    window.location.hash = '#/about';
  },

  goBack() {
    window.history.back();
  }
};
```

### Route Parameters

Currently, HTMS does not support dynamic route parameters like `/users/:id`. For this, you can:

1. Use query parameters: `#/user?id=123`
2. Parse manually in your action handlers

```typescript
export const actions = {
  viewUser(event: Event, ctx: Context) {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    // Fetch user data...
  }
};
```

## Context and State Management

The `ctx` (context) object holds your application state:

```typescript
// Define your context type
interface Context {
  user: { name: string; email: string };
  todos: Array<{ title: string; completed: boolean }>;
  isLoggedIn: boolean;

  // Methods
  rerender: () => void;
}

// Initialize context
const initialContext: Context = {
  user: { name: '', email: '' },
  todos: [],
  isLoggedIn: false,
  rerender: () => router.render()
};
```

### Updating State

```typescript
export const actions = {
  addTodo(event: Event, ctx: Context) {
    ctx.todos.push({
      title: ctx.newTodoTitle,
      completed: false
    });

    ctx.newTodoTitle = ''; // Clear input
    ctx.rerender(); // Trigger re-render
  }
};
```

## Supported HTML Attributes

### Common Attributes
- `id` - Element ID
- `class` - CSS classes
- `style` - Inline styles
- `title` - Tooltip text
- `data-*` - Custom data attributes (use for event handling)

### Link/Image Attributes
- `href` - Link URL
- `src` - Image/script source
- `alt` - Alternative text

### Form Attributes
- `type` - Input type (text, email, password, number, etc.)
- `name` - Form field name
- `value` - Field value
- `placeholder` - Placeholder text
- `required` - Required field (boolean)
- `disabled` - Disabled field (boolean)
- `readonly` - Read-only field (boolean)
- `checked` - Checkbox checked state (boolean)
- `selected` - Select option selected (boolean)
- `multiple` - Multiple selection (boolean)
- `pattern` - Validation pattern
- `minlength`/`maxlength` - Text length constraints
- `min`/`max` - Number constraints
- `step` - Number step
- `rows`/`cols` - Textarea dimensions
- `bind` - Two-way data binding

### Event Attributes (use data-action instead)
- ❌ `onclick`, `onchange`, `onsubmit` - NOT SUPPORTED
- ✅ Use `data-action` and `data-event` instead

## Scripts

```bash
# Development
npm run dev          # Start dev server with watch mode and HMR
npm run compile      # Compile HTMS once

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Manual compilation
htms compile src/app.htms -o src/generated/              # Compile once
htms compile src/app.htms -o src/generated/ --watch      # Watch mode
htms check src/app.htms                                   # Check for errors
```

## Building a Real Application

### Example: Todo App

**1. Define your context:**

```typescript
// src/main.ts
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface Context {
  todos: Todo[];
  newTodoTitle: string;
  rerender: () => void;
}
```

**2. Create your HTMS file:**

```htms
// src/app.htms
page home "/" {
  div [class: "container"] {
    h1 { {{ "My Todos" }} }

    // Add todo form
    form [data-action: "addTodo", data-event: "submit"] {
      input [
        type: "text",
        bind: ctx.newTodoTitle,
        placeholder: "Enter new todo",
        required: "true"
      ]
      button [type: "submit"] { {{ "Add" }} }
    }

    // Todo list
    div [class: "todo-list"] {
      @each ctx.todos as todo, index {
        div [class: "todo-item"] {
          input [
            type: "checkbox",
            checked: todo.completed,
            data-action: "toggleTodo",
            data-event: "change",
            data-index: index
          ]

          span [
            class: todo.completed ? "completed" : ""
          ] {
            {{ todo.title }}
          }

          button [
            data-action: "deleteTodo",
            data-event: "click",
            data-index: index
          ] {
            {{ "Delete" }}
          }
        }
      }
    }
  }
}
```

**3. Implement actions:**

```typescript
// src/actions.ts
export const actions = {
  addTodo(event: Event, ctx: Context) {
    event.preventDefault();

    ctx.todos.push({
      id: Date.now(),
      title: ctx.newTodoTitle,
      completed: false
    });

    ctx.newTodoTitle = '';
    ctx.rerender();
  },

  toggleTodo(event: Event, ctx: Context) {
    const checkbox = event.target as HTMLInputElement;
    const index = parseInt(checkbox.dataset.index || '0');
    ctx.todos[index].completed = checkbox.checked;
    ctx.rerender();
  },

  deleteTodo(event: Event, ctx: Context) {
    const button = event.target as HTMLButtonElement;
    const index = parseInt(button.dataset.index || '0');
    ctx.todos.splice(index, 1);
    ctx.rerender();
  }
};
```

## API Integration

### Fetching Data

```typescript
// src/actions.ts
export const actions = {
  async loadTodos(ctx: Context) {
    const response = await fetch('https://api.example.com/todos');
    const data = await response.json();

    ctx.todos = data;
    ctx.rerender();
  },

  async saveTodo(event: Event, ctx: Context) {
    const response = await fetch('https://api.example.com/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: ctx.newTodoTitle })
    });

    if (response.ok) {
      await this.loadTodos(ctx);
    }
  }
};
```

## Styling

HTMS works with any CSS approach:

### Plain CSS

```css
/* src/styles.css */
.todo-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
}

.todo-item.completed {
  text-decoration: line-through;
  opacity: 0.6;
}
```

### CSS Frameworks

```htms
// Use Bootstrap, Tailwind, or any CSS framework
div [class: "container mx-auto p-4"] {
  button [class: "btn btn-primary"] { {{ "Click Me" }} }
}
```

## Security: innerHTML Warnings

StoneScriptUI includes built-in protection against XSS vulnerabilities caused by `innerHTML`.

### Automatic Warnings

In development mode, you'll see console warnings when `innerHTML` is used:

```typescript
// ❌ This triggers a warning
element.innerHTML = '<div>Hello</div>';
```

**Warning message:**
```
⚠️ StoneScriptUI Warning: innerHTML detected

Avoid using innerHTML - it can cause XSS vulnerabilities!
Use: appendChild, addHtms, or textContent instead
```

### Safe Alternatives

**Instead of innerHTML, use:**

```typescript
import { addHtms, clearElement, setText } from './dom-utils';
import { TodoList } from './generated/templates';

// ✅ Add HTMS template (recommended)
addHtms('#todoList', TodoList, { todos: myTodos });

// ✅ Clear element safely
clearElement(element);

// ✅ Set text content
setText(element, 'Hello World');

// ✅ Use DOM API
const div = document.createElement('div');
div.textContent = 'Hello';
element.appendChild(div);
```

### When innerHTML is OK

```typescript
// ✅ Clearing is safe
element.innerHTML = '';

// But this is more explicit
clearElement(element);
```

### Learn More

See [SECURITY-GUIDE.md](SECURITY-GUIDE.md) for:
- Why innerHTML is dangerous
- Complete migration examples
- How to refactor existing code
- XSS prevention best practices

## Troubleshooting

### Events Don't Work

❌ **Problem:** Using inline event handlers
```htms
button [onclick: "myFunction()"] { {{ "Click" }} }
```

✅ **Solution:** Use data-action pattern
```htms
button [data-action: "myFunction", data-event: "click"] { {{ "Click" }} }
```

### Changes Not Showing

1. Check that `npm run dev` is running
2. Check the terminal for compilation errors
3. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
4. Check that files are saved

### Type Errors

If you see TypeScript errors about the Vite plugin, make sure `src/vite-env.d.ts` includes the module declaration for `@progalaxyelabs/htms-cli/vite`.

## Best Practices

1. **Keep components small** - Each component should do one thing
2. **Use meaningful action names** - `submitForm` is better than `handleClick`
3. **Validate user input** - Use HTML5 validation attributes
4. **Handle errors gracefully** - Use try/catch in async actions
5. **Keep context simple** - Don't store derived data in context
6. **Use CSS for styling** - HTMS focuses on structure, not styles
7. **Type your context** - Define TypeScript interfaces for type safety

## Next Steps

- Read the [HTMS Language Reference](https://github.com/progalaxyelabs/htms)
- Explore the [StoneScriptUI Philosophy](https://github.com/progalaxyelabs/stonescriptui/blob/main/PHILOSOPHY.md)
- Check out example projects (coming soon)
- Join the community discussions

## Documentation

- [HTMS GitHub](https://github.com/progalaxyelabs/htms)
- [StoneScriptUI](https://github.com/progalaxyelabs/stonescriptui)
- [Report Issues](https://github.com/progalaxyelabs/stonescriptui/issues)

## License

MIT © ProGalaxy Labs
