interface FilterTabsProps<T extends string> {
  items: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}

export function FilterTabs<T extends string>({ items, active, onChange }: FilterTabsProps<T>) {
  return (
    <div className="filter-tabs">
      {items.map(item => (
        <button className={active === item.id ? "active" : ""} key={item.id} type="button" onClick={() => onChange(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
