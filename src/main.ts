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

    item.textContent = todo.text;

    list.append(item);
  }
}