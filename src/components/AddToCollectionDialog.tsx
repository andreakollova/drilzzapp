import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderPlus, Folder, Check } from "lucide-react";
import { Collection } from "@/hooks/useCollections";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  drillId: string;
  onAddToCollection: (collectionId: string, drillId: string) => Promise<boolean>;
  onCreateNew: () => void;
}

export const AddToCollectionDialog = ({
  open,
  onOpenChange,
  collections,
  drillId,
  onAddToCollection,
  onCreateNew,
}: AddToCollectionDialogProps) => {
  const [adding, setAdding] = useState<string | null>(null);
  const [addedCollections, setAddedCollections] = useState<Set<string>>(new Set());

  const handleAdd = async (collectionId: string) => {
    setAdding(collectionId);
    const success = await onAddToCollection(collectionId, drillId);
    setAdding(null);
    
    if (success) {
      setAddedCollections(prev => new Set([...prev, collectionId]));
      // Close dialog after successful add
      setTimeout(() => onOpenChange(false), 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to add this drill to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Create New Collection Button */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onOpenChange(false);
              onCreateNew();
            }}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Create New Collection
          </Button>

          {/* Collections List */}
          {collections.length > 0 ? (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {collections.map((collection) => {
                  const isAdded = addedCollections.has(collection.id);
                  const isAdding = adding === collection.id;

                  return (
                    <Card
                      key={collection.id}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        isAdded ? "bg-primary/5 border-primary" : ""
                      }`}
                      onClick={() => !isAdded && !isAdding && handleAdd(collection.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Folder className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{collection.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {collection.drill_count || 0} drill{collection.drill_count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {isAdded && (
                          <Check className="w-5 h-5 text-primary shrink-0" />
                        )}
                        {isAdding && (
                          <div className="w-5 h-5 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <Card className="p-6 text-center">
              <Folder className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No collections yet. Create one to get started!
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
