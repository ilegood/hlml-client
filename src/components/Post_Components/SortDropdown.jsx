import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const SortRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SortWrapper = styled.div`
  position: relative;
`;

const SortButton = styled.div`
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

  &.open {
    border-color: var(--color-active);
    background: var(--color-active);
    color: white;
  }
`;

const SortDropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--color-dropdown-bg);
  color: var(--color-dropdown-text);
  border: 1.5px solid var(--color-active);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 10px 28px var(--color-dropdown-shadow);
  z-index: 100;
  min-width: 132px;
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

const SortItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  border-radius: 8px;
  transition: background 0.1s;
  color: var(--color-dropdown-text);
  font-weight: 700;

  &:hover {
    background: var(--color-dropdown-hover-bg);
    color: var(--color-dropdown-hover-text);
  }

  &.active {
    background: var(--color-active);
    color: white;
  }
`;

export default function SortDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value) || options[0];

  return (
    <SortRow ref={ref}>
      <SortWrapper>
        <SortButton
          className={open ? "open" : ""}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
        >
          {selectedOption?.label || "정렬"}
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
        </SortButton>
        {open && (
          <SortDropdownMenu>
            {options.map((option) => (
              <SortItem
                key={option.value}
                className={value === option.value ? "active" : ""}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </SortItem>
            ))}
          </SortDropdownMenu>
        )}
      </SortWrapper>
    </SortRow>
  );
}
