import {TodoItem} from "@/lib/item.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Trash2
} from "lucide-react";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ListState} from "@/lib/use-list.ts";
import {Menu, MenuItems} from "@/components/menu.tsx";

interface ItemProps {
  item: TodoItem
  onUpdateItem: ListState<TodoItem>['update']
  onMoveItem: ListState<TodoItem>['move']
  onMoveItemRelative: ListState<TodoItem>['moveRelative']
  onRemoveItem: ListState<TodoItem>['remove']
}

export function Item({item, onUpdateItem, onMoveItem, onMoveItemRelative, onRemoveItem}: ItemProps) {
  function handleUpdate(changes: Partial<TodoItem>) {
    onUpdateItem(item.id, changes)
  }

  function handleCheckedChange(checkedState: CheckedState) {
    handleUpdate({completed: checkedState === true})
  }

  function handleMoveUp() {
    onMoveItemRelative(item.id, -1)
  }

  function handleMoveDown() {
    onMoveItemRelative(item.id, 1)
  }

  function handleMoveToTop() {
    onMoveItem(item.id, 0)
  }

  function handleMoveToBottom() {
    onMoveItem(item.id, Infinity)
  }

  function handleRemove() {
    onRemoveItem(item.id)
  }

  const menuItems: MenuItems = [[
    { label: 'Delete', icon: Trash2, onClick: handleRemove, className: 'text-red-500' }
  ], [
    { label: 'Move up', icon: ChevronUp, onClick: handleMoveUp },
    { label: 'Move down', icon: ChevronDown, onClick: handleMoveDown }
  ], [
    { label: 'Move to top', icon: ChevronsUp, onClick: handleMoveToTop },
    { label: 'Move to bottom', icon: ChevronsDown, onClick: handleMoveToBottom }
  ]]

  return (
    <article className='flex flex-row gap-4 items-center p-4'>
      <label htmlFor={`item-${item.id}`} className='flex flex-row gap-4 items-center flex-grow'>
        <Checkbox id={`item-${item.id}`} checked={item.completed} onCheckedChange={handleCheckedChange} />
        <h3 className={item.completed ? 'line-through' : 'font-medium'}>{item.label}</h3>
      </label>
      <Menu itemGroups={menuItems} />
    </article>
  )
}