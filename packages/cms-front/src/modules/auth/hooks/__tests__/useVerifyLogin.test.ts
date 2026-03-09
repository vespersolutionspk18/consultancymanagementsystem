import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from 'cms-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { useGetAuthTokensFromLoginTokenMutation } from '~/generated-metadata/graphql';
import { cookieStorage } from '~/utils/cookie-storage';

import { SOURCE_LOCALE } from 'cms-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

jest.mock('~/generated-metadata/graphql', () => ({
  useGetAuthTokensFromLoginTokenMutation: jest.fn(),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: jest.fn(),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: jest.fn(),
}));

jest.mock('~/utils/cookie-storage', () => ({
  cookieStorage: {
    setItem: jest.fn(),
  },
}));

dynamicActivate(SOURCE_LOCALE);

const renderHooks = () => {
  const { result } = renderHook(() => useVerifyLogin(), {
    wrapper: ({ children }) =>
      RecoilRoot({ children: I18nProvider({ i18n, children }) }),
  });
  return { result };
};

describe('useVerifyLogin', () => {
  const mockMutate = jest.fn();
  const mockEnqueueErrorSnackBar = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useGetAuthTokensFromLoginTokenMutation as jest.Mock).mockReturnValue([
      mockMutate,
    ]);

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    });

    (useNavigateApp as jest.Mock).mockReturnValue(mockNavigate);

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: 'https://example.com', href: '' },
    });
  });

  it('should verify login token and hard reload', async () => {
    const tokens = {
      accessOrWorkspaceAgnosticToken: { token: 'access', expiresAt: '' },
      refreshToken: { token: 'refresh', expiresAt: '' },
    };
    mockMutate.mockResolvedValueOnce({
      data: { getAuthTokensFromLoginToken: { tokens } },
    });

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        loginToken: 'test-token',
        origin: 'https://example.com',
      },
    });
    expect(cookieStorage.setItem).toHaveBeenCalledWith(
      'tokenPair',
      JSON.stringify(tokens),
    );
    expect(window.location.href).toBe('/');
  });

  it('should handle verification error', async () => {
    const error = new Error('Verification failed');
    mockMutate.mockRejectedValueOnce(error);

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Authentication failed',
    });
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.SignInUp);
  });
});
