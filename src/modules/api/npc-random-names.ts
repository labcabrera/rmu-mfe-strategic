import { AuthContextProps } from 'react-oidc-context';
import { apiNpcNamesUrl as apiNpcNames, callApi } from '@labcabrera-rmu/rmu-react-shared-lib';

export async function fetchRandomName(
  race: string | undefined,
  gender: string | undefined,
  auth: AuthContextProps
): Promise<string> {
  const url = `${apiNpcNames}/random-names?race=${race || 'generic'}&gender=${gender || 'male'}`;
  return callApi(auth, url, { method: 'GET' }).then((response) => response.name);
}
