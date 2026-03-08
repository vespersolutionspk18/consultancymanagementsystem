import { useEffect, useRef } from 'react';
import { isDefined } from 'cms-shared/utils';

export const useInputFocusWithoutScrollOnMount = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDefined(inputRef.current)) {
      inputRef.current.focus({ preventScroll: true });
    }
  });

  return { inputRef };
};
