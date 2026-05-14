import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, type Theme } from './colors';

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkPalette : lightPalette;
}
