export const setDataValue = <TData extends Record<string, any>, TValue = any>(
  data: TData,
  sections: string | string[],
  value: TValue,
): TData => {
  const blockedPrototypeKeys = new Set(['__proto__', 'prototype', 'constructor'])
  const assertSafeKey = (key: string) => {
    if (blockedPrototypeKeys.has(key)) {
      throw new Error(`Unsafe path key "${key}" in setDataValue`)
    }
  }
  const path = Array.isArray(sections) ? sections : [sections]
  let target: Record<string, any> = data
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i]
    assertSafeKey(key)
    if (!target?.[key] || typeof target[key] !== 'object') {
      target[key] = {}
    }
    target = target[key]
  }
  const finalKey = path.at(-1)!
  assertSafeKey(finalKey)
  target[finalKey] = value
  return data
}
