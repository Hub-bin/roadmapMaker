import React, { useEffect, useRef } from "react";
import { Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import {
  createItemContent,
  getItemClassName,
  drawConnectors,
} from "../utils/visHelper";

const TimelineView = ({ items, groups, onSelect, selectedId }) => {
  const containerRef = useRef(null);
  const timelineInstance = useRef(null);
  const onSelectRef = useRef(onSelect);
  const svgRef = useRef(null);
  const drawTimeoutRef = useRef(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // 데이터 가공 (헬퍼 함수 사용)
  const processedItems = items.map((item) => ({
    ...item,
    content: createItemContent(item),
    group: item.category,
    className: getItemClassName(item),
    type: "range",
  }));

  // 화살표 그리기 래퍼 (디바운싱 적용)
  const handleDrawArrows = () => {
    if (drawTimeoutRef.current) clearTimeout(drawTimeoutRef.current);
    drawTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        drawConnectors(timelineInstance.current, svgRef.current, items);
      });
    }, 15);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (!timelineInstance.current) {
      const options = {
        width: "100%",
        height: "100%",
        start: "2024-01-01",
        end: "2024-12-31",
        min: "2020-01-01",
        max: "2050-12-31",
        stack: true,
        groupOrder: "id",
        verticalScroll: true,
        zoomable: true,
        moveable: true,
        zoomKey: "",
        selectable: true,
        multiselect: false,
        showCurrentTime: true,
        orientation: { axis: "top", item: "top" },
        margin: { item: { vertical: 20, horizontal: 10 }, axis: 10 },
      };

      timelineInstance.current = new Timeline(
        containerRef.current,
        processedItems,
        groups,
        options
      );

      timelineInstance.current.on("click", (props) => {
        const id = props.item;
        timelineInstance.current.setSelection(id ? id : []);
        if (onSelectRef.current) onSelectRef.current(id || null);
      });

      // 이벤트 바인딩
      timelineInstance.current.on("changed", handleDrawArrows);
      timelineInstance.current.on("rangechange", handleDrawArrows);
      timelineInstance.current.on("rangechanged", handleDrawArrows);

      const handleResize = () => {
        timelineInstance.current?.redraw();
        handleDrawArrows();
      };
      window.addEventListener("resize", handleResize);
      setTimeout(handleDrawArrows, 500);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    } else {
      timelineInstance.current.setItems(processedItems);
      timelineInstance.current.setGroups(groups);
      if (selectedId) timelineInstance.current.setSelection([selectedId]);
      timelineInstance.current.redraw();
      setTimeout(handleDrawArrows, 100);
    }
  }, [processedItems, groups, selectedId]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        ref={containerRef}
        id="timeline-target"
        style={{ width: "100%", height: "100%", flex: 1 }}
      ></div>
      <svg
        ref={svgRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 50,
        }}
      ></svg>
    </div>
  );
};

export default TimelineView;
