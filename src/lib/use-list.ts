import {useState} from "react";
import {StorageFacade} from "@/lib/use-storage.ts";

export type HasId = {id: string}

export interface ListState<T extends HasId> {
  value: Array<T>
  getRawValue: () => Array<T>
  set: (value: Array<T>) => void
  init: () => void
  getById: (id: T['id']) => T | undefined
  add: (item: T) => void
  remove: (id: T['id']) => void
  removeMany: (ids: Array<T['id']>) => void
  clear: () => void
  update: (id: T['id'], changes: Partial<T>) => void
  updateMany: (ids: Array<T['id']>, changes: Partial<T>) => void
  move: (id: T['id'], index: number) => void
  moveRelative: (id: T['id'], offset: number) => void
}

export function useListState<T extends HasId>(initial: Array<T> = [], storage?: StorageFacade<Array<T>>): ListState<T> {
  const [list, setList] = useState<Array<T>>(initial)
  let statelessValue = list

  function getRawValue() {
    return new Proxy(statelessValue, {})
  }

  function set(value: Array<T>) {
    setList(value)
    statelessValue = value
    if (storage) {
      storage.set(value)
    }
  }

  function init() {
    if (storage) {
      const value = storage.get() || initial || []
      if (value) {
        set(value)
      }
    } else {
      set(initial)
    }
  }

  function getById(id: T['id']) {
    return getRawValue().find((it) => it.id === id)
  }

  function add(item: T) {
    set([...getRawValue(), item])
  }

  function remove(id: T['id']) {
    set(getRawValue().filter((it) => it.id !== id))
  }

  function removeMany(ids: Array<T['id']>) {
    set(getRawValue().filter((it) => !ids.includes(it.id)))
  }

  function clear() {
    set([])
  }

  function update(id: T['id'], changes: Partial<T>) {
    set(getRawValue().map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...changes,
        }
      }
      return item
    }))
  }

  function updateMany(ids: Array<T['id']>, changes: Partial<T>) {
    set(getRawValue().map((item) => {
      if (ids.includes(item.id)) {
        return {
          ...item,
          ...changes,
        }
      }
      return item
    }))
  }

  function move(id: T['id'], index: number) {
    const newList = [...getRawValue()]
    const item = newList.find((it) => it.id === id)
    if (!item) {
      return
    }
    newList.splice(getRawValue().indexOf(item), 1)
    newList.splice(index, 0, item)
    set(newList)
  }

  function moveRelative(id: T['id'], offset: number) {
    const item = getRawValue().find((it) => it.id === id)
    if (!item) {
      return
    }
    const index = getRawValue().indexOf(item)
    const newIndex = index + offset
    if (newIndex < 0 || newIndex >= getRawValue().length) {
      return
    }
    move(id, newIndex)
  }

  return {
    value: list,
    getRawValue,
    set,
    init,
    getById,
    add,
    remove,
    removeMany,
    clear,
    update,
    updateMany,
    move,
    moveRelative,
  }
}

export interface ListSnapshot<T extends HasId> extends HasId {
  value: Array<T>
  message: string
}

interface ListHistoryDecorator<T extends HasId> extends ListState<T> {
  history: ListState<ListSnapshot<T>>['value']
  historyIndex: number
  createSnapshot: (message: string) => ListSnapshot<T>['id']
  restoreSnapshot: (id: ListSnapshot<T>['id'], offset?: number) => void
  undo: () => void
  redo: () => void
  getSnapshotById: (id: ListSnapshot<T>['id']) => ListSnapshot<T> | undefined
  canUndo: () => boolean
  canRedo: () => boolean
}

export function useListHistoryDecorator<T extends HasId>(wrappee: ListState<T>, storage?: StorageFacade<Array<ListSnapshot<T>>>): ListHistoryDecorator<T> {
  const history = useListState<ListSnapshot<T>>([], storage)
  const [historyIndex, setHistoryIndex] = useState<number>(0)

  function setIndexToLast() {
    setHistoryIndex(history.getRawValue().length - 1)
  }

  function getIdsAfterIndex(index: number) {
    return history.getRawValue().slice(index + 1, history.getRawValue().length).map((it) => it.id)
  }

  function getCurrentSnapshot() {
    return history.getRawValue()[historyIndex]
  }

  function init() {
    history.init()
    wrappee.init()
    if (history.getRawValue().length === 0) {
      createSnapshot('Initial state')
    }
    setIndexToLast()
  }

  function createSnapshot(message: string) {
    history.removeMany(getIdsAfterIndex(historyIndex))

    const snapshot = {
      id: new Date().toISOString(),
      value: wrappee.getRawValue(),
      message,
    }

    history.add(snapshot)
    setIndexToLast()

    return snapshot.id
  }

  function restoreSnapshot(id: ListSnapshot<T>['id'], offset: number = 0) {
    const snapshot = history.getRawValue()[history.getRawValue().findIndex((it) => it.id === id) + offset]
    if (!snapshot) {
      return
    }
    wrappee.set(snapshot.value)
    setHistoryIndex(history.getRawValue().indexOf(snapshot))
  }

  function undo() {
    if (historyIndex > 0) {
      restoreSnapshot(getCurrentSnapshot().id, -1)
    }
  }

  function redo() {
    if (historyIndex < history.getRawValue().length - 1) {
      restoreSnapshot(getCurrentSnapshot().id, 1)
    }
  }

  function canUndo() {
    return historyIndex > 0
  }

  function canRedo() {
    return historyIndex < history.getRawValue().length - 1
  }

  return {
    ...wrappee,
    init,
    history: history.value,
    historyIndex,
    createSnapshot,
    restoreSnapshot,
    undo,
    redo,
    getSnapshotById: history.getById,
    canUndo,
    canRedo,
  }
}