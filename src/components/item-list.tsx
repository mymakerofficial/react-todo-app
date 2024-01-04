import {TodoItem} from "@/lib/item.ts";
import {Item} from "@/components/item.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ChevronsDownUp, ChevronsUpDown, Trash2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ListState} from "@/lib/use-list.ts";
import {forEachAs, idsOf, ifNot, isEmpty, takeIf, takeIfElse, takeIfNot} from "@/lib/take.ts";
import {cn} from "@/lib/utils.ts";
import {useEffect, useState} from "react";

interface CollapsibleTriggerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollapsibleTrigger({open, onOpenChange}: CollapsibleTriggerProps) {
  const closedLabel = 'Show all'
  const openLabel = 'Show less'
  const closedIcon = ChevronsUpDown
  const openIcon = ChevronsDownUp

  const label = takeIfElse(open, openLabel, closedLabel)
  const Icon = takeIfElse(open, openIcon, closedIcon)

  return (
    <Button onClick={() => onOpenChange(!open)} variant='ghost' size='sm' className='space-x-2'>
      <span>{label}</span>
      <Icon className="size-[1.1rem]" />
    </Button>
  )
}

interface ItemListProps {
  label?: string
  collapsible?: boolean
  items: TodoItem[]
  onUpdateItem: ListState<TodoItem>['update']
  onMoveItem: ListState<TodoItem>['move']
  onMoveItemRelative: ListState<TodoItem>['moveRelative']
  onRemoveItem: ListState<TodoItem>['remove']
  onRemoveItems: ListState<TodoItem>['removeMany']
}

export function ItemList({label, collapsible, items, onUpdateItem, onMoveItem, onMoveItemRelative, onRemoveItem, onRemoveItems}: ItemListProps) {
  const hasTooManyItems = items.length > 4
  const [showAll, setShowAll] = useState(true)
  useEffect(() => {
    setShowAll(ifNot(hasTooManyItems && collapsible))
  }, [hasTooManyItems, collapsible]);

  function handleDeleteAll() {
    onRemoveItems(idsOf(items))
  }

  if (isEmpty(items)) {
    return <></>
  }

  return (
    <section className='spacey-y-4'>
      {takeIf(label,
        <div className='flex flex-row justify-between p-4'>
          <h2 className='text-xl font-bold'>{label}</h2>
          <div className='ml-auto'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={handleDeleteAll}>
                  <Trash2 className='size-[1.2rem]' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove all tasks in '{label}'</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      <div className={cn('flex flex-col gap-4', takeIfNot(showAll, 'max-h-[360px] overflow-hidden mask-out'))}>
        {forEachAs(items, (item) => (
          <Item
            key={item.id}
            item={item}
            onUpdateItem={onUpdateItem}
            onMoveItem={onMoveItem}
            onMoveItemRelative={onMoveItemRelative}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>
      {takeIf(hasTooManyItems && collapsible,
        <div className='flex flex-row justify-center'>
          <CollapsibleTrigger open={showAll} onOpenChange={setShowAll} />
        </div>
      )}
    </section>
  )
}