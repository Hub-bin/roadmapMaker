import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// ES Module 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [핵심 변경] 서버를 시작하는 함수를 export 합니다.
// saveDir: 데이터를 저장할 실제 경로 (User Data 폴더)
// resourcesDir: 리소스(빌드된 React)가 있는 경로
export function startServer(saveDir, resourcesDir) {
  const app = express();
  const PORT = 3001;

  app.use(cors());
  app.use(express.json());

  const DATA_DIR = path.join(saveDir, "roadmap_data");
  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
  const DATA_FILE = path.join(DATA_DIR, "data.json");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // 초기 파일이 없으면 기본 객체 구조로 생성
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ title: "Roadmap Workspace", items: [] }, null, 2)
    );
  }

  // 2. 정적 파일 제공
  // 업로드된 이미지
  app.use("/uploads", express.static(UPLOADS_DIR));
  if (process.env.NODE_ENV !== "development") {
    const DIST_DIR = path.join(resourcesDir, "dist");
    app.use(express.static(DIST_DIR));
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });
  const upload = multer({ storage: storage });

  // 4. API 라우트
  app.get("/api/items", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) return res.json({ title: "New Project", items: [] });
      try {
        const parsed = JSON.parse(data);
        // 구버전 데이터(배열) 호환 처리
        if (Array.isArray(parsed)) {
          res.json({ title: "Legacy Project", items: parsed });
        } else {
          res.json(parsed); // { title: "...", items: [...] }
        }
      } catch {
        res.json({ title: "Error Project", items: [] });
      }
    });
  });

  app.post("/api/save", (req, res) => {
    // req.body는 { title: "...", items: [...] } 형태여야 함
    fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), (err) => {
      if (err) return res.status(500).send("Save failed");
      res.send("Saved");
    });
  });

  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).send("No file");
    res.json({ filename: req.file.filename });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Data Location: ${DATA_DIR}`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer(__dirname, __dirname);
}
