import React, { useState, useMemo } from "react";
// CSS 파일 분할 임포트
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/vis-custom.css";
// 기존 App.css가 남아있다면 삭제하거나 내용 비우기 (중복 방지)

// 분리된 모듈 임포트
import {
  TIMELINE_GROUPS,
  INITIAL_CATEGORIES,
  INITIAL_WORKTYPES,
} from "./constants/config";
import { saveItems, fetchItems } from "./services/api";
import { downloadExcel, downloadJSON, parseFile } from "./utils/fileHandler";

import StartScreen from "./components/StartScreen";
import FilterBar from "./components/FilterBar";
import TimelineView from "./components/TimelineView";
import DetailPanel from "./components/DetailPanel";
import AddModal from "./components/AddModal";

function App() {
  const [viewMode, setViewMode] = useState("start");
  const [roadmapTitle, setRoadmapTitle] = useState("Roadmap Workspace");
  const [items, setItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [activeCategories, setActiveCategories] = useState(INITIAL_CATEGORIES);
  const [activeWorkTypes, setActiveWorkTypes] = useState(INITIAL_WORKTYPES);

  // 데이터 저장 래퍼 함수
  const handleSaveData = (newItems, newTitle) => {
    const titleToSave = newTitle !== undefined ? newTitle : roadmapTitle;
    setItems(newItems);
    if (newTitle !== undefined) setRoadmapTitle(newTitle);

    // API 호출로 분리됨
    saveItems(newItems, titleToSave);
  };

  const sanitizeData = (data) => {
    if (!Array.isArray(data)) {
      console.warn("Data is not an array:", data);
      return [];
    }

    return data
      .map((d) => {
        // d가 null이나 undefined일 경우 대비
        if (!d) return null;

        return {
          ...d,
          // 카테고리가 유효하지 않으면 기본값 'basetech' 할당
          category: INITIAL_CATEGORIES.includes(d.category)
            ? d.category
            : "basetech",
          // 작업유형이 유효하지 않으면 기본값 'inspection' 할당
          workType: INITIAL_WORKTYPES.includes(d.workType)
            ? d.workType
            : "inspection",
          // 예산 숫자로 변환 (실패 시 0)
          budget: d.budget ? Number(d.budget) : 0,
          // 링크 배열 보장
          links: Array.isArray(d.links) ? d.links : [],
        };
      })
      .filter((item) => item !== null); // null 아이템 제거
  };

  // --- 이벤트 핸들러 ---
  const handleNew = () => {
    if (window.confirm("새 로드맵을 작성하시겠습니까?")) {
      handleSaveData([], "New Roadmap");
      setViewMode("workspace");
    }
  };

  const handleContinue = () => {
    fetchItems()
      .then((data) => {
        if (data.title) setRoadmapTitle(data.title);
        const rawItems = Array.isArray(data) ? data : data.items || [];
        setItems(sanitizeData(rawItems));
        setViewMode("workspace");
      })
      .catch(() => alert("서버 데이터 로드 실패"));
  };

  const handleLoadFile = async (file) => {
    try {
      const { title, items: loadedItems } = await parseFile(file);
      const sanitized = sanitizeData(loadedItems);
      handleSaveData(sanitized, title);
      setViewMode("workspace");
      alert("파일을 불러왔습니다.");
    } catch (err) {
      alert(`파일 로드 오류: ${err}`);
    }
  };

  const handleExport = (type) => {
    const now = new Date();
    const dateStr =
      now.toISOString().slice(0, 10).replace(/-/g, "") +
      "_" +
      now.toTimeString().slice(0, 5).replace(":", "");
    const safeTitle = roadmapTitle.replace(/\s+/g, "_");
    const filename = `${safeTitle}_${dateStr}`;

    if (type === "excel")
      downloadExcel(items, roadmapTitle, filename + ".xlsx");
    else downloadJSON(items, roadmapTitle, filename + ".json");
  };

  const handleSaveItem = (itemData) => {
    let newItems;
    if (editingItem) {
      newItems = items.map((item) =>
        item.id === editingItem.id ? { ...itemData, id: item.id } : item
      );
      if (selectedItem && selectedItem.id === editingItem.id)
        setSelectedItem({ ...itemData, id: editingItem.id });
    } else {
      const newItem = { ...itemData, id: Date.now() };
      newItems = [...items, newItem];
    }
    handleSaveData(newItems);
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const updatedItems = items.filter((item) => item.id !== id);
      handleSaveData(updatedItems);
      setSelectedItem(null);
    }
  };

  // --- 렌더링 헬퍼 ---
  const stats = useMemo(() => {
    const count = items.length;
    const budget = items.reduce(
      (sum, item) => sum + (Number(item.budget) || 0),
      0
    );
    return { count, budget: budget.toLocaleString() };
  }, [items]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.filter((item) => {
      // item이나 category가 없을 경우 방어
      if (!item || !item.category || !item.workType) return false;

      // activeCategories가 배열인지 확인
      const isCatMatch = Array.isArray(activeCategories)
        ? activeCategories.includes(item.category)
        : true;

      const isWorkMatch = Array.isArray(activeWorkTypes)
        ? activeWorkTypes.includes(item.workType)
        : true;

      return isCatMatch && isWorkMatch;
    });
  }, [items, activeCategories, activeWorkTypes]);

  const categoryCounts = useMemo(() => {
    const counts = { operation: 0, postcycle: 0, basetech: 0 };
    items.forEach((item) => {
      if (counts[item.category] !== undefined) counts[item.category]++;
    });
    return counts;
  }, [items]);

  const handleRefresh = () => {
    if (
      window.confirm(
        "화면을 새로고침 하시겠습니까? 저장되지 않은 변경사항은 사라질 수 있습니다."
      )
    ) {
      window.location.reload();
    }
  };

  if (viewMode === "start") {
    return (
      <StartScreen
        onNew={handleNew}
        onContinue={handleContinue}
        onLoad={handleLoadFile}
      />
    );
  }

  return (
    <div className="container">
      <div className="header-controls">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
          }}
        >
          <button
            className="btn"
            onClick={() => setViewMode("start")}
            style={{ background: "#eee", flexShrink: 0 }}
          >
            🏠 홈
          </button>
          <input
            className="title-input"
            value={roadmapTitle}
            onChange={(e) => setRoadmapTitle(e.target.value)}
            onBlur={() => handleSaveData(items, roadmapTitle)}
            placeholder="로드맵 제목"
          />
          <button
            className="btn"
            onClick={handleRefresh}
            style={{ background: "#eee", flexShrink: 0, padding: "8px 12px" }}
            title="새로고침"
          >
            🔄
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn"
            onClick={() => handleExport("excel")}
            style={{ background: "#2e7d32", color: "white" }}
          >
            Excel 다운로드
          </button>
          <button
            className="btn"
            onClick={() => handleExport("json")}
            style={{ background: "#0277bd", color: "white" }}
          >
            JSON 저장
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            + 항목 추가
          </button>
        </div>
      </div>

      <div className="roadmap-layout">
        <div className="roadmap-sidebar">
          <div className="sidebar-title">기술 개발 연혁</div>
        </div>
        <div className="roadmap-content">
          <TimelineView
            items={filteredData}
            groups={TIMELINE_GROUPS}
            onSelect={(id) => {
              const item = items.find((d) => d.id == id);
              setSelectedItem(
                selectedItem && selectedItem.id == id ? null : item || null
              );
            }}
            selectedId={selectedItem?.id || null}
          />
          <div className="roadmap-footer">
            📊 <strong>종합 정보:</strong> 총 <strong>{stats.count}</strong>개
            과제 / 총 예산 <strong>{stats.budget}</strong>억원
          </div>
        </div>
      </div>

      <FilterBar
        categories={INITIAL_CATEGORIES}
        activeCategories={activeCategories}
        onToggleCategory={(c) =>
          setActiveCategories((p) =>
            p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
          )
        }
        workTypes={INITIAL_WORKTYPES}
        activeWorkTypes={activeWorkTypes}
        onToggleWorkType={(t) =>
          setActiveWorkTypes((p) =>
            p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
          )
        }
        counts={categoryCounts}
      />
      {/* 필터바 호출 부분은 기존 코드 형태 유지하되 로직만 연결하면 됩니다 */}

      <DetailPanel
        selectedItem={selectedItem}
        onDelete={handleDelete}
        onEdit={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
      />

      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        items={items}
      />
    </div>
  );
}

export default App;
