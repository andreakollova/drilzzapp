import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const SPORT_CATEGORIES: Record<string, string[]> = {
  "Field Hockey": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Tactics", "Warm-up", "Conditioning"],
  "Football / Soccer": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Possession", "Tactics", "Warm-up", "Conditioning"],
  "Basketball": ["Dribbling", "Shooting", "Passing", "Defense", "Rebounding", "Fast Break", "Tactics", "Warm-up", "Conditioning"],
  "Volleyball": ["Serving", "Passing", "Setting", "Attacking", "Blocking", "Defense", "Tactics", "Warm-up", "Conditioning"],
  "Floorball": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Tactics", "Warm-up", "Conditioning"],
  "Tennis": ["Forehand", "Backhand", "Serving", "Volley", "Footwork", "Tactics", "Warm-up", "Conditioning"],
  "Ice Hockey": ["Skating", "Puck Control", "Passing", "Shooting", "Defense", "Goalkeeping", "Tactics", "Warm-up", "Conditioning"],
  "Rugby": ["Passing", "Tackling", "Rucking", "Mauling", "Lineout", "Scrum", "Tactics", "Warm-up", "Conditioning"],
  "Handball": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Fast Break", "Tactics", "Warm-up", "Conditioning"],
  "General Conditioning / Fitness": ["Strength", "Cardio", "Agility", "Speed", "Endurance", "Flexibility", "Core", "HIIT", "Recovery"]
};

const AGE_GROUPS = ["U6", "U8", "U10", "U12", "U14", "U16", "U18", "U21", "Adult", "Senior", "All Ages"];
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

interface SearchFiltersSheetProps {
  filters: {
    sport: string;
    category: string;
    ageGroup: string;
    difficulty: string;
    sort: string;
    minRating: string;
  };
  onFiltersChange: (filters: any) => void;
  activeFilterCount: number;
  onReset: () => void;
}

export const SearchFiltersSheet = ({
  filters,
  onFiltersChange,
  activeFilterCount,
  onReset,
}: SearchFiltersSheetProps) => {
  const availableCategories = filters.sport !== "all" 
    ? SPORT_CATEGORIES[filters.sport] || []
    : [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect drill
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Sport Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sport</label>
            <Select
              value={filters.sport}
              onValueChange={(value) => onFiltersChange({ ...filters, sport: value, category: "all" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Sports</SelectItem>
                {SPORTS.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
              disabled={filters.sport === "all"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Group Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Age Group</label>
            <Select
              value={filters.ageGroup}
              onValueChange={(value) => onFiltersChange({ ...filters, ageGroup: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Ages</SelectItem>
                {AGE_GROUPS.map((age) => (
                  <SelectItem key={age} value={age}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => onFiltersChange({ ...filters, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Min Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Rating</label>
            <Select
              value={filters.minRating}
              onValueChange={(value) => onFiltersChange({ ...filters, minRating: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={filters.sort}
              onValueChange={(value) => onFiltersChange({ ...filters, sort: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="relevant">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t flex gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1"
            disabled={activeFilterCount === 0}
          >
            Clear All
          </Button>
          <SheetTrigger asChild>
            <Button className="flex-1">
              Apply Filters
            </Button>
          </SheetTrigger>
        </div>
      </SheetContent>
    </Sheet>
  );
};
