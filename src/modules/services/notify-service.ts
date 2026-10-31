import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isApiError, Notify, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Domain codes sent without the `err-` prefix; their i18n key is `err-<code>`. */
const UNPREFIXED_CODES = ['herb-without-effect', 'herb-not-applicable'];

/** Domain error code of an rmu-api-strategic error body (`{ code, message }`), when it is a translatable one.
 * Falls back to the deprecated `errorCode` alias that images released before workspace spec 021 still send. */
export const apiErrorCode = (error: unknown): string | undefined => {
  if (!isApiError(error)) return undefined;
  try {
    const body = JSON.parse(error.body);
    const code = body?.code ?? body?.errorCode;
    if (typeof code !== 'string') return undefined;
    if (code.startsWith('err-')) return code;
    // Herb rules of workspace spec 062 send their codes without the prefix
    return UNPREFIXED_CODES.includes(code) ? `err-${code}` : undefined;
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
