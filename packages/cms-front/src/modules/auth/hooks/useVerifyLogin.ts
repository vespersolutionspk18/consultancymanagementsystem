import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'cms-shared/utils';
import { AppPath } from 'cms-shared/types';
import { useGetAuthTokensFromLoginTokenMutation } from '~/generated-metadata/graphql';
import { cookieStorage } from '~/utils/cookie-storage';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useVerifyLogin = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const [getAuthTokensFromLoginToken] =
    useGetAuthTokensFromLoginTokenMutation();
  const { t } = useLingui();

  const verifyLoginToken = async (loginToken: string) => {
    try {
      const result = await getAuthTokensFromLoginToken({
        variables: {
          loginToken,
          origin: window.location.origin,
        },
      });

      if (isDefined(result.errors)) {
        throw result.errors;
      }

      const tokens = result.data?.getAuthTokensFromLoginToken?.tokens;

      if (!tokens) {
        throw new Error('No tokens returned');
      }

      // Write tokens directly to cookie storage, then hard-reload.
      // This avoids a race condition where in-flight token renewals
      // from the previous workspace overwrite these new tokens.
      cookieStorage.setItem('tokenPair', JSON.stringify(tokens));
      window.location.href = '/';
    } catch {
      enqueueErrorSnackBar({
        message: t`Authentication failed`,
      });
      navigate(AppPath.SignInUp);
    }
  };

  return { verifyLoginToken };
};
