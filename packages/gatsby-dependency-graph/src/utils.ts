export function hasExtension(path: string): boolean {
  try {
    const parts = path.split(`/`)
    const lastPart = parts[parts.length - 1]

    return lastPart.indexOf(`.`) !== -1
  } catch (e) {
    console.error(`Could not derive extension, hit an error for path:`, path)
    console.error(e)
    return false
  }
}

export function getExtension(path: string): string {
  if (hasExtension(path)) {
    const parts = path.split(`.`)
    const lastPart = parts[parts.length - 1]

    return lastPart
  }
  return ""
}
