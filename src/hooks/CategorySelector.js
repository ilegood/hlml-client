import { useEffect, useRef, useState } from "react";
import { CATEGORY_MAP } from "../api/homeConstants";
import styles from "../pages/CategorySelector.module.css";

export default function CategorySelector({
  selected,
  onChange,
  exclude = [],
  order = Object.keys(CATEGORY_MAP),
}) {
  const [open, setOpen] = useState(null);
  const ref = useRef();
  const excluded = new Set(exclude);
  const categories = order
    .filter((category) => CATEGORY_MAP[category] && !excluded.has(category))
    .map((category) => [category, CATEGORY_MAP[category]]);

  useEffect(() => {
    const closeDropdown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(null);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div ref={ref} className={styles.categoryRow}>
      {categories.map(([category, options]) => (
        <div key={category} className={styles.categoryWrapper}>
          <div
            className={`${styles.categoryTitle} ${selected[category] ? styles.hasSelection : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(open === category ? null : category);
            }}
          >
            {selected[category] ? (
              <>
                <span className={styles.selectedDot} />
                {selected[category]}
              </>
            ) : (
              <>
                {category}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </div>
          {open === category && (
            <div className={styles.categoryDropdown}>
              {options.map((option) => (
                <div
                  key={option}
                  className={`${styles.tagButton} ${selected[category] === option ? styles.active : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({
                      ...selected,
                      [category]: selected[category] === option ? null : option,
                    });
                    setOpen(null);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
