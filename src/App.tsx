import {newTodoItem, TodoItem} from "@/lib/item.ts";
import {HeaderControls} from "@/components/header-controls.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {ItemList} from "@/components/item-list.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {EmptyState} from "@/components/empty-state.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {HasId, useListState} from "@/lib/use-list.ts";
import {groupBy} from "@/lib/group-by.ts";
import {takeIf, withIdsOf} from "@/lib/take.ts";
import {useStorage} from "@/lib/use-storage.ts";
import {useMemo} from "react";

function getRelativeIndex<T extends HasId>(array: Array<T>, itemId: T['id'], offset: number): number {
  const index = array.findIndex((item) => item.id === itemId)
  return index + offset

}

function translateSubArrayIndexToFullArrayIndex<T extends HasId>(subArray: Array<T>, fullArray: Array<T>, subArrayIndex: number): number {
  return fullArray.findIndex((item) => item.id === subArray[subArrayIndex]?.id)
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
  const list = useListState<TodoItem>([], useStorage('todo-list'))

  useMemo(() => {
    list.init()
  }, [])

  const {
    active = [],
    completed= []
  } = groupBy(
    list.value,
    (item) => item.completed ? 'completed' : 'active'
  )

  function handleAddItem(partialItem: Partial<TodoItem>) {
    return list.add(newTodoItem(partialItem));
  }

  function handleUpdateItem(itemId: TodoItem['id'], changes: Partial<TodoItem>) {
    return list.update(itemId, changes);
  }

  function handleMoveItem(itemId: TodoItem['id'], index: number) {
    return list.move(itemId, index);
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

    handleMoveItem(itemId, newIndex)
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

  function handleCompleteAll() {
    list.updateMany(withIdsOf(list.value), {completed: true})
  }

  const isEmpty = list.value.length === 0
  const hasCompletedAll = active.length === 0 && completed.length > 0

  return (
    <>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <main className='max-w-2xl mx-auto my-16 flex flex-col gap-8'>
            <Header />
            <HeaderControls
              onAddItem={handleAddItem}
              onDeleteAll={handleRemoveAll}
              onCompleteAll={handleCompleteAll}
            />
            {takeIf(isEmpty,
              <EmptyState label='Nothing to do!' text='Type something in the textfield above' icon='🔎'/>
            )}
            {takeIf(hasCompletedAll,
              <EmptyState
                label='Congrats!'
                text='Youve completed all that is to complete, yet you feel there is still more to do.'
                icon='🎉'
              />
            )}
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
              collapsible
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