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

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `Complete task: ${todo.text}`);

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos(todos);
      renderTodos(todoList);
    });

    const text = document.createElement("span");
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete task: ${todo.text}`);

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);
      saveTodos(todos);

      showMessage("Task deleted.");

      renderTodos(todoList);
    });

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  }
}

renderTodos(todoList);