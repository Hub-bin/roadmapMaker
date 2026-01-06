import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // 확장자(.jsx) 명시 권장
import "./index.css"; // 기본 css가 있다면 유지, 없다면 삭제 가능

ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode는 개발 중 두 번 렌더링을 유발하므로
  // Vis.js 같은 라이브러리와 충돌을 피하기 위해 잠시 껐다가 켤 수도 있습니다.
  // 여기서는 켜둡니다.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
