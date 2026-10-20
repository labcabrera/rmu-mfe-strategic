import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isApiError, Notify, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Domain error code of an rmu-api-strategic error body (`{ errorCode, message }`), when it is a translatable one. */
export const apiErrorCode = (error: unknown): string | undefined => {
  if (!isApiError(error)) return undefined;
  try {
    const code = JSON.parse(error.body)?.errorCode;
    return typeof code === 'string' && code.startsWith('err-') ? code : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The MFE notifications, with the rule errors of rmu-api-strategic (`err-trait-max-cost`...) shown by their translated
 * code instead of the generic "bad request" and the English detail. Other errors are shown as usual.
 */
export const useStrategicNotify = (): Notify => {
  const notify = useNotify();
  const { t, i18n } = useTranslation();
  return useMemo<Notify>(
    () => ({
      ...notify,
      error: (error: unknown) => {
        const code = apiErrorCode(error);
        if (code && i18n.exists(code)) notify.error(t(code));
        else notify.error(error);
      },
    }),
    [notify, t, i18n]
  );
};
