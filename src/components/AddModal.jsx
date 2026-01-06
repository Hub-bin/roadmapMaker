import React, { useState, useEffect, useMemo } from "react";
import { CATEGORY_MAP, WORKTYPE_MAP } from "../constants/config";
import { uploadImage } from "../services/api";

const AddModal = ({ isOpen, onClose, onSave, initialData, items = [] }) => {
  const [formData, setFormData] = useState({
    content: "",
    start: "",
    end: "",
    category: "basetech",
    workType: "inspection",
    requestDept: "",
    description: "",
    budget: "",
    image: null,
    links: [],
  });

  const [file, setFile] = useState(null);

  // 필터링 상태
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterWorkType, setFilterWorkType] = useState("all");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData, links: initialData.links || [] });
        setFile(null);
      } else {
        setFormData({
          content: "",
          start: "",
          end: "",
          category: "basetech",
          workType: "inspection",
          requestDept: "",
          description: "",
          budget: "",
          image: null,
          links: [],
        });
        setFile(null);
      }
      setFilterCategory("all");
      setFilterWorkType("all");
    }
  }, [isOpen, initialData]);

  const filteredCandidateItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      if (initialData && item.id === initialData.id) return false;
      if (filterCategory !== "all" && item.category !== filterCategory)
        return false;
      if (filterWorkType !== "all" && item.workType !== filterWorkType)
        return false;
      return true;
    });
  }, [items, initialData, filterCategory, filterWorkType]);

  if (!isOpen) return null;

  const handleLinkChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setFormData({ ...formData, links: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalImageName = formData.image;

    if (file) {
      try {
        const result = await uploadImage(file); // 서비스 함수 사용
        finalImageName = result.filename;
      } catch (err) {
        alert("이미지 업로드 실패");
        return;
      }
    }
    onSave({ ...formData, image: finalImageName });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form
        className="modal-content"
        onSubmit={handleSubmit}
        style={{ width: "550px" }}
      >
        <h3 style={{ margin: "0 0 15px 0", color: "var(--khnp-blue)" }}>
          {initialData ? "항목 수정" : "새 항목 추가"}
        </h3>

        <input
          placeholder="과제명 / 항목명"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.8rem", color: "#666" }}>
              카테고리
            </label>
            <select
              style={{ width: "100%" }}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.8rem", color: "#666" }}>
              작업 유형
            </label>
            <select
              style={{ width: "100%" }}
              value={formData.workType}
              onChange={(e) =>
                setFormData({ ...formData, workType: e.target.value })
              }
            >
              {Object.entries(WORKTYPE_MAP).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            style={{ flex: 1 }}
            placeholder="요청 부서"
            value={formData.requestDept}
            onChange={(e) =>
              setFormData({ ...formData, requestDept: e.target.value })
            }
          />
          <input
            style={{ flex: 1 }}
            type="number"
            placeholder="예산 (억원)"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: e.target.value })
            }
          />
        </div>

        <div style={{ display: "flex", gap: "5px" }}>
          <input
            type="date"
            required
            value={formData.start}
            onChange={(e) =>
              setFormData({ ...formData, start: e.target.value })
            }
          />
          <input
            type="date"
            required
            value={formData.end}
            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
          />
        </div>

        <textarea
          placeholder="상세 설명"
          rows="3"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <div
          style={{
            border: "1px dashed #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "0.9rem",
            }}
          >
            📷 대표 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* 연계 항목 선택 영역 */}
        <div
          style={{
            marginTop: "10px",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "var(--khnp-blue)",
            }}
          >
            🔗 연계 항목 설정 (Ctrl + 클릭으로 다중 선택)
          </label>

          <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
            <select
              style={{ flex: 1, fontSize: "0.8rem", padding: "5px" }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">모든 카테고리</option>
              {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              style={{ flex: 1, fontSize: "0.8rem", padding: "5px" }}
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value)}
            >
              <option value="all">모든 유형</option>
              {Object.entries(WORKTYPE_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <select
            multiple
            style={{
              width: "100%",
              height: "80px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "5px",
            }}
            value={formData.links}
            onChange={handleLinkChange}
          >
            {filteredCandidateItems.length > 0 ? (
              filteredCandidateItems.map((item) => (
                <option key={item.id} value={item.id}>
                  [{CATEGORY_MAP[item.category]}] {item.content}
                </option>
              ))
            ) : (
              <option disabled>항목 없음</option>
            )}
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            {initialData ? "수정 완료" : "추가하기"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddModal;
