import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react"; // Import the filter icon
import { FilterOptions } from "../../hooks/useLocationFilter";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const FilterContent = ({ className = "" }) => (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <label className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors">
        <input
          type="checkbox"
          checked={filters.hasAvailableBikes}
          onChange={(e) =>
            onFilterChange({ ...filters, hasAvailableBikes: e.target.checked })
          }
          className="rounded border-gray-300 focus:ring-2 focus:ring-primary"
        />
        <span className="text-sm">Available Bikes</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors">
        <input
          type="checkbox"
          checked={filters.hasEbikes}
          onChange={(e) =>
            onFilterChange({ ...filters, hasEbikes: e.target.checked })
          }
          className="rounded border-gray-300 focus:ring-2 focus:ring-primary"
        />
        <span className="text-sm">Has E-bikes</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors">
        <input
          type="checkbox"
          checked={filters.isActive}
          onChange={(e) =>
            onFilterChange({ ...filters, isActive: e.target.checked })
          }
          className="rounded border-gray-300 focus:ring-2 focus:ring-primary"
        />
        <span className="text-sm">Active Only</span>
      </label>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="py-4">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block w-full">
         <div className="flex items-center bg-card rounded-lg shadow-sm p-3">
          <span className="text-sm font-medium mr-4">Filters:</span>
           <FilterContent className="flex-row" />
        </div>
      </div>
    </>
  );
};