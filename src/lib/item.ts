import {HasId} from "@/lib/use-list.ts";
import {v4 as uuid} from "uuid";

export interface TodoItem extends HasId {
  label: string
  description: string
  completed: boolean
}

export function newTodoItem(partial: Partial<TodoItem>): TodoItem {
  return {
    id: uuid(),
    label: '',
    description: '',
    completed: false,
    ...partial,
  }
}

export function emptyTodoList(): Array<TodoItem> {
  return []
}