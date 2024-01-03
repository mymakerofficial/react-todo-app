export function takeIf<T>(condition: boolean, value: T): T | undefined {
  return condition ? value : undefined;
}

export function takeIfElse<T, G>(condition: boolean, value: T, other: G): T | G {
  return condition ? value : other;
}

export function takeWhen<T>(predicate: (value: T) => boolean, value: T): T | undefined {
  return predicate(value) ? value : undefined;
}

export function forEachAs<T, G>(list: Array<T>, map: (item: T) => G): Array<G> {
  return list.map(map);
}

export function isNotLast(index: number, list: Array<any>): boolean {
  return index < list.length - 1 && list.length > 1;
}