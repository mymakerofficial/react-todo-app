import {TodoItem} from "@/lib/item.ts";
import {Item} from "@/components/item.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Trash2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ListState} from "@/lib/use-list.ts";

interface ItemListProps {
  label?: string
  items: TodoItem[]
  onUpdateItem: ListState<TodoItem>['update']
  onMoveItem: ListState<TodoItem>['move']
  onMoveItemRelative: ListState<TodoItem>['moveRelative']
  onRemoveItem: ListState<TodoItem>['remove']
  onRemoveItems: ListState<TodoItem>['removeMany']
}

export function ItemList({label, items, onUpdateItem, onMoveItem, onMoveItemRelative, onRemoveItem, onRemoveItems}: ItemListProps) {
  function handleDeleteAll() {
    onRemoveItems(items.map((item) => item.id))
  }

  if (items.length === 0) {
    return <></>
  }

  const header = label ? (
    <div className='flex flex-row justify-between p-4'>
      <h2 className='text-xl font-bold'>{label}</h2>
      <div className='ml-auto'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' onClick={handleDeleteAll}>
              <Trash2 className='size-[1.2rem]' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove all items in '{label}'</TooltipContent>
        </Tooltip>
      </div>
    </div>
  ) : null

  const itemElements = items.map((item) => (
    <Item
      key={item.id}
      item={item}
      onUpdateItem={onUpdateItem}
      onMoveItem={onMoveItem}
      onMoveItemRelative={onMoveItemRelative}
      onRemoveItem={onRemoveItem}
    />
  ))

  return (
    <section className='flex flex-col gap-4'>
      { header }
      { itemElements }
    </section>
  )
}