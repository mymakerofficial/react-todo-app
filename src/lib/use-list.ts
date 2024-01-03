import {useState} from "react";

export type HasId = {id: string}

export interface ListState<T extends HasId> {
  value: Array<T>
  set: (value: Array<T>) => void
  add: (item: T) => void
  remove: (id: T['id']) => void
  removeMany: (ids: Array<T['id']>) => void
  clear: () => void
  update: (id: T['id'], changes: Partial<T>) => void
  updateMany: (ids: Array<T['id']>, changes: Partial<T>) => void
  move: (id: T['id'], index: number) => void
  moveRelative: (id: T['id'], offset: number) => void
}

export function useListState<T extends HasId>(initial: Array<T> = []): ListState<T> {
  const [list, setList] = useState<Array<T>>(initial)

  function add(item: T) {
    setList([...list, item])
  }

  function remove(id: T['id']) {
    setList(list.filter((it) => it.id !== id))
  }

  function removeMany(ids: Array<T['id']>) {
    setList(list.filter((it) => !ids.includes(it.id)))
  }

  function clear() {
    setList([])
  }

  function update(id: T['id'], changes: Partial<T>) {
    setList(list.map((item) => {
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
    setList(list.map((item) => {
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
    const newList = [...list]
    const item = newList.find((it) => it.id === id)
    if (!item) {
      return
    }
    newList.splice(list.indexOf(item), 1)
    newList.splice(index, 0, item)
    setList(newList)
  }

  function moveRelative(id: T['id'], offset: number) {
    const item = list.find((it) => it.id === id)
    if (!item) {
      return
    }
    const index = list.indexOf(item)
    const newIndex = index + offset
    if (newIndex < 0 || newIndex >= list.length) {
      return
    }
    move(id, newIndex)
  }

  return {
    value: list,
    set: setList,
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