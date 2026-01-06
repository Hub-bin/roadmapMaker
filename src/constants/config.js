// src/constants/config.js

export const CATEGORY_MAP = {
  operation: "운영 원전",
  postcycle: "후행 주기",
  basetech: "기반 기술",
};

export const WORKTYPE_MAP = {
  inspection: "정찰, 점검",
  multilink: "다중 연계",
  physical: "물리 작업",
  simulation: "시뮬레이션",
};

// 역매핑
export const REV_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);
export const REV_WORKTYPE_MAP = Object.fromEntries(
  Object.entries(WORKTYPE_MAP).map(([k, v]) => [v, k])
);

export const TIMELINE_GROUPS = [
  { id: "operation", content: "운영 원전", style: "min-height: 150px;" },
  { id: "postcycle", content: "후행 주기", style: "min-height: 150px;" },
  { id: "basetech", content: "기반 기술", style: "min-height: 150px;" },
];

// [중요] 반드시 배열로 내보내져야 함
export const INITIAL_CATEGORIES = Object.keys(CATEGORY_MAP);
export const INITIAL_WORKTYPES = Object.keys(WORKTYPE_MAP);
