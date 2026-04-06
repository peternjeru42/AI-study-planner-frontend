export const DateUtils = {
  // Format date to readable string
  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  },

  // Format date with time
  formatDateTime: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },

  // Format time
  formatTime: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },

  // Get days until date
  daysUntil: (date: Date): number => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if date is today
  isToday: (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if date is tomorrow
  isTomorrow: (date: Date): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  },

  // Get human readable date (e.g., "Today", "Tomorrow", "in 3 days")
  getRelativeDate: (date: Date): string => {
    const days = DateUtils.daysUntil(date);

    if (DateUtils.isToday(date)) return 'Today';
    if (DateUtils.isTomorrow(date)) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `in ${days} days`;
    if (days < 14) return 'Next week';
    if (days < 30) return `in ${Math.floor(days / 7)} weeks`;
    return DateUtils.formatDate(date);
  },

  // Get week dates (Monday to Sunday)
  getWeekDates: (date: Date = new Date()): Date[] => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(monday);
      weekDate.setDate(weekDate.getDate() + i);
      dates.push(weekDate);
    }
    return dates;
  },

  // Get month dates
  getMonthDates: (date: Date = new Date()): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  },
};
