export interface StorageFacade<T> {
  get(): T
  set(value: T): void
}

export function useStorage<T>(key: string, initial?: T): StorageFacade<T> {
  function get(): T {
    const value = localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    }
    return initial as T
  }

  function set(value: T) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  return {
    get,
    set,
  }
}