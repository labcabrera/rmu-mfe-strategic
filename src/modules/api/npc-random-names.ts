import { AuthContextProps } from 'react-oidc-context';
import { callApi } from '@labcabrera-rmu/rmu-react-shared-lib';
import { apiNpcNames } from '../services/config';

export async function fetchRandomName(
  race: string | undefined,
  gender: string | undefined,
  auth: AuthContextProps
): Promise<string> {
  const url = `${apiNpcNames}/random-names?race=${race || 'generic'}&gender=${gender || 'male'}`;
  return callApi(auth, url, { method: 'GET' })
    .then((response) => {
      console.log('api name response: ', response);
      return response;
    })
    .then((response) => response.name);
}
