import "./style.css";
import type { Todo } from "./types";
import { createTodo } from "./todo";
import { loadTodos, saveTodos } from "./storage";

type Filter = "all" | "active" | "completed";

const form = document.querySelector<HTMLFormElement>("#todo-form");
const input = document.querySelector<HTMLInputElement>("#todo-input");
const formMessage = document.querySelector<HTMLParagraphElement>("#form-message");
const list = document.querySelector<HTMLUListElement>("#todo-list");

const filterButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-filter]");

if (!form || !input || !formMessage || !list) {
  throw new Error("Required todo elements were not found.");
}

let todos: Todo[] = loadTodos();
let currentFilter: Filter = "all";

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
    formMessage.textContent = "";
    renderTodos(list);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    formMessage.textContent = "Please enter a task.";
    input.focus();
    return;
  }

  const todo = createTodo(text);

  todos.push(todo);
  saveTodos(todos);

  formMessage.textContent = "Task added.";

  renderTodos(list);

  form.reset();
  input.focus();
});

function renderTodos(list: HTMLUListElement): void {
  list.innerHTML = "";

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

    list.append(emptyMessage);
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
      renderTodos(list);
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
      const message = document.querySelector<HTMLParagraphElement>("#form-message");

      if (message) {
        message.textContent = "Task deleted.";
      }
      renderTodos(list);
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  }
}

renderTodos(list);