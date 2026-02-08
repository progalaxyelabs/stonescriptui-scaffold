// Manual rendering functions for todo app
// This bypasses HTMS compiler issues for testing purposes

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface Context {
  todos: Todo[];
  newTodoTitle: string;
  completedCount: number;
  rerender: () => void;
}

export function renderTodoApp(ctx: Context): HTMLElement {
  const container = document.createElement('div');
  container.className = 'container';

  // Header
  const h1 = document.createElement('h1');
  h1.textContent = 'My Todos';
  container.appendChild(h1);

  // Add todo form
  const addTodoDiv = document.createElement('div');
  addTodoDiv.className = 'add-todo';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'todoInput';
  input.placeholder = 'Enter a new todo...';
  input.value = ctx.newTodoTitle || '';
  addTodoDiv.appendChild(input);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = 'Add Todo';
  addBtn.setAttribute('data-action', 'addTodo');
  addBtn.setAttribute('data-event', 'click');
  addTodoDiv.appendChild(addBtn);

  container.appendChild(addTodoDiv);

  // Stats
  const statsDiv = document.createElement('div');
  statsDiv.className = 'stats';
  const statsP = document.createElement('p');
  statsP.textContent = `Total: ${ctx.todos.length} | Completed: ${ctx.completedCount}`;
  statsDiv.appendChild(statsP);
  container.appendChild(statsDiv);

  // Todo list
  const todoListDiv = document.createElement('div');
  todoListDiv.className = 'todo-list';
  todoListDiv.id = 'todoList';

  if (ctx.todos.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'empty-state';
    emptyP.textContent = 'No todos yet. Add one above!';
    todoListDiv.appendChild(emptyP);
  } else {
    ctx.todos.forEach((todo, index) => {
      const todoItem = document.createElement('div');
      todoItem.className = todo.completed ? 'todo-item completed' : 'todo-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('data-action', 'toggleTodo');
      checkbox.setAttribute('data-event', 'change');
      checkbox.setAttribute('data-index', String(index));
      todoItem.appendChild(checkbox);

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = todo.title;
      todoItem.appendChild(textSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('data-action', 'deleteTodo');
      deleteBtn.setAttribute('data-event', 'click');
      deleteBtn.setAttribute('data-index', String(index));
      todoItem.appendChild(deleteBtn);

      todoListDiv.appendChild(todoItem);
    });
  }

  container.appendChild(todoListDiv);

  // Actions (only show if there are todos)
  if (ctx.todos.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    const clearCompletedBtn = document.createElement('button');
    clearCompletedBtn.className = 'secondary-btn';
    clearCompletedBtn.textContent = 'Clear Completed';
    clearCompletedBtn.setAttribute('data-action', 'clearCompleted');
    clearCompletedBtn.setAttribute('data-event', 'click');
    actionsDiv.appendChild(clearCompletedBtn);

    const clearAllBtn = document.createElement('button');
    clearAllBtn.className = 'danger-btn';
    clearAllBtn.textContent = 'Clear All';
    clearAllBtn.setAttribute('data-action', 'clearAll');
    clearAllBtn.setAttribute('data-event', 'click');
    actionsDiv.appendChild(clearAllBtn);

    container.appendChild(actionsDiv);
  }

  return container;
}
