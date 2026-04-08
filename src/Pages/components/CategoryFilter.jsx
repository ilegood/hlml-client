import { useState } from "react";
import { CATEGORY_MAP } from "../data";

export default function CategoryFilter({ selected, setSelected }) {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {Object.entries(CATEGORY_MAP).map(([category, options]) => (
        <div key={category} style={{ position: "relative" }}>
          <div
            style={{
              background: "#eee",
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onClick={() => setOpen(open === category ? null : category)}
          >
            {category}
          </div>

          {open === category && (
            <div
              style={{
                position: "absolute",
                top: 35,
                left: 0,
                background: "white",
                padding: 10,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                zIndex: 100,
              }}
            >
              {options.map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    background:
                      selected[category] === opt ? "#111" : "transparent",
                    color: selected[category] === opt ? "white" : "black",
                  }}
                  onClick={() =>
                    setSelected({
                      ...selected,
                      [category]: selected[category] === opt ? null : opt,
                    })
                  }
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
