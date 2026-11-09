import { useCallback, useState } from 'react';
import { useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * A request with a busy flag: `run(promise, onSuccess)` marks it busy, notifies a failure (translating the `err-*`
 * codes of the API) and clears the flag when it finishes.
 */
export const useBusyAction = () => {
  const notify = useApiNotify();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    <T>(action: Promise<T>, onSuccess?: (result: T) => void) => {
      setBusy(true);
      return action
        .then(onSuccess)
        .catch(notify.error)
        .finally(() => setBusy(false));
    },
    [notify]
  );
  return { busy, run };
};
