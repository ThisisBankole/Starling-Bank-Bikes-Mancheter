import { FilterOptions } from "../../hooks/useLocationFilter";


interface FilterBarProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
  }
  
  export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
    return (
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasAvailableBikes}
            onChange={(e) => onFilterChange({ ...filters, hasAvailableBikes: e.target.checked })}
            className="rounded border-gray-300"
          />
          Available Bikes
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasEbikes}
            onChange={(e) => onFilterChange({ ...filters, hasEbikes: e.target.checked })}
            className="rounded border-gray-300"
          />
          Has E-bikes
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.isActive}
            onChange={(e) => onFilterChange({ ...filters, isActive: e.target.checked })}
            className="rounded border-gray-300"
          />
          Active Only
        </label>
      </div>
    );
  };