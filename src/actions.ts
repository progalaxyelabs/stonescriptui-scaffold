// Actions for Todo App with localStorage

const STORAGE_KEY = 'stonescriptui-todos';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: number;
}

interface Context {
  todos: Todo[];
  newTodoTitle: string;
  completedCount: number;
  rerender: () => void;
}

// Load todos from localStorage
function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
  return [];
}

// Save todos to localStorage
function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
}

// Calculate completed count
function calculateCompletedCount(todos: Todo[]): number {
  return todos.filter(t => t.completed).length;
}

// Export actions for HTMS event handlers
export const actions = {
  addTodo(event: Event, ctx: Context) {
    const title = ctx.newTodoTitle?.trim();
    if (!title) return;

    // Create new todo
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: Date.now()
    };

    // Add to list
    ctx.todos.push(newTodo);
    ctx.newTodoTitle = '';
    ctx.completedCount = calculateCompletedCount(ctx.todos);

    // Save to localStorage
    saveTodos(ctx.todos);

    // Re-render
    ctx.rerender();

    // Clear input
    const input = document.getElementById('todoInput') as HTMLInputElement;
    if (input) input.value = '';
  },

  toggleTodo(event: Event, ctx: Context) {
    const target = event.target as HTMLInputElement;
    const index = parseInt(target.dataset.index || '0');

    if (ctx.todos[index]) {
      ctx.todos[index].completed = target.checked;
      ctx.completedCount = calculateCompletedCount(ctx.todos);

      // Save to localStorage
      saveTodos(ctx.todos);

      // Re-render
      ctx.rerender();
    }
  },

  deleteTodo(event: Event, ctx: Context) {
    const target = event.target as HTMLButtonElement;
    const index = parseInt(target.dataset.index || '0');

    // Remove todo
    ctx.todos.splice(index, 1);
    ctx.completedCount = calculateCompletedCount(ctx.todos);

    // Save to localStorage
    saveTodos(ctx.todos);

    // Re-render
    ctx.rerender();
  },

  clearCompleted(event: Event, ctx: Context) {
    // Filter out completed todos
    ctx.todos = ctx.todos.filter(t => !t.completed);
    ctx.completedCount = calculateCompletedCount(ctx.todos);

    // Save to localStorage
    saveTodos(ctx.todos);

    // Re-render
    ctx.rerender();
  },

  clearAll(event: Event, ctx: Context) {
    if (confirm('Are you sure you want to delete all todos?')) {
      ctx.todos = [];
      ctx.completedCount = 0;

      // Clear localStorage
      saveTodos([]);

      // Re-render
      ctx.rerender();
    }
  }
};

// Initialize context with todos from localStorage
export function initializeContext(): Context {
  return {
    todos: loadTodos(),
    newTodoTitle: '',
    completedCount: calculateCompletedCount(loadTodos()),
    rerender: () => {} // Will be set by router
  };
}
