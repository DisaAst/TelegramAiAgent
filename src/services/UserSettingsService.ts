/**
 * User settings interface
 */
interface UserSettings {
  timezone?: string;
  language?: string;
}

/**
 * Interface for user settings service
 */
export interface IUserSettingsService {
  setUserTimezone(userId: number, timezone: string): boolean;
  getUserTimezone(userId: number): string | undefined;
  setUserLanguage(userId: number, language: string): void;
  getUserLanguage(userId: number): string | undefined;
  getUserSettings(userId: number): UserSettings;
  clearUserSettings(userId: number): void;
  getSettingsStats(): { totalUsers: number; usersWithTimezone: number };
  getPopularTimezones(): string[];
}

/**
 * In-memory user settings service implementation
 */
export class UserSettingsService implements IUserSettingsService {
  private userSettings = new Map<number, UserSettings>();

  /**
   * Set user timezone
   */
  setUserTimezone(userId: number, timezone: string): boolean {
    try {
      // Validate timezone
      new Date().toLocaleString('en-US', { timeZone: timezone });
      
      const settings = this.userSettings.get(userId) || {};
      settings.timezone = timezone;
      this.userSettings.set(userId, settings);
      
      return true;
    } catch (error) {
      console.error(`Invalid timezone for user ${userId}:`, timezone);
      return false;
    }
  }

  /**
   * Get user timezone
   */
  getUserTimezone(userId: number): string | undefined {
    return this.userSettings.get(userId)?.timezone;
  }

  /**
   * Set user language
   */
  setUserLanguage(userId: number, language: string): void {
    const settings = this.userSettings.get(userId) || {};
    settings.language = language;
    this.userSettings.set(userId, settings);
  }

  /**
   * Get user language
   */
  getUserLanguage(userId: number): string | undefined {
    return this.userSettings.get(userId)?.language;
  }

  /**
   * Get all user settings
   */
  getUserSettings(userId: number): UserSettings {
    return this.userSettings.get(userId) || {};
  }

  /**
   * Clear user settings
   */
  clearUserSettings(userId: number): void {
    this.userSettings.delete(userId);
  }

  /**
   * Get settings statistics
   */
  getSettingsStats(): { totalUsers: number; usersWithTimezone: number } {
    const totalUsers = this.userSettings.size;
    const usersWithTimezone = Array.from(this.userSettings.values())
      .filter(settings => settings.timezone).length;

    return { totalUsers, usersWithTimezone };
  }

  /**
   * Get popular timezones list
   */
  getPopularTimezones(): string[] {
    return [
      'Europe/Moscow',      // Moscow
      'Europe/London',      // London
      'America/New_York',   // New York
      'America/Los_Angeles', // Los Angeles
      'Asia/Tokyo',         // Tokyo
      'Asia/Shanghai',      // Beijing
      'Europe/Berlin',      // Berlin
      'Australia/Sydney',   // Sydney
      'UTC'                 // UTC
    ];
  }
} 