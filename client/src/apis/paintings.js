import axios from "axios";

// 🌍 Load API host from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("🌍 [paintings.js] API base URL is:", API_BASE_URL);

// ✅ Optional: reusable axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
});

// 🎯 Get all paintings
export function getAllPaintings() {
  const url = `${API_BASE_URL}/paintings`;
  console.log("🎯 [paintings.js] Fetching all paintings from:", url);
  return axios.get(url);
}

// 🔎 Get painting by ID
export const getPaintingById = (id) => {
  console.log("🔎 [paintings.js] Fetching painting ID:", id);
  return API.get(`/paintings/${id}`);
};

// ✏️ Update painting
export const updatePainting = (id, data) => {
  console.log("✏️ [paintings.js] Updating painting:", id, data);
  return API.put(`/paintings/${id}`, data);
};

// 🗑️ Delete painting
export const deletePainting = (id) => {
  console.log("🗑️ [paintings.js] Deleting painting:", id);
  return API.delete(`/paintings/${id}`);
};

// ➕ Create new painting
export const createPainting = (data) => {
    console.log("➕ [paintings.js] Creating new painting:", data);
    return API.post("/paintings", data);
  };
  