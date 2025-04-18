import { useEffect, useState } from "react";
import { getAllPaintings } from "../apis/paintings";
import PaintingCard from "../components/PaintingCard";
import "./HomePage.css"; // 👈 create this new file next

export default function HomePage() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPaintings()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPaintings(res.data);
        } else {
          console.warn("❓ Unexpected data:", res.data);
          setPaintings([]);
        }
      })
      .catch((err) => {
        console.error("❌ Error loading paintings:", err);
        setPaintings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <h1 className="page-title">🎨 All Paintings</h1>

      {loading ? (
        <p>Loading paintings...</p>
      ) : paintings.length === 0 ? (
        <p>No paintings found.</p>
      ) : (
        <div className="gallery-grid">
          {paintings.map((p) => (
            <PaintingCard key={p.painting_id} painting={p} />
          ))}
        </div>
      )}
    </div>
  );
}
