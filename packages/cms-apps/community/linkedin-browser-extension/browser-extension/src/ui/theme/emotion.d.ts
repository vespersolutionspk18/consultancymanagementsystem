import type { ThemeType } from 'cms-ui/theme';

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
