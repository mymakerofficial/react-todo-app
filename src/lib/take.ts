import {HasId} from "@/lib/use-list.ts";

type Condition = boolean | null | undefined | unknown | number | string | (() => boolean)

export function isTruthy<T extends Condition>(condition: T): condition is Exclude<T, false | 0 | '' | null | undefined> {
  if (typeof condition === 'function') {
    return condition()
  }

  return !!condition;
}

export function takeIfElse<T, G>(condition: Condition, value: T, other: G): T | G {
  return isTruthy(condition) ? value : other;
}

export function takeIf<T>(condition: Condition, value: T): T | undefined {
  return takeIfElse(condition, value, undefined);
}

export function takeIfNot<T>(condition: Condition, value: T): T | undefined {
  return takeIfElse(!condition, value, undefined);
}

export function ifNot(condition: Condition): boolean {
  return !isTruthy(condition);
}

export function forEachAs<T, G>(list: Array<T>, map: (item: T) => G): Array<G> {
  return list.map(map);
}

export function isEmpty<T>(list: Array<T>): boolean {
  return list.length === 0;
}

export function isNotLast<T>(index: number, list: Array<T>): boolean {
  return index < list.length - 1 && list.length > 1;
}

export function idsOf<T extends HasId>(list: Array<T>): Array<T['id']> {
  return list.map((it) => it.id);
}

export function withIdsOf<T extends HasId>(list: Array<T>) {
  return idsOf(list);
}

export function TODO(): never {
  throw new Error('TODO');
}

export function truncate(text: string | undefined, length: number = 12): string {
  return (text || '').length > length ? `${text?.substring(0, length)}...` : (text || '');
}

export function toReversed<T>(list: Array<T>): Array<T> {
  return [...list].reverse();
}