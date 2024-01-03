export function groupBy<T, K extends string | number | symbol>(list: Array<T>, keySelector: (item: T) => K): Record<K, Array<T>> {
  const record = {} as Record<K, Array<T>>
  list.forEach((item) => {
    const key = keySelector(item)
    if (!record[key]) {
      record[key] = [] as Array<T>
    }
    record[key].push(item)
  })
  return record
}