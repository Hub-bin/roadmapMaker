// src/utils/visHelper.js

export const createItemContent = (item) => {
  const content = item.content || "제목 없음";
  const startYear = item.start ? String(item.start).substring(0, 4) : "";
  const endYear = item.end ? String(item.end).substring(0, 4) : "";
  const requestDept = item.requestDept || "";
  const titleClass =
    String(content).length > 15 ? "item-title long-text" : "item-title";

  let html = `<div class="item-inner" data-id="${item.id}">`;
  if (requestDept) html += `<div class="item-dept">(${requestDept})</div>`;
  html += `<div class="${titleClass}">${content}</div>`;
  html += `<div class="item-year">${startYear} ~ ${endYear}</div>`;
  html += `</div>`;
  return html;
};

export const getItemClassName = (item) => {
  let classNames = `work-${item.workType || "inspection"}`;
  if (item.start && item.end) {
    const today = new Date().toISOString().split("T")[0];
    if (item.end < today) classNames += " status-completed";
    else if (item.start <= today && item.end >= today)
      classNames += " status-ongoing";
  }
  if (!item.requestDept) classNames += " item-compact";
  return classNames;
};

// [핵심 수정] 화살표 그리기 함수 (좌표 보정 적용)
export const drawConnectors = (timeline, svg, items) => {
  if (!timeline || !svg || !Array.isArray(items)) return;

  const itemSet = timeline.itemSet;
  if (!itemSet || !itemSet.items) return;

  // SVG 초기화
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // 컨테이너(TimelineView의 루트 div)의 좌표값
  // svg는 position: absolute; top:0; left:0 이므로 이 컨테이너가 기준점(0,0)입니다.
  const containerRect = svg.getBoundingClientRect();

  // 마커(화살표 머리) 정의
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("refX", "10");
  marker.setAttribute("refY", "3.5");
  marker.setAttribute("orient", "auto");
  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
  polygon.setAttribute("fill", "#555"); // KHNP Gray Tone
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  items.forEach((item) => {
    if (
      !item ||
      !item.links ||
      !Array.isArray(item.links) ||
      item.links.length === 0
    )
      return;

    // Source(출발지) 아이템의 DOM 찾기
    const sourceComp = itemSet.items[item.id];
    if (
      !sourceComp ||
      !sourceComp.displayed ||
      !sourceComp.dom ||
      !sourceComp.dom.box
    )
      return;

    const sRect = sourceComp.dom.box.getBoundingClientRect();

    // [중요] 좌표 계산: (아이템의 절대 위치) - (컨테이너의 절대 위치) = (컨테이너 내 상대 위치)
    const x1 = sRect.right - containerRect.left;
    const y1 = sRect.top - containerRect.top + sRect.height / 2;

    item.links.forEach((targetId) => {
      // Target(도착지) 아이템 찾기
      const targetComp = itemSet.items[targetId];
      if (
        !targetComp ||
        !targetComp.displayed ||
        !targetComp.dom ||
        !targetComp.dom.box
      )
        return;

      const tRect = targetComp.dom.box.getBoundingClientRect();
      const x2 = tRect.left - containerRect.left;
      const y2 = tRect.top - containerRect.top + tRect.height / 2;

      // SVG Path 그리기
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      // S자 곡선 계산 (아이템 간 거리가 멀수록 곡률을 키움)
      const distance = Math.abs(x2 - x1);
      const controlOffset = Math.min(distance * 0.6, 200); // 최대 200px까지만 휨

      const d = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${
        x2 - controlOffset
      } ${y2}, ${x2} ${y2}`;

      path.setAttribute("d", d);
      path.setAttribute("stroke", "#666");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("fill", "none");
      path.setAttribute("marker-end", "url(#arrowhead)");
      path.setAttribute("opacity", "0.6");

      svg.appendChild(path);
    });
  });
};
