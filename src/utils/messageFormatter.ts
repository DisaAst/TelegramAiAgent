/**
 * Utility for formatting messages with placeholders
 */
export class MessageFormatter {
  /**
   * Format a message template with placeholders
   * @param template - Message template with {placeholder} syntax
   * @param values - Object with placeholder values
   * @returns Formatted message
   */
  static format(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key]?.toString() || match;
    });
  }

  /**
   * Join array of strings with newlines
   * @param items - Array of strings to join
   * @returns Joined string
   */
  static joinLines(items: string[]): string {
    return items.join('\n');
  }

  /**
   * Build a complete message from title and items
   * @param title - Message title
   * @param items - Array of message items
   * @returns Complete formatted message
   */
  static buildMessage(title: string, items: string[]): string {
    return `${title}\n\n${this.joinLines(items)}`;
  }

  /**
   * Clean text for Telegram (remove complex markdown)
   * @param text - Text to clean
   * @returns Cleaned text
   */
  static cleanForTelegram(text: string): string {
    return text
      // Remove complex markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/```([\s\S]*?)```/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Replace lists
      .replace(/^\s*[\*\-\+]\s+/gm, '• ')
      // Clean extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
} 