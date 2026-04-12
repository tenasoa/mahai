"use client";

import styles from "./FilterPanel.module.css";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSection {
  title: string;
  options: FilterOption[];
  selected?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
}

export interface FilterPanelProps {
  sections: FilterSection[];
  onReset?: () => void;
  isLoading?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FilterPanel({
  sections,
  onReset,
  isLoading = false,
  collapsed = false,
  onToggleCollapse,
}: FilterPanelProps) {
  if (collapsed) {
    return (
      <button className={styles.collapseButton} onClick={onToggleCollapse}>
        📂 Filtres
      </button>
    );
  }

  return (
    <aside className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <span className={styles.filterLabel}>
          <span className={styles.filterDot} />
          Filtres
        </span>
        {onReset && (
          <button className={styles.resetButton} onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      <div className={styles.filterBody}>
        {sections.map((section, index) => (
          <div key={index} className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>

            {section.multiple ? (
              <div className={styles.optionsGrid}>
                {section.options.map((option) => {
                  const isSelected =
                    Array.isArray(section.selected) &&
                    section.selected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      className={`${styles.optionPill} ${isSelected ? styles.selected : ""}`}
                      onClick={() => {
                        if (!section.onChange || !section.selected) return;
                        if (isSelected) {
                          section.onChange(
                            (section.selected as string[]).filter(
                              (v) => v !== option.value,
                            ),
                          );
                        } else {
                          section.onChange([...section.selected, option.value]);
                        }
                      }}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span className={styles.optionCount}>
                          {option.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.optionsList}>
                {section.options.map((option) => {
                  const isSelected = section.selected === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`${styles.optionItem} ${isSelected ? styles.selected : ""}`}
                      onClick={() => section.onChange?.(option.value)}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span className={styles.optionCount}>
                          {option.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default FilterPanel;
