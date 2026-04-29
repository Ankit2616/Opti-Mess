export default function SidebarItem({ title, id, current, setCurrent }) {
  const active = current === id;

  return (
    <div
      onClick={() => setCurrent(id)}
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
        background: active ? "#d9edf7" : "white",
        color: active ? "#003A6A" : "#333",
        fontWeight: active ? "bold" : "normal",
        transition: "0.2s",
      }}
      onMouseEnter={(event) => {
        if (!active) event.currentTarget.style.background = "#eef6ff";
      }}
      onMouseLeave={(event) => {
        if (!active) event.currentTarget.style.background = "white";
      }}
    >
      {title}
    </div>
  );
}
