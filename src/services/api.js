const API_BASE_URL = "http://localhost:3001/api";

// 데이터 조회
export const fetchItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/items`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch items:", error);
    throw error;
  }
};

// 데이터 저장
export const saveItems = async (items, title) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, items }),
    });
    if (!response.ok) throw new Error("Save failed");
    return await response.text();
  } catch (error) {
    console.error("Failed to save items:", error);
    throw error;
  }
};

// 이미지 업로드
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Upload failed");
    return await response.json();
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};
