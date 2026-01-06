import React, { useRef } from "react";

const StartScreen = ({ onNew, onContinue, onLoad }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoad(file);
    }
  };

  return (
    <div className="start-screen">
      <div className="start-card">
        {/* 로고 영역 (텍스트로 대체하거나 이미지 추가 가능) */}
        <h1>☢️ Nuclear Roadmap System</h1>
        <p className="subtitle">
          원전 기술 개발 및 운영 로드맵 통합 관리 시스템입니다.
          <br />
          작업 방식을 선택하여 시작해주세요.
        </p>

        <div className="action-grid">
          {/* 1. 새로 만들기 */}
          <button className="start-btn primary" onClick={onNew}>
            <div className="icon">📝</div>
            <div className="label">새로 만들기</div>
            <div className="desc">
              빈 화면에서 새로운
              <br />
              로드맵을 작성합니다.
            </div>
          </button>

          {/* 2. 이어서 하기 */}
          <button className="start-btn" onClick={onContinue}>
            <div className="icon">📂</div>
            <div className="label">이어서 만들기</div>
            <div className="desc">
              최근 작업 중이던
              <br />
              서버 데이터를 불러옵니다.
            </div>
          </button>

          {/* 3. 파일 불러오기 */}
          <button
            className="start-btn"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="icon">📤</div>
            <div className="label">파일 불러오기</div>
            <div className="desc">
              PC에 저장된 Excel/JSON
              <br />
              파일을 엽니다.
            </div>
          </button>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".csv,.json,.xlsx" // xlsx 추가
          onChange={handleFileChange}
        />

        <p className="footer-info">
          © 2025 Nuclear Roadmap System. Optimized for KHNP Standards.
          <br />
          Ver 2.1 | React + Vis.js + Electron
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
