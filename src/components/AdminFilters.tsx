import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface AdminFilters {
  role?: string;
  status?: string;
  sport?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface AdminFiltersProps {
  filters: AdminFilters;
  onFiltersChange: (filters: AdminFilters) => void;
  filterType: "users" | "drills" | "comments";
}

const SPORTS = [
  "Field Hockey",
  "Football / Soccer",
  "Basketball",
  "Volleyball",
  "Floorball",
  "Tennis",
  "Ice Hockey",
  "Rugby",
  "Handball",
  "General Conditioning / Fitness"
];

export const AdminFiltersComponent = ({ filters, onFiltersChange, filterType }: AdminFiltersProps) => {
  const hasActiveFilters = filters.role || filters.status || filters.sport || filters.dateFrom || filters.dateTo;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof AdminFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range - From */}
        <div className="space-y-2">
          <Label className="text-xs">From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter("dateFrom", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range - To */}
        <div className="space-y-2">
          <Label className="text-xs">To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter("dateTo", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* User Role Filter */}
        {filterType === "users" && (
          <div className="space-y-2">
            <Label className="text-xs">Role</Label>
            <Select
              value={filters.role || "all"}
              onValueChange={(value) => updateFilter("role", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Drill Status Filter */}
        {filterType === "drills" && (
          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sport Filter */}
        <div className="space-y-2">
          <Label className="text-xs">Sport</Label>
          <Select
            value={filters.sport || "all"}
            onValueChange={(value) => updateFilter("sport", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {SPORTS.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
