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
      // Remove complex markdown (paired)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/```([\s\S]*?)```/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Replace lists
      .replace(/^\s*[\*\-\+]\s+/gm, '• ')
      // Escape remaining markdown characters that can break parsing
      .replace(/\*/g, '\\*') // Escape remaining asterisks
      .replace(/_/g, '\\_') // Escape remaining underscores
      .replace(/`/g, '\\`') // Escape remaining backticks
      .replace(/\[/g, '\\[') // Escape remaining brackets
      .replace(/\]/g, '\\]')
      .replace(/~/g, '\\~') // Escape tildes (strikethrough)
      // Clean extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Safe send for Telegram with fallback to plain text
   * @param text - Text to send
   * @returns Object with text and parse mode
   */
  static safeFormat(text: string): { text: string; parse_mode?: 'Markdown' } {
    const cleanedText = this.cleanForTelegram(text);
    
    // Check if text might still have markdown parsing issues
    const problematicPatterns = [
      /\*[^*]*$/, // Unclosed asterisk at end
      /_[^_]*$/, // Unclosed underscore at end
      /`[^`]*$/, // Unclosed backtick at end
    ];
    
    const hasProblems = problematicPatterns.some(pattern => pattern.test(cleanedText));
    
    if (hasProblems) {
      // Fallback to plain text without markdown
      return {
        text: this.removeAllMarkdown(text)
      };
    }
    
    return {
      text: cleanedText,
      parse_mode: 'Markdown'
    };
  }

  /**
   * Remove all markdown formatting completely
   * @param text - Text to clean
   * @returns Plain text without any markdown
   */
  private static removeAllMarkdown(text: string): string {
    return text
      // Remove all markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/```([\s\S]*?)```/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^\s*[\*\-\+]\s+/gm, '• ')
      // Remove all remaining markdown characters
      .replace(/[*_`\[\]~]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
} 