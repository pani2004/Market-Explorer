import dayjs from 'dayjs';

export function getDaysInMonth(date) {
  const start = date.startOf('month').startOf('week');
  const end = date.endOf('month').endOf('week');
  const days = [];
  let curr = start;
  while (curr.isBefore(end) || curr.isSame(end, 'day')) {
    days.push(curr);
    curr = curr.add(1, 'day');
  }
  return days;
}

export function isToday(date) {
  return dayjs().isSame(date, 'day');
}

export function isSameDay(a, b) {
  return a && b && a.isSame(b, 'day');
}

export function getStartOfWeek(date) {
  return date.startOf('week');
}

export function getEndOfWeek(date) {
  return date.endOf('week');
}
