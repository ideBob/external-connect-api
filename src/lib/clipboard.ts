export async function copyToClipboard(text: string): Promise<boolean> {
  // Try execCommand first — synchronous, no permission prompt, works in iframes
  try {
    const el = document.createElement("textarea")
    el.value = text
    el.style.cssText =
      "position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;opacity:0;"
    document.body.appendChild(el)
    el.focus()
    el.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(el)
    if (ok) return true
  } catch {
    // fall through
  }

  // Fallback: async Clipboard API
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // both methods failed
  }

  return false
}
