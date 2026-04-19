import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BatchExportToolbarProps {
  selectedCount: number;
  onExport: () => void;
  onCancel: () => void;
  isExporting?: boolean;
}

export const BatchExportToolbar = ({
  selectedCount,
  onExport,
  onCancel,
  isExporting = false,
}: BatchExportToolbarProps) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 animate-fade-in">
      <div className="max-w-sm mx-auto">
        <div className="bg-foreground text-background rounded-full shadow-lg px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={onExport}
              disabled={isExporting}
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-background hover:text-background hover:bg-background/10"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {isExporting ? "Exporting..." : "PDF"}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isExporting}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-background hover:text-background hover:bg-background/10"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
