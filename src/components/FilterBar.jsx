import React from "react";
import { CATEGORY_MAP, WORKTYPE_MAP } from "../constants/config";

const FilterBar = ({
  categories,
  activeCategories,
  onToggleCategory,
  workTypes,
  activeWorkTypes,
  onToggleWorkType,
  counts,
}) => {
  return (
    <div className="filter-box">
      {/* 1. 카테고리 필터 */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <strong style={{ minWidth: "70px", color: "var(--khnp-blue)" }}>
          카테고리:
        </strong>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tag-btn ${
              activeCategories.includes(cat) ? "active" : ""
            }`}
            onClick={() => onToggleCategory(cat)}
          >
            {CATEGORY_MAP[cat] || cat} ({counts[cat] || 0})
          </button>
        ))}
      </div>

      {/* 구분선 (선택) */}
      <div
        style={{
          width: "1px",
          height: "20px",
          background: "#ddd",
          margin: "0 10px",
        }}
      ></div>

      {/* 2. 작업 유형 필터 */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <strong style={{ minWidth: "70px", color: "var(--khnp-blue)" }}>
          작업 유형:
        </strong>
        {workTypes.map((type) => (
          <button
            key={type}
            className={`tag-btn ${
              activeWorkTypes.includes(type) ? "active" : ""
            }`}
            onClick={() => onToggleWorkType(type)}
            style={{
              borderLeft: `4px solid ${
                type === "inspection"
                  ? "#ffa000"
                  : type === "multilink"
                  ? "#8e24aa"
                  : type === "physical"
                  ? "#e53935"
                  : "#00897b"
              }`,
            }}
          >
            {WORKTYPE_MAP[type] || type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
