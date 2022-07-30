export const isEmptyObj = (obj: Record<string, any>): boolean => Object.keys(obj ?? {}).length <= 0
