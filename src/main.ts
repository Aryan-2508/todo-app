import "./style.css";
import type { Todo } from "./types";
import { createTodo } from "./todo";
import { loadTodos, saveTodos } from "./storage";

type Filter = "all" | "active" | "completed";

const form = document.querySelector<HTMLFormElement>("#todo-form");
const input = document.querySelector<HTMLInputElement>("#todo-input");
const list = document.querySelector<HTMLUListElement>("#todo-list");

const filterButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-filter]");

if (!form || !input || !list) {
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
    renderTodos(list);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  const todo = createTodo(text);

  todos.push(todo);
  saveTodos(todos);

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

  for (const todo of filteredTodos) {
    const item = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

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

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);
      saveTodos(todos);
      renderTodos(list);
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  }
}

renderTodos(list);