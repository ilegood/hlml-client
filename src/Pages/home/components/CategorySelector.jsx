import { useState, useEffect, useRef } from "react";
import { CATEGORY_MAP } from "../constants";

export default function CategorySelector({ selected, onChange }) {
  const [open, setOpen] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  return (
    <div className="category-row" ref={ref}>
      {Object.entries(CATEGORY_MAP).map(([cat, opts]) => (
        <div className="category-wrapper" key={cat}>
          <div
            className={`category-title${selected[cat] ? " has-selection" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(open === cat ? null : cat);
            }}
          >
            {selected[cat] ? (
              <>
                <span className="selected-dot"></span>
                {selected[cat]}
              </>
            ) : (
              <>
                {cat}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </div>
          {open === cat && (
            <div className="category-dropdown">
              {opts.map((opt) => (
                <div
                  key={opt}
                  className={`tag-btn${selected[cat] === opt ? " active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({
                      ...selected,
                      [cat]: selected[cat] === opt ? null : opt,
                    });
                    setOpen(null);
                  }}
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
