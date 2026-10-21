/**
 * Share utility functions for DiyaVerse.
 */

export function getWhatsAppShareUrl(text: string, url: string): string {
  const fullMessage = `${text}\n${url}`.trim();
  return `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

export async function triggerNativeShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<"completed" | "unsupported" | "dismissed"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
      return "completed";
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return "dismissed";
      }
      return "dismissed";
    }
  }
  return "unsupported";
}
