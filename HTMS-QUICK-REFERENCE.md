# HTMS Quick Reference

A cheat sheet for HTMS syntax and common patterns.

## Table of Contents
- [Basic Syntax](#basic-syntax)
- [Components](#components)
- [Conditionals](#conditionals)
- [Lists](#lists)
- [Events](#events)
- [Forms](#forms)
- [Routing](#routing)
- [Common Patterns](#common-patterns)

## Basic Syntax

### Page Definition
```htms
page home "/" {
  div { {{ "Hello World" }} }
}
```

### Elements with Attributes
```htms
div [id: "main", class: "container"] {
  h1 [class: "title"] { {{ "Title" }} }
  img [src: "/logo.png", alt: "Logo"]
  a [href: "#/about"] { {{ "About" }} }
}
```

### Text Interpolation
```htms
// Static text
p { {{ "Hello" }} }

// Context variable
p { {{ ctx.username }} }

// Expression
p { {{ "Hello, " + ctx.user.name }} }
```

### Syntactic Sugar
```htms
// Full syntax
button [type: "submit"] { {{ "Submit" }} }

// Shorthand - omit braces for simple text
button [type: "submit"] {{ "Submit" }}

// Works without attributes
h1 {{ "Title" }}
p {{ ctx.message }}
```

## Components

### Define a Component
```htms
component Card(title: string, content: string) {
  div [class: "card"] {
    h2 { {{ title }} }
    p { {{ content }} }
  }
}
```

### Use a Component
```htms
page home "/" {
  Card(title: "Welcome", content: "This is a card")
}
```

## Conditionals

### If/Else
```htms
@if ctx.isLoggedIn {
  p { {{ "Welcome back!" }} }
} @else {
  p { {{ "Please log in" }} }
}
```

### Using Context Properties
```htms
@if ctx.user.role == "admin" {
  button [data-action: "deleteAll", data-event: "click"] {
    {{ "Delete All" }}
  }
}
```

## Lists

### Basic Loop
```htms
@each ctx.items as item, index {
  div { {{ index }}. {{ item }} }
}
```

### Loop with Objects
```htms
@each ctx.users as user, i {
  div [class: "user-card"] {
    h3 { {{ user.name }} }
    p { {{ user.email }} }
  }
}
```

### Nested Loops
```htms
@each ctx.categories as category, catIndex {
  div {
    h2 { {{ category.name }} }

    @each category.items as item, itemIndex {
      p { {{ item.title }} }
    }
  }
}
```

## Events

### Button Click
```htms
button [
  data-action: "handleClick",
  data-event: "click"
] {
  {{ "Click Me" }}
}
```

In `actions.ts`:
```typescript
export const actions = {
  handleClick(event: Event, ctx: Context) {
    console.log('Clicked!');
    ctx.rerender();
  }
};
```

### Input Change
```htms
input [
  type: "text",
  data-action: "handleInput",
  data-event: "input",
  bind: ctx.searchQuery
]
```

```typescript
export const actions = {
  handleInput(event: Event, ctx: Context) {
    const input = event.target as HTMLInputElement;
    ctx.searchQuery = input.value;
    ctx.rerender();
  }
};
```

### Form Submit
```htms
form [data-action: "submitForm", data-event: "submit"] {
  input [type: "text", bind: ctx.username]
  button [type: "submit"] { {{ "Submit" }} }
}
```

```typescript
export const actions = {
  submitForm(event: Event, ctx: Context) {
    event.preventDefault();
    console.log('Submitted:', ctx.username);
  }
};
```

### Passing Data with Events
```htms
@each ctx.todos as todo, index {
  button [
    data-action: "deleteTodo",
    data-event: "click",
    data-id: todo.id,
    data-index: index
  ] {
    {{ "Delete" }}
  }
}
```

```typescript
export const actions = {
  deleteTodo(event: Event, ctx: Context) {
    const button = event.target as HTMLButtonElement;
    const id = parseInt(button.dataset.id || '0');
    const index = parseInt(button.dataset.index || '0');

    ctx.todos.splice(index, 1);
    ctx.rerender();
  }
};
```

## Forms

### Text Input
```htms
input [
  type: "text",
  id: "username",
  name: "username",
  placeholder: "Enter username",
  required: "true",
  bind: ctx.username
]
```

### Email Input
```htms
input [
  type: "email",
  id: "email",
  required: "true",
  pattern: "^[^@]+@[^@]+\.[^@]+$",
  bind: ctx.email
]
```

### Number Input
```htms
input [
  type: "number",
  min: "0",
  max: "100",
  step: "5",
  bind: ctx.quantity
]
```

### Textarea
```htms
textarea [
  id: "message",
  rows: "5",
  cols: "40",
  placeholder: "Enter message",
  bind: ctx.message
]
```

### Checkbox
```htms
input [
  type: "checkbox",
  id: "agree",
  checked: ctx.agreed,
  data-action: "toggleAgree",
  data-event: "change"
]
label [for: "agree"] { {{ "I agree" }} }
```

### Select Dropdown
```htms
select [
  id: "country",
  data-action: "selectCountry",
  data-event: "change"
] {
  @each ctx.countries as country, i {
    option [
      value: country.code,
      selected: country.code == ctx.selectedCountry
    ] {
      {{ country.name }}
    }
  }
}
```

### Complete Form Example
```htms
form [data-action: "submitContact", data-event: "submit"] {
  div {
    label [for: "name"] { {{ "Name:" }} }
    input [
      type: "text",
      id: "name",
      required: "true",
      bind: ctx.formData.name
    ]
  }

  div {
    label [for: "email"] { {{ "Email:" }} }
    input [
      type: "email",
      id: "email",
      required: "true",
      bind: ctx.formData.email
    ]
  }

  div {
    label [for: "message"] { {{ "Message:" }} }
    textarea [
      id: "message",
      required: "true",
      rows: "5",
      bind: ctx.formData.message
    ]
  }

  button [type: "submit"] { {{ "Send" }} }
}
```

## Routing

### Define Pages
```htms
page home "/" {
  h1 { {{ "Home" }} }
}

page about "/about" {
  h1 { {{ "About" }} }
}

page contact "/contact" {
  h1 { {{ "Contact" }} }
}
```

### Navigation Links
```htms
nav {
  a [href: "#/"] { {{ "Home" }} }
  a [href: "#/about"] { {{ "About" }} }
  a [href: "#/contact"] { {{ "Contact" }} }
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
  },

  navigateAfterSave(event: Event, ctx: Context) {
    // Save data...
    window.location.hash = '#/success';
  }
};
```

## Common Patterns

### Loading State
```htms
@if ctx.isLoading {
  p { {{ "Loading..." }} }
} @else {
  div { {{ ctx.content }} }
}
```

### Empty State
```htms
@if ctx.items.length == 0 {
  p [class: "empty-state"] { {{ "No items found" }} }
} @else {
  @each ctx.items as item, i {
    div { {{ item.name }} }
  }
}
```

### Error Handling
```htms
@if ctx.error {
  div [class: "alert alert-danger"] {
    {{ ctx.error }}
  }
}
```

### Conditional CSS Classes
```htms
button [
  class: ctx.isActive ? "btn btn-primary" : "btn btn-secondary"
] {
  {{ "Toggle" }}
}
```

### Modal/Dialog
```htms
@if ctx.showModal {
  div [class: "modal-overlay"] {
    div [class: "modal"] {
      h2 { {{ ctx.modalTitle }} }
      p { {{ ctx.modalContent }} }

      button [
        data-action: "closeModal",
        data-event: "click"
      ] {
        {{ "Close" }}
      }
    }
  }
}
```

### Search/Filter
```htms
div {
  input [
    type: "search",
    placeholder: "Search...",
    data-action: "handleSearch",
    data-event: "input",
    bind: ctx.searchQuery
  ]

  div [class: "results"] {
    @each ctx.filteredResults as result, i {
      div { {{ result.title }} }
    }
  }
}
```

```typescript
export const actions = {
  handleSearch(event: Event, ctx: Context) {
    const input = event.target as HTMLInputElement;
    ctx.searchQuery = input.value.toLowerCase();

    ctx.filteredResults = ctx.allResults.filter(item =>
      item.title.toLowerCase().includes(ctx.searchQuery)
    );

    ctx.rerender();
  }
};
```

### Tabs
```htms
div [class: "tabs"] {
  button [
    class: ctx.activeTab == "profile" ? "active" : "",
    data-action: "switchTab",
    data-event: "click",
    data-tab: "profile"
  ] {
    {{ "Profile" }}
  }

  button [
    class: ctx.activeTab == "settings" ? "active" : "",
    data-action: "switchTab",
    data-event: "click",
    data-tab: "settings"
  ] {
    {{ "Settings" }}
  }
}

div [class: "tab-content"] {
  @if ctx.activeTab == "profile" {
    div { {{ "Profile content" }} }
  }

  @if ctx.activeTab == "settings" {
    div { {{ "Settings content" }} }
  }
}
```

```typescript
export const actions = {
  switchTab(event: Event, ctx: Context) {
    const button = event.target as HTMLButtonElement;
    ctx.activeTab = button.dataset.tab || 'profile';
    ctx.rerender();
  }
};
```

### API Integration
```typescript
// Load data on page load
export const actions = {
  async loadUsers(ctx: Context) {
    ctx.isLoading = true;
    ctx.rerender();

    try {
      const response = await fetch('https://api.example.com/users');
      const data = await response.json();

      ctx.users = data;
      ctx.error = null;
    } catch (err) {
      ctx.error = 'Failed to load users';
    } finally {
      ctx.isLoading = false;
      ctx.rerender();
    }
  },

  async createUser(event: Event, ctx: Context) {
    event.preventDefault();

    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ctx.newUserName,
        email: ctx.newUserEmail
      })
    });

    if (response.ok) {
      await this.loadUsers(ctx); // Reload list
    }
  }
};
```

## Important Rules

### ❌ Don't Use These

```htms
// Inline event handlers - NOT SUPPORTED
button [onclick: "myFunction()"] { {{ "Wrong" }} }
button [onchange: "handleChange()"] { {{ "Wrong" }} }

// HTML onclick attribute - NOT SUPPORTED
<button onclick="handleClick()">Wrong</button>
```

### ✅ Use These Instead

```htms
// data-action pattern
button [
  data-action: "myFunction",
  data-event: "click"
] { {{ "Correct" }} }

input [
  data-action: "handleChange",
  data-event: "change"
]
```

## Context Object

The context (`ctx`) is your application state:

```typescript
interface Context {
  // Data
  user: User;
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  // UI state
  showModal: boolean;
  activeTab: string;

  // Form data
  formData: {
    name: string;
    email: string;
  };

  // Methods
  rerender: () => void;
}
```

Always call `ctx.rerender()` after modifying state to update the UI.

## Tips

1. **Use TypeScript** - Define interfaces for your context
2. **Keep actions pure** - Don't modify global state directly
3. **Handle errors** - Always use try/catch for async operations
4. **Validate forms** - Use HTML5 validation attributes
5. **Use data attributes** - Pass data to event handlers via `data-*`
6. **Call rerender** - Always call `ctx.rerender()` after state changes
7. **Keep components small** - Each component should have a single responsibility

## More Examples

See the main [README.md](README.md) for complete tutorials and examples.
