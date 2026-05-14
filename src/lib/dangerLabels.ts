import type { ImageSourcePropType } from 'react-native';

export const DANGER_LABEL_IMAGES: Record<string, ImageSourcePropType> = {
  'class1.gif': require('../../assets/danger-labels/class1.gif'),
  'class1_4.gif': require('../../assets/danger-labels/class1_4.gif'),
  'class1_5.gif': require('../../assets/danger-labels/class1_5.gif'),
  'class1_6.gif': require('../../assets/danger-labels/class1_6.gif'),
  'class2_1a.gif': require('../../assets/danger-labels/class2_1a.gif'),
  'class2_1b.gif': require('../../assets/danger-labels/class2_1b.gif'),
  'class2_2a.gif': require('../../assets/danger-labels/class2_2a.gif'),
  'class2_2b.gif': require('../../assets/danger-labels/class2_2b.gif'),
  'class2_3.gif': require('../../assets/danger-labels/class2_3.gif'),
  'class3a.gif': require('../../assets/danger-labels/class3a.gif'),
  'class3b.gif': require('../../assets/danger-labels/class3b.gif'),
  'class4_1.gif': require('../../assets/danger-labels/class4_1.gif'),
  'class4_2.gif': require('../../assets/danger-labels/class4_2.gif'),
  'class4_3a.gif': require('../../assets/danger-labels/class4_3a.gif'),
  'class4_3b.gif': require('../../assets/danger-labels/class4_3b.gif'),
  'class5_1.gif': require('../../assets/danger-labels/class5_1.gif'),
  'class5_2a.gif': require('../../assets/danger-labels/class5_2a.gif'),
  'class5_2b.gif': require('../../assets/danger-labels/class5_2b.gif'),
  'class6_1.gif': require('../../assets/danger-labels/class6_1.gif'),
  'class6_2.gif': require('../../assets/danger-labels/class6_2.gif'),
  'class7a.gif': require('../../assets/danger-labels/class7a.gif'),
  'class7b.gif': require('../../assets/danger-labels/class7b.gif'),
  'class7c.gif': require('../../assets/danger-labels/class7c.gif'),
  'class7e.gif': require('../../assets/danger-labels/class7e.gif'),
  'class8.gif': require('../../assets/danger-labels/class8.gif'),
  'class9.gif': require('../../assets/danger-labels/class9.gif'),
};

export function parseDangerLabels(csv: string | null | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
