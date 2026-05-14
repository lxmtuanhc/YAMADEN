import { Filter, Search } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

interface SearchBarProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, placeholder, onChange }: SearchBarProps) {
  const { t } = useTranslation();
  return (
    <div className="search-row">
      <label className="search-input">
        <Search size={18} />
        <input value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
      </label>
      <button className="icon-button" type="button" aria-label={t("common.filter")}>
        <Filter size={19} />
      </button>
    </div>
  );
}
