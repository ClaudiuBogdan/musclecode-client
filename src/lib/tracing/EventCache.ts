import { getElementText, getXPath } from "./utils";

/**
 * LRU Cache for deduplicating user interaction events.
 * Uses a combination of event type, element XPath, and text content as the cache key.
 * Events within the deduplication threshold (50ms) are considered duplicates.
 */
export class EventCache {
  private cache = new Map<string, { timestamp: number }>();
  private readonly maxSize: number;
  private readonly dedupeThresholdMs = 50;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  private generateKey(eventType: string, element: Element): string {
    const elementText = getElementText(element);
    const xpath = getXPath(element);
    return `${eventType}:${xpath}:${elementText}`;
  }

  shouldDeduplicate(eventType: string, element: Element): boolean {
    const now = Date.now();
    const key = this.generateKey(eventType, element);
    const lastEvent = this.cache.get(key);

    // If event exists and is within threshold, then deduplicate
    if (lastEvent && now - lastEvent.timestamp < this.dedupeThresholdMs) {
      return true;
    }

    // If key already exists, remove it to re-insert and move it to tail
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add/Update with current timestamp
    this.cache.set(key, { timestamp: now });

    // Maintain cache size as LRU: Remove the oldest entry if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    return false;
  }
}

// Export a singleton instance
export const eventCache = new EventCache();
