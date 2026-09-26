// Current system reference date is 2026-09-24
export const CURRENT_REFERENCE_DATE = '2026-09-24';

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function isScholarshipExpired(deadline: string, refDate: string = CURRENT_REFERENCE_DATE): boolean {
  if (!deadline) return false;
  // If deadline string is less than reference date YYYY-MM-DD
  return deadline < refDate;
}

export function getDaysRemaining(deadline: string, refDate: string = CURRENT_REFERENCE_DATE): number {
  if (!deadline) return 0;
  const target = parseDate(deadline).getTime();
  const current = parseDate(refDate).getTime();
  const diffDays = Math.ceil((target - current) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function formatDeadlinePtBr(deadline: string): string {
  if (!deadline) return 'Prazo sob consulta no edital';
  try {
    const [year, month, day] = deadline.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${day} de ${monthName} de ${year}`;
  } catch {
    return deadline;
  }
}

export function getDeadlineBadge(deadline: string, refDate: string = CURRENT_REFERENCE_DATE) {
  if (isScholarshipExpired(deadline, refDate)) {
    return {
      type: 'expired' as const,
      label: 'Inscrições Encerradas',
      colorClass: 'bg-rose-100 text-rose-800 border-rose-200',
      days: 0
    };
  }

  const days = getDaysRemaining(deadline, refDate);

  if (days <= 7) {
    return {
      type: 'urgent' as const,
      label: `Últimos dias! Encerra em ${days} ${days === 1 ? 'dia' : 'dias'}`,
      colorClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold animate-pulse',
      days
    };
  }

  if (days <= 21) {
    return {
      type: 'soon' as const,
      label: `Faltam ${days} dias`,
      colorClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      days
    };
  }

  return {
    type: 'open' as const,
    label: `Inscrições Abertas (${days} dias restantes)`,
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    days
  };
}
