export type Substance = {
  id: number;
  subkey: string;
  substance: string;
  un_number: string;
  hin: string;
  adr_label: string;
  adr_class: string;
  classify_code: string;
  packing_group: string;
  eric: string;
  instruction_id: number;
};

export type SubstanceListRow = Substance & {
  has_distance: 0 | 1;
  danger_labels: string | null;
};

export type SubstanceDetails = Substance & {
  hin_descr: string | null;
  danger_labels: string | null;
  class_descr: string | null;
  group_descr: string | null;
  code_descr: string | null;
};

export type DistanceRow = {
  id: number;
  un_number: string;
  small_spill_fence_m: string;
  small_spill_fence_ft: string;
  small_spill_guard_day_km: string;
  small_spill_guard_day_mi: string;
  small_spill_guard_night_km: string;
  small_spill_guard_night_mi: string;
  large_spill_fence_m: string;
  large_spill_fence_ft: string;
  large_spill_guard_day_km: string;
  large_spill_guard_day_mi: string;
  large_spill_guard_night_km: string;
  large_spill_guard_night_mi: string;
};

export type Instruction = { id: number; instruction: string; substance: string };

export type AdrClass = {
  id: number;
  class_code: string;
  class_descr: string;
  is_subclass: 0 | 1;
  danger_labels: string;
};
