import {HasId} from "@/lib/use-list.ts";

export interface TodoItem extends HasId {
  label: string
  completed: boolean
}