export interface DateTimeInfo {
  currentDateTime: string;
  utcDateTime: string;
  dayOfWeek: string;
  timezone: string;
}

export function getCurrentDateTime(userTimezone?: string): DateTimeInfo {
  const now = new Date();
  
  // Basic UTC information
  const utcDateTime = now.toISOString();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  
  // If user timezone is specified, use it
  let currentDateTime: string;
  let timezone: string;
  
  if (userTimezone) {
    try {
      currentDateTime = now.toLocaleString('en-US', { 
        timeZone: userTimezone,
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      timezone = userTimezone;
    } catch (error) {
      // Fallback to UTC if timezone is invalid
      currentDateTime = now.toLocaleString('en-US', { 
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      timezone = 'UTC';
    }
  } else {
    // Use UTC as default
    currentDateTime = now.toLocaleString('en-US', { 
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    timezone = 'UTC';
  }

  return {
    currentDateTime,
    utcDateTime,
    dayOfWeek,
    timezone
  };
}

export function formatDateTimeContext(userTimezone?: string): string {
  const dateInfo = getCurrentDateTime(userTimezone);
  
  return `Current date and time: ${dateInfo.currentDateTime}
Day of the week: ${dateInfo.dayOfWeek}
Timezone: ${dateInfo.timezone}
UTC time: ${dateInfo.utcDateTime}`;
} 