import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Folder, Pencil, Trash2, GripVertical, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCollections } from "@/hooks/useCollections";
import { CollectionDialog } from "@/components/CollectionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DrillCardProfile, DrillCardProfileSkeleton } from "@/components/DrillCardProfile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DrilzzPicksSection } from "@/components/DrilzzPicksSection";
import { Collection } from "@/hooks/useCollections";
import { generateBatchDrillsPDF } from "@/lib/pdf-utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export default function Collections() {
  const navigate = useNavigate();
  const {
    id: collectionId
  } = useParams();
  const {
    toast
  } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    removeDrillFromCollection,
    reorderDrills,
    loadOfficialCollections
  } = useCollections(userId);
  const [officialCollections, setOfficialCollections] = useState<Collection[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [deletingCollection, setDeletingCollection] = useState<any>(null);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [collectionDrills, setCollectionDrills] = useState<any[]>([]);
  const [loadingDrills, setLoadingDrills] = useState(false);
  const [collectionPreviews, setCollectionPreviews] = useState<Record<string, string>>({});
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile?.sport && !collectionId) {
      loadOfficialCollections(profile.sport).then(setOfficialCollections);
    }
  }, [profile?.sport, collectionId]);
  useEffect(() => {
    if (collectionId && collections.length > 0) {
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        setSelectedCollection(collection);
        loadCollectionDrills(collectionId);
      }
    } else {
      setSelectedCollection(null);
      setCollectionDrills([]);
    }
  }, [collectionId, collections]);

  useEffect(() => {
    if (collections.length > 0 && !collectionId) {
      loadCollectionPreviews();
    }
  }, [collections, collectionId]);

  const loadCollectionPreviews = async () => {
    const previews: Record<string, string> = {};
    
    for (const collection of collections) {
      const { data } = await supabase
        .from("drill_collections")
        .select("drills(image_url)")
        .eq("collection_id", collection.id)
        .limit(1)
        .single();
      
      if (data?.drills?.image_url) {
        previews[collection.id] = data.drills.image_url;
      }
    }
    
    setCollectionPreviews(previews);
  };
  const checkUser = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);

    // Get profile
    const {
      data: profileData
    } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(profileData);
    setUserLoading(false);
  };
  const loadCollectionDrills = async (id: string) => {
    setLoadingDrills(true);
    try {
      const {
        data,
        error
      } = await supabase.from("drill_collections").select(`
          drill_id,
          position,
          drills (
            id,
            title,
            description,
            image_url,
            video_url,
            category,
            difficulty,
            duration,
            age_group,
            created_at
          )
        `).eq("collection_id", id).order("position", { ascending: true });
      if (error) throw error;
      setCollectionDrills(data?.map((dc: any) => dc.drills) || []);
    } catch (error: any) {
      console.error("Error loading collection drills:", error);
      toast({
        title: "Error",
        description: "Failed to load drills",
        variant: "destructive"
      });
    } finally {
      setLoadingDrills(false);
    }
  };
  const handleCreate = async (name: string, description: string) => {
    await createCollection(name, description);
  };
  const handleUpdate = async (name: string, description: string) => {
    if (editingCollection) {
      await updateCollection(editingCollection.id, name, description);
      setEditingCollection(null);
    }
  };
  const handleDelete = async () => {
    if (deletingCollection) {
      const success = await deleteCollection(deletingCollection.id);
      if (success && selectedCollection?.id === deletingCollection.id) {
        navigate("/collections");
      }
      setDeletingCollection(null);
    }
  };
  const handleRemoveDrill = async (drillId: string) => {
    if (selectedCollection) {
      const success = await removeDrillFromCollection(selectedCollection.id, drillId);
      if (success) {
        loadCollectionDrills(selectedCollection.id);
      }
    }
  };

  const handleExportCollection = async () => {
    if (!selectedCollection || collectionDrills.length === 0) return;

    try {
      const filename = `${selectedCollection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_collection.pdf`;
      await generateBatchDrillsPDF(collectionDrills, filename);
      toast({
        title: "Export Complete",
        description: `Collection "${selectedCollection.name}" exported to PDF`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = collectionDrills.findIndex((drill) => drill.id === active.id);
    const newIndex = collectionDrills.findIndex((drill) => drill.id === over.id);

    const newDrills = arrayMove(collectionDrills, oldIndex, newIndex);
    setCollectionDrills(newDrills);

    // Save new order to database
    if (selectedCollection) {
      await reorderDrills(
        selectedCollection.id,
        newDrills.map((drill) => drill.id)
      );
    }
  };
  if (userLoading || loading) {
    return <div className="min-h-screen bg-background animate-fade-in">
        <AppNavigation userId={userId || undefined} profile={profile} />
        <div className="container mx-auto px-4 py-6 max-w-6xl pb-24 md:pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-9 bg-muted rounded w-9 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <MobileBottomNav userId={userId || undefined} profile={profile} />
      </div>;
  }

  // Collection List View
  if (!selectedCollection) {
    return <div className="min-h-screen bg-background animate-fade-in">
        <AppNavigation userId={userId || undefined} profile={profile} />
        
        <div className="container mx-auto px-4 py-6 max-w-6xl pb-24 md:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl">Collections</h1>
            <Button size="icon" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Drilzz Picks Section */}
          {officialCollections.length > 0 && (
            <DrilzzPicksSection collections={officialCollections} />
          )}

          {/* My Collections Header */}
          {officialCollections.length > 0 && collections.length > 0 && (
            <h2 className="text-lg font-semibold mb-4 mt-8">My Collections</h2>
          )}

          {/* Collections Grid */}
          {collections.length === 0 ? <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg mb-2">No collections yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Organize your saved drills into collections
              </p>
              <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Collection
              </Button>
            </div> : <div className="grid grid-cols-2 gap-3">
              {collections.map(collection => <CollectionCard key={collection.id} collection={collection} previewImage={collectionPreviews[collection.id]} onEdit={() => setEditingCollection(collection)} onDelete={() => setDeletingCollection(collection)} onClick={() => navigate(`/collections/${collection.id}`)} />)}
            </div>}

          {/* Create/Edit Dialog */}
          <CollectionDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSave={handleCreate} title="Create Collection" description="Organize your drills into custom categories" />

          <CollectionDialog open={!!editingCollection} onOpenChange={open => !open && setEditingCollection(null)} onSave={handleUpdate} initialName={editingCollection?.name || ""} initialDescription={editingCollection?.description || ""} title="Edit Collection" description="Update your collection details" />

          {/* Delete Confirmation */}
          <AlertDialog open={!!deletingCollection} onOpenChange={open => !open && setDeletingCollection(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingCollection?.name}"? This
                  will remove the collection but won't delete the drills themselves.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <MobileBottomNav userId={userId || undefined} profile={profile} />
      </div>;
  }

  // Collection Detail View
  return <div className="min-h-screen bg-background animate-fade-in">
      <AppNavigation userId={userId || undefined} profile={profile} />
      <div className="container mx-auto px-4 py-6 max-w-6xl pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/collections")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-display text-xl font-bold">
                {selectedCollection.name}
              </h1>
            </div>
            <div className="flex gap-2">
              {collectionDrills.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExportCollection}
                  title="Export collection as PDF"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {!selectedCollection.is_official && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setEditingCollection(selectedCollection)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingCollection(selectedCollection)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {selectedCollection.description && (
            <p className="text-sm text-muted-foreground mb-2">{selectedCollection.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {collectionDrills.length} drill{collectionDrills.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Drills Grid */}
        {loadingDrills ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DrillCardProfileSkeleton key={i} />
            ))}
          </div>
        ) : collectionDrills.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg mb-2">Collection is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add drills from your library to build this collection
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/library")}>
              Browse Library
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={collectionDrills.map((drill) => drill.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {collectionDrills.map((drill) => (
                  <SortableDrillCard key={drill.id} drill={drill} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Edit Dialog */}
        <CollectionDialog open={!!editingCollection} onOpenChange={open => !open && setEditingCollection(null)} onSave={handleUpdate} initialName={editingCollection?.name || ""} initialDescription={editingCollection?.description || ""} title="Edit Collection" description="Update your collection details" />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingCollection} onOpenChange={open => !open && setDeletingCollection(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Collection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingCollection?.name}"? This
                will remove the collection but won't delete the drills themselves.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <MobileBottomNav userId={userId || undefined} profile={profile} />
    </div>;
}

// Collection Card Component
const CollectionCard = ({ collection, previewImage, onEdit, onDelete, onClick }: any) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        onClick={onClick}
        className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group bg-muted"
      >
        {/* Preview Image or Folder Icon */}
        {previewImage ? (
          <img
            src={previewImage}
            alt={collection.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Folder className="w-12 h-12 text-muted-foreground opacity-30" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Edit/Delete Buttons - Top Right */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 backdrop-blur-sm text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Title & Count - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-sm font-semibold text-white line-clamp-1 drop-shadow-lg flex-1">
              {collection.name}
            </h3>
            <span className="text-xs text-white/80 drop-shadow ml-2 whitespace-nowrap">
              {collection.drill_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sortable Drill Card Component
const SortableDrillCard = ({ drill }: { drill: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: drill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="bg-background/90 backdrop-blur-sm rounded p-1">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <DrillCardProfile drill={drill} />
    </div>
  );
};