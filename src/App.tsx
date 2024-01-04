import {emptyTodoList, newTodoItem, TodoItem} from "@/lib/item.ts";
import {HeaderControls} from "@/components/header-controls.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {ItemList} from "@/components/item-list.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {EmptyState} from "@/components/empty-state.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {
  GroupedListDecorator,
  ListSnapshot, ListState,
  useGroupedList,
  useLimitedList,
  useListHistory,
  useListState
} from "@/lib/use-list.ts";
import {takeIf, truncate, withIdsOf} from "@/lib/take.ts";
import {useStorage} from "@/lib/use-storage.ts";
import {useEffect, useMemo} from "react";
import {toast} from "sonner";

function Header() {
  return (
    <div className='flex flex-row gap-4 justify-between items-center px-4'>
      <h1 className='text-2xl font-bold'>Welcome to your todo's!</h1>
      <ModeToggle/>
    </div>
  )
}

export default function App() {
  const listLimit = 100
  const historyLimit = 100

  const groupSelector = (item: TodoItem) => item.completed ? 'completed' : 'active'

  // TODO figure out a way to have all types implicit

  const list =
    useListHistory<TodoItem, GroupedListDecorator<TodoItem, string>>(
      useGroupedList<TodoItem, string, ListState<TodoItem>>(
        useLimitedList<TodoItem, ListState<TodoItem>>(
          useListState<TodoItem>(
            emptyTodoList(),
            useStorage('todo-list')
          ),
          listLimit
        ),
        groupSelector
      ),
      useStorage('todo-history'),
      historyLimit
    )

  useMemo(() => {
    list.init()
  }, [])

  useEffect(() => {
    if (list.value.length >= listLimit) {
      toast.warning('List limit reached! Removing oldest task.', {
        description: `You can only have ${listLimit} tasks in your list at a time.`
      })
    }
  }, [list.value]);

  const {
    active = [],
    completed= []
  } = list.groups

  function toastSnapshot(snapshotId: ListSnapshot<TodoItem>['id']) {
    const snapshot = list.getSnapshotById(snapshotId)
    if (!snapshot) {
      return
    }

    toast(snapshot.message, {
      action: {
        label: "Undo",
        onClick: () => list.restoreSnapshot(snapshot.id, - 1),
      },
    })
  }

  function handleAddItem(partialItem: Partial<TodoItem>) {
    list.prepend(newTodoItem(partialItem));
    toastSnapshot(list.createSnapshot(`Added "${partialItem.label}"`))
  }

  function handleUpdateItem(itemId: TodoItem['id'], changes: Partial<TodoItem>) {
    const label = list.getById(itemId)?.label
    list.update(itemId, changes);
    toastSnapshot(list.createSnapshot(`Updated "${truncate(label)}"`))
  }

  function handleMoveItem(itemId: TodoItem['id'], index: number) {
    const label = list.getById(itemId)?.label
    list.move(itemId, index);
    toastSnapshot(list.createSnapshot(`Moved "${truncate(label)}"`))
  }

  function handleMoveItemRelative(itemId: TodoItem['id'], offset: number) {
    const label = list.getById(itemId)?.label
    list.moveRelative(itemId, offset);
    toastSnapshot(list.createSnapshot(`Moved "${truncate(label)}" ${offset > 0 ? 'down' : 'up'}`))
  }

  function handleRemoveItem(itemId: TodoItem['id']) {
    const label = list.getById(itemId)?.label
    list.remove(itemId)
    toastSnapshot(list.createSnapshot(`Removed "${truncate(label)}"`))
  }

  function handleRemoveItems(itemIds: Array<TodoItem['id']>) {
    list.removeMany(itemIds)
    toastSnapshot(list.createSnapshot('Removed tasks'))
  }

  function handleRemoveAll() {
    list.clear()
    toastSnapshot(list.createSnapshot('Deleted all tasks'))
  }

  function handleCompleteAll() {
    list.updateMany(withIdsOf(list.value), {completed: true})
    toastSnapshot(list.createSnapshot('Completed all tasks'))
  }

  function handleUndo() {
    list.undo()
  }

  function handleRedo() {
    list.redo()
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
              canUndo={list.canUndo()}
              canRedo={list.canRedo()}
              history={list.history}
              onAddItem={handleAddItem}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onRestoreSnapshot={list.restoreSnapshot}
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