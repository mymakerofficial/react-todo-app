import {TodoItem} from "@/lib/item.ts";
import {InputForm} from "@/components/input-form.tsx";
import { v4 as uuid } from 'uuid';
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {ItemList} from "@/components/item-list.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {EmptyState} from "@/components/empty-state.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {HasId, useListState} from "@/lib/use-list.ts";
import {JSX} from "react";
import {groupBy} from "@/lib/group-by.ts";

function getRelativeIndex<T extends HasId>(array: Array<T>, itemId: T['id'], offset: number): number {
  const index = array.findIndex((item) => item.id === itemId)
  return index + offset

}

function translateSubArrayIndexToFullArrayIndex<T extends HasId>(subArray: Array<T>, fullArray: Array<T>, subArrayIndex: number): number {
  return fullArray.findIndex((item) => item.id === subArray[subArrayIndex]?.id)
}

function getEmptyStateElement(activeLength: number, completedLength: number): JSX.Element | null {
  const isEmpty = activeLength + completedLength === 0
  const hasCompletedAll = activeLength === 0 && completedLength > 0

  if (isEmpty) {
    return (
      <EmptyState label='Nothing to do!' text='Type something in the textfield above' icon='🔎'/>
    )
  }

  if (hasCompletedAll) {
    return (
      <EmptyState
        label='Congrats!'
        text='Youve completed all that is to complete, yet you feel there is still more to do.'
        icon='🎉'
      />
    )
  }

  return null
}

function Header() {
  return (
    <div className='flex flex-row gap-4 justify-between items-center px-4'>
      <h1 className='text-2xl font-bold'>Welcome to your todo's!</h1>
      <ModeToggle/>
    </div>
  )
}

export default function App() {
  const list = useListState<TodoItem>()

  const {
    active = [],
    completed= []
  } = groupBy(
    list.value,
    (item) => item.completed ? 'completed' : 'active'
  )

  function handleAddItem(label: string) {
    list.add({
      id: uuid(),
      label,
      completed: false,
    })
  }

  function handleUpdateItem(itemId: TodoItem['id'], changes: Partial<TodoItem>) {
    list.update(itemId, changes)
  }

  function handleMoveItem(itemId: TodoItem['id'], index: number) {
    list.move(itemId, index)
  }

  function handleMoveItemRelative(itemId: TodoItem['id'], offset: number) {
    const item = list.value.find((item) => item.id === itemId)
    if (!item) {
      return
    }

    const subArray = item.completed ? completed : active
    const newIndexInSubArray = getRelativeIndex(subArray, itemId, offset)
    const newIndex = translateSubArrayIndexToFullArrayIndex(subArray, list.value, newIndexInSubArray)
    if (newIndex === -1) {
      return
    }

    list.move(itemId, newIndex)
  }

  function handleRemoveItem(itemId: TodoItem['id']) {
    list.remove(itemId)
  }

  function handleRemoveItems(itemIds: Array<TodoItem['id']>) {
    list.removeMany(itemIds)
  }

  function handleRemoveAll() {
    list.clear()
  }

  return (
    <>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <main className='max-w-2xl mx-auto my-16 flex flex-col gap-8'>
            <Header />
            <InputForm onAddItem={handleAddItem} onDeleteAll={handleRemoveAll}/>
            { getEmptyStateElement(active.length, completed.length) }
            <ItemList
              items={active}
              onUpdateItem={handleUpdateItem}
              onMoveItem={handleMoveItem}
              onMoveItemRelative={handleMoveItemRelative}
              onRemoveItem={handleRemoveItem}
              onRemoveItems={handleRemoveItems}
            />
            <ItemList
              label='Done'
              items={completed}
              onUpdateItem={handleUpdateItem}
              onMoveItem={handleMoveItem}
              onMoveItemRelative={handleMoveItemRelative}
              onRemoveItem={handleRemoveItem}
              onRemoveItems={handleRemoveItems}
            />
          </main>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </>
  )
}