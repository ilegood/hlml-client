import { useEffect, useRef, useState } from "react";
import { CATEGORY_MAP } from "../../api/homeConstants";

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
    <div ref={ref} className="flex flex-wrap gap-2">
      {categories.map(([category, options]) => (
        <div key={category} className="relative">
          <div
            className={`flex cursor-pointer select-none items-center gap-[5px] whitespace-nowrap rounded-[20px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-sidebar)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text)] transition-[border-color,color] duration-150 hover:border-[var(--color-active)] hover:text-[var(--color-active)] ${
              selected[category]
                ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(open === category ? null : category);
            }}
          >
            {selected[category] ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
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
            <div className="absolute left-0 top-[calc(100%+6px)] z-[100] min-w-[110px] rounded-xl border-[1.5px] border-[var(--color-active)] bg-[var(--color-dropdown-bg)] p-1.5 text-[var(--color-dropdown-text)] shadow-[0_10px_28px_var(--color-dropdown-shadow)]">
              {options.map((option) => (
                <div
                  key={option}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-bold text-[var(--color-dropdown-text)] transition-colors duration-100 hover:bg-[var(--color-dropdown-hover-bg)] hover:text-[var(--color-dropdown-hover-text)] ${
                    selected[category] === option
                      ? "bg-[var(--color-active)] text-white"
                      : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({
                      ...selected,
                      [category]:
                        selected[category] === option ? null : option,
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
