import { useEffect, useState } from "react";
import {
  getAllPaintings,
  deletePainting,
  updatePainting,
  createPainting,
} from "../apis/paintings";

export default function AdminPage() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", artist: "", price: "", image_url: "", status: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPaintings();
  }, []);

  function fetchPaintings() {
    getAllPaintings()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setPaintings(data);
        } else if (data?.paintings && Array.isArray(data.paintings)) {
          setPaintings(data.paintings);
        } else {
          console.warn("Unexpected format", data);
          setPaintings([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load paintings", err);
        setPaintings([]);
      })
      .finally(() => setLoading(false));
  }

  function handleDelete(painting_id) {
    if (window.confirm("Are you sure you want to delete this painting?")) {
      deletePainting(painting_id)
        .then(() => {
          fetchPaintings();
        })
        .catch((err) => console.error("Failed to delete painting", err));
    }
  }

  function handleEdit(p) {
    setEditingId(p.painting_id);
    setForm({
      title: p.title,
      artist: p.artist,
      price: p.price,
      image_url: p.image_url,
      status: p.status,
    });
  }

  function handleSave() {
    const saveFn = isAdding ? createPainting : updatePainting;
    const formData = {
      ...form,
      status: form.status.toLowerCase(), // normalize status to match DB constraint
    };
    const idArg = isAdding ? formData : [editingId, formData];

    (isAdding ? saveFn(formData) : saveFn(...idArg))
      .then(() => {
        setEditingId(null);
        setIsAdding(false);
        setForm({ title: "", artist: "", price: "", image_url: "", status: "" });
        fetchPaintings();
      })
      .catch((err) => console.error("Failed to save painting", err));
  }

  function handleCancel() {
    setEditingId(null);
    setIsAdding(false);
    setForm({ title: "", artist: "", price: "", image_url: "", status: "" });
  }

  function handleAddNew() {
    setIsAdding(true);
    setEditingId(null);
    setForm({ title: "", artist: "", price: "", image_url: "", status: "" });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🛠️ Admin Page</h1>
      <button onClick={handleAddNew} style={{ marginBottom: "1rem" }}>➕ Add New Painting</button>
      {(isAdding || editingId) && (
        <div style={{ marginBottom: "1.5rem", border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", maxWidth: "250px" }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Artist"
            value={form.artist}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel} style={{ marginLeft: "0.5rem" }}>Cancel</button>
          </div>
        </div>
      )}
      {loading ? (
        <p>Loading paintings...</p>
      ) : paintings.length === 0 ? (
        <p>No paintings found.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          {paintings.map((p) => (
            <div
              key={p.painting_id}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "8px",
                width: "250px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
              }}
            >
              <h3>{p.title}</h3>
              <img
                src={p.image_url}
                alt={p.title}
                width={200}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback.jpg";
                }}
              />
              <p>
                <strong>Artist:</strong> {p.artist}
              </p>
              <p>
                <strong>Price:</strong> ${p.price}
              </p>
              <p>
                <strong>Status:</strong> {p.status}
              </p>
              <div style={{ marginTop: "1rem" }}>
                <button
                  style={{ marginRight: "0.5rem" }}
                  onClick={() => handleEdit(p)}
                >
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(p.painting_id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
