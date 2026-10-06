import "./style.css";
import type { Todo } from "./types";
import { createTodo } from "./todo";

const form = document.querySelector<HTMLFormElement>("#todo-form");
const input = document.querySelector<HTMLInputElement>("#todo-input");
const list = document.querySelector<HTMLUListElement>("#todo-list");

if (!form || !input || !list) {
  throw new Error("Required todo elements were not found.");
}

let todos: Todo[] = [];

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  const todo = createTodo(text);

  todos.push(todo);

  renderTodos(list);

  form.reset();
  input.focus();
});

function renderTodos(list: HTMLUListElement): void {
  list.innerHTML = "";

  for (const todo of todos) {
    const item = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      renderTodos(list);
    });

    const text = document.createElement("span");
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);
      renderTodos(list);
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  }
}
