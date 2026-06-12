export const countActiveFilters = (
  values: Record<string, unknown>,
  defaults: Record<string, unknown>
): number =>
  Object.keys(defaults).reduce((count, key) => {
    const value = values[key]
    const defaultValue = defaults[key]
    if (value === defaultValue) return count
    if (typeof value === 'string' && value.trim() === '' && defaultValue === '') return count
    return count + 1
  }, 0)
