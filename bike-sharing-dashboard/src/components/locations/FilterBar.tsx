import { Bike, Zap, CircleCheck } from "lucide-react";
import { FilterOptions } from "../../hooks/useLocationFilter";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const PILLS: { key: keyof FilterOptions; label: string; Icon: typeof Bike }[] = [
  { key: "hasAvailableBikes", label: "Has bikes", Icon: Bike },
  { key: "hasEbikes", label: "Has e-bikes", Icon: Zap },
  { key: "isActive", label: "Active only", Icon: CircleCheck },
];

export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500 mr-1">Filters:</span>
      {PILLS.map(({ key, label, Icon }) => {
        const active = filters[key];
        return (
          <button
            key={key}
            aria-pressed={active}
            onClick={() => onFilterChange({ ...filters, [key]: !active })}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
};
