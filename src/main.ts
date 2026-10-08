import "./style.css";
import type { Todo } from "./types";
import { createTodo } from "./todo";
import { loadTodos, saveTodos } from "./storage";

type Filter = "all" | "active" | "completed";

const form = document.querySelector<HTMLFormElement>("#todo-form");
const input = document.querySelector<HTMLInputElement>("#todo-input");
const formMessage =
  document.querySelector<HTMLParagraphElement>("#form-message");
const list = document.querySelector<HTMLUListElement>("#todo-list");

const filterButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-filter]");

if (form === null || input === null || formMessage === null || list === null) {
  throw new Error("Required todo elements were not found.");
}

const todoForm = form;
const todoInput = input;
const messageElement = formMessage;
const todoList = list;

let todos: Todo[] = loadTodos();
let currentFilter: Filter = "all";
let editingTodoId: string | null = null;
let messageTimer: number | undefined;

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    if (
      filter !== "all" &&
      filter !== "active" &&
      filter !== "completed"
    ) {
      return;
    }

    currentFilter = filter;
    editingTodoId = null;
    messageElement.textContent = "";

    filterButtons.forEach((filterButton) => {
      filterButton.setAttribute(
        "aria-pressed",
        filterButton === button ? "true" : "false",
      );
    });

    renderTodos(todoList);
  });
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();

  if (text === "") {
    messageElement.textContent = "Please enter a task.";
    todoInput.focus();
    return;
  }

  const todo = createTodo(text);

  todos.push(todo);
  saveTodos(todos);

  showMessage("Task added.");

  renderTodos(todoList);

  todoForm.reset();
  todoInput.focus();
});

function showMessage(message: string): void {
  if (messageTimer !== undefined) {
    window.clearTimeout(messageTimer);
  }

  messageElement.textContent = message;

  messageTimer = window.setTimeout(() => {
    messageElement.textContent = "";
    messageTimer = undefined;
  }, 2000);
}

function renderTodos(todoList: HTMLUListElement): void {
  todoList.innerHTML = "";

  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === "active") {
      return !todo.completed;
    }

    if (currentFilter === "completed") {
      return todo.completed;
    }

    return true;
  });

  if (filteredTodos.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";

    if (currentFilter === "active") {
      emptyMessage.textContent = "No active tasks.";
    } else if (currentFilter === "completed") {
      emptyMessage.textContent = "No completed tasks.";
    } else {
      emptyMessage.textContent = "No tasks yet.";
    }

    todoList.append(emptyMessage);
    return;
  }

  for (const todo of filteredTodos) {
    const item = document.createElement("li");
    item.className = "todo-item";

    const todoMain = document.createElement("div");
    todoMain.className = "todo-main";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `Complete task: ${todo.text}`);

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos(todos);
      renderTodos(todoList);
    });

    todoMain.append(checkbox);

    if (editingTodoId === todo.id) {
      renderEditMode(item, todoMain, todo);
    } else {
      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = todo.text;

      todoMain.append(text);

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "button-secondary";
      editButton.textContent = "Edit";
      editButton.setAttribute("aria-label", `Edit task: ${todo.text}`);

      editButton.addEventListener("click", () => {
        editingTodoId = todo.id;
        messageElement.textContent = "";
        renderTodos(todoList);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "button-danger";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete task: ${todo.text}`);

      deleteButton.addEventListener("click", () => {
        todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);

        if (editingTodoId === todo.id) {
          editingTodoId = null;
        }

        saveTodos(todos);

        showMessage("Task deleted.");

        renderTodos(todoList);
      });

      actions.append(editButton, deleteButton);
      item.append(todoMain, actions);
    }

    todoList.append(item);
  }
}

function renderEditMode(
  item: HTMLLIElement,
  todoMain: HTMLDivElement,
  todo: Todo,
): void {
  const editInput = document.createElement("textarea");
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;
  editInput.rows = 4;
  editInput.setAttribute("aria-label", `Edit task: ${todo.text}`);

  const editActions = document.createElement("div");
  editActions.className = "todo-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "button-primary";
  saveButton.textContent = "Save";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "button-secondary";
  cancelButton.textContent = "Cancel";

  const saveEdit = (): void => {
    const updatedText = editInput.value.trim();

    if (updatedText === "") {
      showMessage("Task cannot be empty.");
      editInput.focus();
      return;
    }

    todo.text = updatedText;
    editingTodoId = null;

    saveTodos(todos);
    showMessage("Task updated.");

    renderTodos(todoList);
  };

  saveButton.addEventListener("click", saveEdit);

  cancelButton.addEventListener("click", () => {
    editingTodoId = null;
    messageElement.textContent = "";
    renderTodos(todoList);
  });

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEdit();
    }

    if (event.key === "Escape") {
      editingTodoId = null;
      messageElement.textContent = "";
      renderTodos(todoList);
    }
  });

  todoMain.append(editInput);
  editActions.append(saveButton, cancelButton);
  item.append(todoMain, editActions);

  setTimeout(() => {
    editInput.focus();
    editInput.select();
  }, 0);
}

renderTodos(todoList);