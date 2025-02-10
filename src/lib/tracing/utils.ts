/**
 * Helper function to get XPath for an element
 */
export const getXPath = (element: Element): string => {
  if (element.id) return `//*[@id="${element.id}"]`;
  const path = [];
  let currentElement: Element | null = element;

  while (currentElement && currentElement !== document.documentElement) {
    let index = 1;
    let sibling = currentElement.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === currentElement.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    path.unshift(`${currentElement.tagName.toLowerCase()}[${index}]`);
    currentElement = currentElement.parentElement;
  }

  return `/html/${path.join("/")}`;
};

/**
 * Helper to safely get element text content
 */
export function getElementText(element: Element): string {
  // For form controls, prefer value over text content
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.type === "password" ? "[password]" : element.value || "";
  }

  if (element instanceof HTMLSelectElement) {
    return Array.from(element.selectedOptions)
      .map((option) => option.text)
      .join(", ");
  }

  const text = element.textContent?.trim();
  return text === undefined ? "" : text;
}
