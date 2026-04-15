import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { CATEGORY_MAP } from "../../pages/homeConstants";

const CategoryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;
`;

const CategoryWrapper = styled.div`
  position: relative;
`;

const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }

  &.has-selection {
    background: var(--color-active);
    border-color: var(--color-active);
    color: white;
  }

  svg {
    opacity: 0.6;
  }
`;

const SelectedDot = styled.span`
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 280px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const TagBtn = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }

  &.active {
    background: var(--color-active);
    border-color: var(--color-active);
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
            className={selected[cat] ? " has-selection" : ""}
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
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </CategoryTitle>
          {open === cat && (
            <Dropdown>
              {opts.map((opt) => (
                <TagBtn
                  key={opt}
                  className={selected[cat] === opt ? " active" : ""}
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
            </Dropdown>
          )}
        </CategoryWrapper>
      ))}
    </CategoryRow>
  );
}
