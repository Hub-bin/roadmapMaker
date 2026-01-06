# 📅 Project Roadmap Management System (프로젝트 로드맵 관리 시스템)

![Version](https://img.shields.io/badge/version-2.1.0-003764) ![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react) ![Electron](https://img.shields.io/badge/Electron-28.1-47848F?logo=electron) ![License](https://img.shields.io/badge/license-Private-red)

**R&D, 운영, 유지보수 등 다양한 과제의 로드맵을 타임라인 형태로 시각화하고 관리하는 데스크톱 애플리케이션입니다.**
직관적인 UI와 강력한 데이터 관리 기능을 제공하여 복잡한 프로젝트 일정을 효율적으로 관리할 수 있습니다.

---

## ✨ 주요 기능 (Key Features)

- **📅 타임라인 시각화**: `Vis.js`를 활용하여 연도별 과제를 직관적으로 배치하고, 줌인/줌아웃 및 스크롤 기능을 지원합니다.
- **🔗 연계성 표현 (Dependency)**: 과제 간의 선후 관계 및 연계성을 화살표(SVG Bezier Curve)로 시각화합니다.
- **📂 데이터 호환성**:
  - 작성된 로드맵을 **Excel(.xlsx)** 파일로 스타일(색상, 테두리 등)을 유지하며 내보낼 수 있습니다.
  - 기존 Excel 및 CSV 파일을 불러와 로드맵을 생성할 수 있습니다.
- **🎨 전문적인 디자인**: 가독성을 고려한 Corporate Identity 컬러(Deep Blue & Teal)를 반영한 UI/UX를 제공합니다.
- **💾 로컬 데이터 관리**: 별도의 DB 서버 구축 없이 로컬 파일 시스템(`JSON`)을 통해 데이터를 안전하게 저장합니다.
- **🖥️ 크로스 플랫폼 지원**: Electron을 통해 Windows 및 Linux 데스크톱 앱으로 실행 가능합니다.

---

## 🛠 기술 스택 (Tech Stack)

| 구분              | 기술명                           | 설명                               |
| :---------------- | :------------------------------- | :--------------------------------- |
| **Frontend**      | **React + Vite**                 | 컴포넌트 기반 UI 개발 및 고속 빌드 |
| **Visualization** | **vis-timeline**                 | 타임라인 차트 렌더링 엔진          |
| **Backend**       | **Node.js + Express**            | 로컬 파일 I/O 및 API 서버          |
| **Data Handling** | **xlsx-js-style**, **papaparse** | 엑셀 스타일링 및 CSV 파싱          |
| **Desktop**       | **Electron**                     | 웹 애플리케이션 데스크톱 패키징    |

---

## 🚀 설치 및 실행 방법 (Getting Started)

### 1. 사전 요구사항 (Prerequisites)

- [Node.js](https://nodejs.org/) (v16.0.0 이상 권장)
- npm (Node Package Manager)

### 2. 설치 (Installation)

프로젝트를 클론하고 의존성 패키지를 설치합니다.

```bash
git clone [https://github.com/사용자명/roadmap-management-system.git](https://github.com/사용자명/roadmap-management-system.git)
cd roadmap-management-system
npm install
```

- Note: roadmap_data/ 폴더(실제 데이터 저장소)는 보안상의 이유로 Git에 포함되지 않습니다. 최초 실행 시 자동으로 생성됩니다.

### 3. 개발 모드 실행 (Development)

Frontend(React)와 Backend(Express)를 동시에 실행합니다.

```bash
npm run dev
```

---

## 📂 프로젝트 구조 (Directory Structure)

```text
roadmap-viewer/
├── public/             # 정적 리소스 (Icon, Logo)
├── src/
│   ├── components/     # UI 컴포넌트 (Timeline, Modal, Filter...)
│   ├── constants/      # 설정값 및 매핑 테이블 (Config)
│   ├── services/       # API 호출 로직
│   ├── styles/         # CSS 스타일시트 (Theme, Layout, Vis-custom)
│   ├── utils/          # 유틸리티 (Excel Handler, Vis Helper)
│   └── App.jsx         # 메인 애플리케이션 로직
├── roadmap_data/       # [Local DB] 데이터 및 이미지 저장소 (Git 제외됨)
├── server.js           # 로컬 백엔드 서버
├── electron-main.js    # Electron 메인 프로세스
└── ...
```

---

## 📝 라이선스 및 정보

- **Author:** Seo Yeongbin
- **Version:** 2.1.0
- **License:** Private (Internal Use Only)

---

## 💡 문제 해결 (Troubleshooting)

- **화면이 하얗게 나오는 경우:** `roadmap_data/data.json` 파일이 손상되었을 수 있습니다. 해당 파일을 백업 후 삭제하고 프로그램을 재시작하세요.
- **빌드 오류 (ERR_ELECTRON_BUILDER_CANNOT_EXECUTE):** Linux에서 Windows 빌드 시 발생하는 문제입니다. `sudo apt install wine`을 통해 Wine을 설치하거나 Docker 빌드를 사용하세요.
