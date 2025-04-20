export default function PaintingCard({ painting }) {
    return (
      <div
        className="painting-card"
        style={{
          border: "1px solid #ddd",
          padding: "1rem",
          borderRadius: "8px",
          width: "250px",
          textAlign: "center",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          margin: "1rem", // spacing around each card
        }}
      >
        <h3>{painting.title}</h3>
        <img
          src={painting.image_url}
          alt={painting.title}
          width={200}
          style={{ borderRadius: "4px", marginBottom: "0.5rem" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/fallback.jpg"; // must be in public/
          }}
        />
        <p>
          <strong>Artist:</strong> {painting.artist}
        </p>
        <p>
          <strong>Price:</strong> ${painting.price}
        </p>
        <p>
          <strong>Status:</strong> {painting.status}
        </p>
      </div>
    );
  }
  