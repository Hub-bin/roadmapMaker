import React from "react";
import { CATEGORY_MAP } from "../constants/config";

const DetailPanel = ({ selectedItem, onDelete, onEdit }) => {
  if (!selectedItem) {
    return (
      <div className="detail-panel empty">
        항목을 선택하여 상세 정보를 확인하세요.
      </div>
    );
  }

  const imageUrl = selectedItem.image
    ? `http://localhost:3001/uploads/${selectedItem.image}`
    : null;
  const formattedBudget = selectedItem.budget
    ? Number(selectedItem.budget).toLocaleString()
    : "0";
  const categoryLabel =
    CATEGORY_MAP[selectedItem.category] || selectedItem.category;

  return (
    <div className="detail-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <h2>{selectedItem.content}</h2>
        <span
          className={`badge`}
          style={{
            border: "1px solid #ddd",
            background: "#f8f9fa",
            color: "#555",
          }}
        >
          {categoryLabel}
        </span>
      </div>

      {selectedItem.requestDept && (
        <p style={{ marginTop: "5px", color: "#555" }}>
          📢 <strong>요청 부서:</strong> {selectedItem.requestDept}
        </p>
      )}

      <p>
        <strong>기간:</strong> {selectedItem.start} ~ {selectedItem.end}
      </p>
      <p>
        <strong>💰 예산:</strong> {formattedBudget} 억원
      </p>

      {imageUrl && (
        <div
          style={{
            margin: "15px 0",
            textAlign: "center",
            background: "#f4f4f5",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <img
            src={imageUrl}
            alt="Representative"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: "4px",
            }}
          />
        </div>
      )}

      <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.5", color: "#444" }}>
        {selectedItem.description}
      </p>

      <hr
        style={{
          margin: "15px 0",
          border: "none",
          borderTop: "1px solid #eee",
        }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#6c757d" }}
          onClick={() => onEdit(selectedItem)}
        >
          ✏️ 수정하기
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(selectedItem.id)}
        >
          🗑️ 삭제하기
        </button>
      </div>
    </div>
  );
};

export default DetailPanel;
