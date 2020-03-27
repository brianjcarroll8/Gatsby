const supportedExtensions = ["ts", "tsx", "js", "jsx"]

function hasExtension(path) {
  try {
    const parts = path.split("/")
    const lastPart = parts[parts.length - 1]

    return lastPart.indexOf(".") !== -1
  } catch (e) {
    console.error("Could not derive extension, hit an error for path:", path)
    console.error(e)
    return false
  }
}

function getExtension(path) {
  if (hasExtension(path)) {
    const parts = path.split(".")
    const lastPart = parts[parts.length - 1]

    return lastPart
  }
}

exports.hasExtension = hasExtension
exports.getExtension = getExtension
