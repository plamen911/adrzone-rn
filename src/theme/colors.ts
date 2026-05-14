type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  danger: string;
  warning: string;
  success: string;
};

export const lightPalette: Palette = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1F4',
  border: '#E2E5EA',
  text: '#0E1116',
  textMuted: '#5A6573',
  accent: '#C8102E',
  accentText: '#FFFFFF',
  danger: '#C8102E',
  warning: '#E89B00',
  success: '#1F8A47',
};

export const darkPalette: Palette = {
  background: '#0B0D11',
  surface: '#15181F',
  surfaceAlt: '#1F232C',
  border: '#2A2F3A',
  text: '#F0F2F5',
  textMuted: '#8A93A1',
  accent: '#FF4F62',
  accentText: '#0B0D11',
  danger: '#FF4F62',
  warning: '#FFB347',
  success: '#4CC97A',
};

export type Theme = Palette;
