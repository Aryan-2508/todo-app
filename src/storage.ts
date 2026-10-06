import type { Todo } from "./types";

const STORAGE_KEY = "todos";

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function loadTodos(): Todo[] {
  const storedTodos = localStorage.getItem(STORAGE_KEY);

  if (!storedTodos) {
    return [];
  }

  return JSON.parse(storedTodos) as Todo[];
}