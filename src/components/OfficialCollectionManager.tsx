import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Sparkles, FolderOpen } from "lucide-react";
import { SPORTS } from "@/config/sports";

export const OfficialCollectionManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [officialCollections, setOfficialCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sport: "",
    icon: "",
    display_order: 0,
  });

  useEffect(() => {
    loadOfficialCollections();
  }, []);

  const loadOfficialCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("is_official", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setOfficialCollections(data || []);
    } catch (error: any) {
      console.error("Error loading official collections:", error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const collectionData = {
        ...formData,
        is_official: true,
        user_id: user.id,
        sport: formData.sport || null,
      };

      if (editingCollection) {
        const { error } = await supabase
          .from("collections")
          .update(collectionData)
          .eq("id", editingCollection.id);

        if (error) throw error;
        toast({ title: "Collection updated successfully" });
      } else {
        const { error } = await supabase
          .from("collections")
          .insert(collectionData);

        if (error) throw error;
        toast({ title: "Collection created successfully" });
      }

      resetForm();
      loadOfficialCollections();
    } catch (error: any) {
      console.error("Error saving collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save collection",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;
      toast({ title: "Collection deleted successfully" });
      loadOfficialCollections();
    } catch (error: any) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sport: "",
      icon: "",
      display_order: 0,
    });
    setEditingCollection(null);
    setShowForm(false);
  };

  const startEdit = (collection: any) => {
    setFormData({
      name: collection.name,
      description: collection.description || "",
      sport: collection.sport || "",
      icon: collection.icon || "",
      display_order: collection.display_order || 0,
    });
    setEditingCollection(collection);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Curated Collections</h3>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Collection Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Top Rated Drills"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this collection"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sport (Optional)</Label>
                <Select
                  value={formData.sport}
                  onValueChange={(value) => setFormData({ ...formData, sport: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sports</SelectItem>
                    {SPORTS.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icon (Emoji)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="⭐"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingCollection ? "Update" : "Create"} Collection
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {officialCollections.map((collection) => (
          <Card key={collection.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {collection.icon && (
                  <span className="text-2xl">{collection.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{collection.name}</h4>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {collection.sport ? (
                      <Badge variant="secondary">{collection.sport}</Badge>
                    ) : (
                      <Badge variant="outline">All Sports</Badge>
                    )}
                    <Badge variant="outline">Order: {collection.display_order}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/collections/${collection.id}`)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Manage Drills
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(collection)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(collection.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
