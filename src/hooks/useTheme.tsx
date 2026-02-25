import { useContext } from 'react';

import { ThemeContext } from '@/context/theme.tsx';

export function useTheme() {
  return useContext(ThemeContext);
}
