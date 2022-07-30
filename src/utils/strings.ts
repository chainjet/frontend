export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.substr(1)

export function slugify (str: string): string {
  return str.toLowerCase()
    .replace(/-/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}
