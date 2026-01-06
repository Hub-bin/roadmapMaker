import Papa from "papaparse";
import Xlsx from "xlsx-js-style";

// 매핑 테이블 (Code <-> Name)
const CATEGORY_MAP = {
  operation: "운영 원전",
  postcycle: "후행 주기",
  basetech: "기반 기술",
};
const WORKTYPE_MAP = {
  inspection: "정찰, 점검",
  multilink: "다중 연계",
  physical: "물리 작업",
  simulation: "시뮬레이션",
};

// 역매핑 (한글 -> Code)
const REV_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);
const REV_WORKTYPE_MAP = Object.fromEntries(
  Object.entries(WORKTYPE_MAP).map(([k, v]) => [v, k])
);

// 엑셀 저장 (Download Excel) - 기존 코드 유지
export const downloadExcel = (
  data,
  title = "Roadmap",
  filename = "roadmap.xlsx"
) => {
  const excelData = [
    [
      "ID",
      "카테고리",
      "작업 유형",
      "산출 과제",
      "시작일",
      "종료일",
      "요청 부서",
      "예산(억원)",
      "설명",
      "연계 항목 (이름)",
    ],
    ...data.map((item) => {
      const linkNames = item.links
        ? item.links
            .map((linkId) => {
              const target = data.find((d) => d.id === linkId);
              return target ? target.content : null;
            })
            .filter(Boolean)
            .join(", ")
        : "";
      return [
        item.id,
        CATEGORY_MAP[item.category] || item.category,
        WORKTYPE_MAP[item.workType] || item.workType,
        item.content,
        item.start,
        item.end,
        item.requestDept || "",
        item.budget || 0,
        item.description || "",
        linkNames,
      ];
    }),
  ];

  const ws = Xlsx.utils.aoa_to_sheet(excelData);

  // KHNP 스타일 헤더 (짙은 파랑 배경)
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "003764" } }, // KHNP Corporate Blue
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const range = Xlsx.utils.decode_range(ws["!ref"]);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = Xlsx.utils.encode_cell({ r: 0, c: C });
    if (ws[address]) ws[address].s = headerStyle;
  }

  ws["!cols"] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 40 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 40 },
    { wch: 30 },
  ];

  const wb = Xlsx.utils.book_new();
  Xlsx.utils.book_append_sheet(wb, ws, "Roadmap Data");
  wb.Props = { Title: title };
  Xlsx.writeFile(wb, filename);
};

// JSON 저장 - 기존 유지
export const downloadJSON = (data, title, filename = "roadmap.json") => {
  const exportData = { title, items: data };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// [수정] 파일 파싱 (XLSX 읽기 추가)
export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (Array.isArray(json))
            resolve({ title: "Imported Project", items: json });
          else
            resolve({
              title: json.title || "Imported Project",
              items: json.items || [],
            });
        } catch (err) {
          reject("JSON 파싱 오류");
        }
      };
      reader.readAsText(file);
    } else if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) =>
          processParsedData(results.data, resolve, file.name),
        error: (err) => reject("CSV 파싱 오류: " + err.message),
      });
    } else if (ext === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = Xlsx.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // XLSX -> JSON 변환
          const jsonData = Xlsx.utils.sheet_to_json(sheet);
          processParsedData(jsonData, resolve, file.name);
        } catch (err) {
          reject("XLSX 파싱 오류: " + err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject("지원하지 않는 형식입니다.");
    }
  });
};

// [공통] 파싱된 데이터 정제 및 ID 매핑 로직
const processParsedData = (rawData, resolve, filename) => {
  const tempItems = rawData.map((row, index) => {
    // 엑셀 헤더명(한글) 또는 키값(영어) 호환 처리
    const getVal = (keys) => {
      for (const key of keys) if (row[key] !== undefined) return row[key];
      return "";
    };

    const categoryRaw = getVal(["카테고리", "category"]) || "basetech";
    const workTypeRaw = getVal(["작업 유형", "workType"]) || "inspection";

    return {
      id: Number(getVal(["ID", "id"])) || Date.now() + index,
      content: getVal(["산출 과제", "항목명", "content"]),
      start: getVal(["시작일", "start"]),
      end: getVal(["종료일", "end"]),
      category: REV_CATEGORY_MAP[categoryRaw] || categoryRaw,
      workType: REV_WORKTYPE_MAP[workTypeRaw] || workTypeRaw,
      requestDept: getVal(["요청 부서", "requestDept"]),
      budget: Number(getVal(["예산(억원)", "예산", "budget"])) || 0,
      description: getVal(["설명", "description"]),
      _tempLinkNames: getVal(["연계 항목 (이름)", "연계 항목 ID", "links"]),
    };
  });

  const finalItems = tempItems.map((item) => {
    let links = [];
    if (item._tempLinkNames) {
      const str = String(item._tempLinkNames); // 문자열 변환 보장
      const splitLinks = str
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter((s) => s !== "");

      splitLinks.forEach((linkInfo) => {
        if (!isNaN(linkInfo)) links.push(Number(linkInfo));
        else {
          const target = tempItems.find((t) => t.content === linkInfo);
          if (target) links.push(target.id);
        }
      });
    }
    const { _tempLinkNames, ...rest } = item;
    return { ...rest, links };
  });

  resolve({ title: filename.split(".")[0], items: finalItems });
};
