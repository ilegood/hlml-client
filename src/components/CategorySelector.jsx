import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { CATEGORY_MAP } from "../api/homeConstants";

const CategoryRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const CategoryWrapper = styled.div`
  position: relative;
`;

const CategoryTitle = styled.div`
  cursor: pointer;
  padding: 6px 12px;
  background: var(--color-sidebar);
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 5px;
  transition:
    border-color 0.15s,
    color 0.15s;
  white-space: nowrap;
  user-select: none;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }

  &.has-selection {
    border-color: var(--color-active);
    background: var(--color-active);
    color: white;
  }
`;

const SelectedDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  display: inline-block;
`;

const CategoryDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--color-sidebar);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.13);
  z-index: 100;
  min-width: 110px;
  animation: dropIn 0.12s ease;

  @keyframes dropIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TagBtn = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  border-radius: 8px;
  transition: background 0.1s;
  color: var(--color-text);

  &:hover {
    background: var(--color-input-focus-bg);
    color: var(--color-active);
  }

  &.active {
    background: var(--color-active);
    color: white;
  }
`;

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
    <CategoryRow ref={ref}>
      {Object.entries(CATEGORY_MAP).map(([cat, opts]) => (
        <CategoryWrapper key={cat}>
          <CategoryTitle
            className={selected[cat] ? "has-selection" : ""}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(open === cat ? null : cat);
            }}
          >
            {selected[cat] ? (
              <>
                <SelectedDot />
                {selected[cat]}
              </>
            ) : (
              <>
                {cat}
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
          </CategoryTitle>
          {open === cat && (
            <CategoryDropdown>
              {opts.map((opt) => (
                <TagBtn
                  key={opt}
                  className={selected[cat] === opt ? "active" : ""}
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
                </TagBtn>
              ))}
            </CategoryDropdown>
          )}
        </CategoryWrapper>
      ))}
    </CategoryRow>
  );
}
