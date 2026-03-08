import { useRecoilTransactionObserver_UNSTABLE } from 'recoil';

import { logDebug } from '~/utils/logDebug';

const isDebugMode = process.env.IS_DEBUG_MODE === 'true';

const formatTitle = (stateName: string) => {
  const headerCss = [
    'color: gray; font-weight: lighter',
    'color: black; font-weight: bold;',
  ];

  const parts = ['%c recoil', `%c${stateName}`];

  return [parts.join(' '), ...headerCss];
};

const RecoilDebugObserverEffectInternal = () => {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (const node of Array.from(
      snapshot.getNodes_UNSTABLE({ isModified: true }),
    )) {
      const loadable = snapshot.getLoadable(node);

      const titleArgs = formatTitle(node.key);

      console.groupCollapsed(...titleArgs);

      logDebug('STATE', loadable.state);

      logDebug('CONTENTS', loadable.contents);

      console.groupEnd();
    }
  });
  return null;
};

export const RecoilDebugObserverEffect = () => {
  if (!isDebugMode) {
    return null;
  }

  return <RecoilDebugObserverEffectInternal />;
};
