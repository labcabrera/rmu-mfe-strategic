import {
  EnchantmentProject,
  EnchantmentStatus,
  enchantmentTotalDays,
  StatusBadgeColor,
} from '@labcabrera-rmu/rmu-react-shared-lib';

export const STATUS_COLORS: Record<EnchantmentStatus, StatusBadgeColor> = {
  'pending-failures': 'warning',
  'in-progress': 'info',
  suspended: 'default',
  completed: 'success',
  cancelled: 'error',
};

/** Days worked of all the days of a project, extra days included, as a percent. */
export const enchantmentPercent = (project: EnchantmentProject): number => {
  const total = enchantmentTotalDays(project);
  return total > 0 ? Math.min(100, Math.round((project.daysCompleted / total) * 100)) : 100;
};

/** The spells of a project whose SCR failed and still lack their failure roll. */
export const pendingFailures = (project: EnchantmentProject) =>
  project.scr.filter((scr) => scr.failed && scr.failureRoll === null);

/** The error code of an API error (`err-enchantment-…`), for the texts of a quote that cannot be made. */
export const errorCode = (error: unknown): string => {
  const e = error as { code?: string; errorCode?: string; message?: string };
  return e?.code ?? e?.errorCode ?? e?.message ?? 'error';
};
