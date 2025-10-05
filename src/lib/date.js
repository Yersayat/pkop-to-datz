export function parseISO(value) {
  // поддержка YYYY-MM-DD и полного ISO-8601
  const d = new Date(value);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  return d;
}
export function toISODate(value) {
  // вернём только дату (YYYY-MM-DD) в локальном часовом поясе сервера
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
