import {useEffect, useState} from "react";
import {StorageFacade} from "@/lib/use-storage.ts";
import {v4 as uuid} from "uuid";
import {groupBy} from "@/lib/group-by.ts";

export type HasId = {id: string}

export interface ListState<T extends HasId> {
  value: Array<T>
  getRawValue: () => Array<T>
  set: (value: Array<T>) => void
  init: () => void
  getById: (id: T['id']) => T | undefined
  prepend: (item: T) => void
  append: (item: T) => void
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

  function prepend(item: T) {
    set([item, ...getRawValue()])
  }

  function append(item: T) {
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
    prepend,
    append,
    remove,
    removeMany,
    clear,
    update,
    updateMany,
    move,
    moveRelative,
  }
}

export function useLimitedList<T extends HasId, S extends ListState<T>>(wrappee: S, limit: number): ListState<T> & S {
  if (limit === Infinity) {
    return wrappee
  }

  function init() {
    wrappee.init()
    wrappee.set(wrappee.getRawValue().slice(0, limit))
  }

  function set(value: Array<T>) {
    wrappee.set(value.slice(0, limit))
  }

  // remove oldest item if limit is reached
  function prepend(item: T) {
    if (wrappee.getRawValue().length >= limit) {
      wrappee.remove(wrappee.getRawValue()[wrappee.getRawValue().length - 1].id)
    }
    wrappee.prepend(item)
  }

  function append(item: T) {
    if (wrappee.getRawValue().length >= limit) {
      wrappee.remove(wrappee.getRawValue()[0].id)
    }
    wrappee.append(item)
  }

  return {
    ...wrappee,
    init,
    set,
    prepend,
    append,
  }
}

export interface ListSnapshot<T extends HasId> extends HasId {
  value: Array<T>
  message: string
  createdAt: string
}

export interface ListHistoryDecorator<T extends HasId> extends ListState<T> {
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

export function useListHistory<T extends HasId, S extends ListState<T>>(wrappee: S, storage?: StorageFacade<Array<ListSnapshot<T>>>, limit: number = Infinity): ListHistoryDecorator<T> & S {
  const history = useLimitedList<ListSnapshot<T>, ListState<ListSnapshot<T>>>(useListState<ListSnapshot<T>>([], storage), limit)
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
      id: uuid(),
      value: wrappee.getRawValue(),
      message,
      createdAt: new Date().toISOString(),
    }

    history.append(snapshot)
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

export interface GroupedListDecorator<T extends HasId, K extends string | number | symbol> extends ListState<T> {
  groups: Record<K, Array<T>>
}

export function useGroupedList<T extends HasId, K extends string | number | symbol, S extends ListState<T>>(wrappee: S, keySelector: (item: T) => K): GroupedListDecorator<T, K> & S {
  const [groups, setGroups] = useState<Record<K, Array<T>>>({} as Record<K, Array<T>>)

  useEffect(() => {
    setGroups(groupBy(wrappee.getRawValue(), keySelector))
  }, [wrappee.value]);

  function getRelativeIndex(array: Array<T>, itemId: T['id'], offset: number): number {
    const index = array.findIndex((item) => item.id === itemId)
    return index + offset
  }

  function translateSubArrayIndexToFullArrayIndex(subArray: Array<T>, fullArray: Array<T>, subArrayIndex: number): number {
    return fullArray.findIndex((item) => item.id === subArray[subArrayIndex]?.id)
  }

  function moveRelative(id: T['id'], offset: number) {
    const item = wrappee.getRawValue().find((item) => item.id === id)
    if (!item) {
      return
    }

    const subArray = groups[keySelector(item)]
    const newIndexInSubArray = getRelativeIndex(subArray, id, offset)
    const newIndex = translateSubArrayIndexToFullArrayIndex(subArray, wrappee.getRawValue(), newIndexInSubArray)
    if (newIndex === -1) {
      return
    }

    wrappee.move(id, newIndex)
  }

  return {
    ...wrappee,
    groups,
    moveRelative,
  }
}