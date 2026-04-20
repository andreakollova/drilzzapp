import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ArrowLeft, Plus, GripVertical, Clock, Trash2, Save } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DrillPickerDialog } from "@/components/DrillPickerDialog";
import { AddCustomActivityDialog } from "@/components/AddCustomActivityDialog";

interface SessionDrill {
  id: string;
  drill_id?: string;
  drill?: any;
  custom_activity_name?: string;
  custom_activity_duration?: number;
  duration_override?: number;
  section: "warmup" | "main" | "cooldown";
  position: number;
  notes?: string;
}

interface SortableItemProps {
  item: SessionDrill;
  onRemove: (id: string) => void;
  onDurationChange: (id: string, duration: number) => void;
}

const SortableItem = ({ item, onRemove, onDurationChange }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayDuration = item.custom_activity_duration || item.duration_override || item.drill?.duration || 0;

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-3 mb-2">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">
            {item.custom_activity_name || item.drill?.title}
          </h4>
          {item.drill && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {item.drill.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {item.drill.difficulty}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <Input
              type="number"
              value={displayDuration}
              onChange={(e) => onDurationChange(item.id, parseInt(e.target.value) || 0)}
              className="w-20 h-7 text-xs"
              min="1"
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default function SessionBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sessionName, setSessionName] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [warmupDrills, setWarmupDrills] = useState<SessionDrill[]>([]);
  const [mainDrills, setMainDrills] = useState<SessionDrill[]>([]);
  const [cooldownDrills, setCooldownDrills] = useState<SessionDrill[]>([]);

  const [drillPickerOpen, setDrillPickerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"warmup" | "main" | "cooldown">("main");
  const [customActivityOpen, setCustomActivityOpen] = useState(false);

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
    if (user && id) {
      loadSession();
    }
  }, [user, id]);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/login");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      setLoading(false);
    } catch (error: any) {
      console.error("Error:", error);
      navigate("/login");
    }
  };

  const loadSession = async () => {
    if (!id) return;
    
    try {
      const { data: session, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setSessionName(session.name);
      setSessionDescription(session.description || "");

      const { data: drills, error: drillsError } = await supabase
        .from("session_drills")
        .select(`
          *,
          drill:drills(*)
        `)
        .eq("session_id", id)
        .order("position");

      if (drillsError) throw drillsError;

      const warmup = drills.filter(d => d.section === "warmup") as SessionDrill[];
      const main = drills.filter(d => d.section === "main") as SessionDrill[];
      const cooldown = drills.filter(d => d.section === "cooldown") as SessionDrill[];

      setWarmupDrills(warmup);
      setMainDrills(main);
      setCooldownDrills(cooldown);
    } catch (error: any) {
      console.error("Error loading session:", error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive"
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent, section: "warmup" | "main" | "cooldown") => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const drills = section === "warmup" ? warmupDrills : section === "main" ? mainDrills : cooldownDrills;
    const setDrills = section === "warmup" ? setWarmupDrills : section === "main" ? setMainDrills : setCooldownDrills;

    const oldIndex = drills.findIndex((item) => item.id === active.id);
    const newIndex = drills.findIndex((item) => item.id === over.id);

    const newDrills = arrayMove(drills, oldIndex, newIndex).map((drill, index) => ({
      ...drill,
      position: index
    }));

    setDrills(newDrills);
  };

  const addDrillToSection = (drill: any, section: "warmup" | "main" | "cooldown") => {
    const drills = section === "warmup" ? warmupDrills : section === "main" ? mainDrills : cooldownDrills;
    const setDrills = section === "warmup" ? setWarmupDrills : section === "main" ? setMainDrills : setCooldownDrills;

    const newItem: SessionDrill = {
      id: `temp-${Date.now()}-${Math.random()}`,
      drill_id: drill.id,
      drill: drill,
      section,
      position: drills.length,
    };

    setDrills([...drills, newItem]);
  };

  const addCustomActivity = (name: string, duration: number, section: "warmup" | "main" | "cooldown") => {
    const drills = section === "warmup" ? warmupDrills : section === "main" ? mainDrills : cooldownDrills;
    const setDrills = section === "warmup" ? setWarmupDrills : section === "main" ? setMainDrills : setCooldownDrills;

    const newItem: SessionDrill = {
      id: `temp-${Date.now()}-${Math.random()}`,
      custom_activity_name: name,
      custom_activity_duration: duration,
      section,
      position: drills.length,
    };

    setDrills([...drills, newItem]);
  };

  const removeItem = (itemId: string, section: "warmup" | "main" | "cooldown") => {
    const setDrills = section === "warmup" ? setWarmupDrills : section === "main" ? setMainDrills : setCooldownDrills;
    const drills = section === "warmup" ? warmupDrills : section === "main" ? mainDrills : cooldownDrills;

    setDrills(drills.filter(d => d.id !== itemId).map((d, i) => ({ ...d, position: i })));
  };

  const updateDuration = (itemId: string, duration: number, section: "warmup" | "main" | "cooldown") => {
    const setDrills = section === "warmup" ? setWarmupDrills : section === "main" ? setMainDrills : setCooldownDrills;
    const drills = section === "warmup" ? warmupDrills : section === "main" ? mainDrills : cooldownDrills;

    setDrills(drills.map(d => {
      if (d.id === itemId) {
        if (d.custom_activity_name) {
          return { ...d, custom_activity_duration: duration };
        } else {
          return { ...d, duration_override: duration };
        }
      }
      return d;
    }));
  };

  const calculateTotalDuration = () => {
    const allDrills = [...warmupDrills, ...mainDrills, ...cooldownDrills];
    return allDrills.reduce((total, item) => {
      const duration = item.custom_activity_duration || item.duration_override || item.drill?.duration || 0;
      return total + duration;
    }, 0);
  };

  const handleSave = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a session name",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const totalDuration = calculateTotalDuration();

      let sessionId = id;

      if (id) {
        // Update existing session
        const { error: sessionError } = await supabase
          .from("training_sessions")
          .update({
            name: sessionName,
            description: sessionDescription,
            total_duration: totalDuration,
          })
          .eq("id", id);

        if (sessionError) throw sessionError;

        // Delete existing drills
        await supabase.from("session_drills").delete().eq("session_id", id);
      } else {
        // Create new session
        const { data: newSession, error: sessionError } = await supabase
          .from("training_sessions")
          .insert({
            user_id: user.id,
            name: sessionName,
            description: sessionDescription,
            sport: profile.sport,
            total_duration: totalDuration,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionId = newSession.id;
      }

      // Insert all drills
      const allDrills = [
        ...warmupDrills.map(d => ({ ...d, session_id: sessionId })),
        ...mainDrills.map(d => ({ ...d, session_id: sessionId })),
        ...cooldownDrills.map(d => ({ ...d, session_id: sessionId }))
      ];

      if (allDrills.length > 0) {
        const drillsToInsert = allDrills.map(d => ({
          session_id: sessionId,
          drill_id: d.drill_id,
          custom_activity_name: d.custom_activity_name,
          custom_activity_duration: d.custom_activity_duration,
          duration_override: d.duration_override,
          section: d.section,
          position: d.position,
          notes: d.notes,
        }));

        const { error: drillsError } = await supabase
          .from("session_drills")
          .insert(drillsToInsert);

        if (drillsError) throw drillsError;
      }

      toast({
        title: "Success",
        description: `Training session ${id ? "updated" : "created"} successfully`
      });

      navigate("/library");
    } catch (error: any) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save training session",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const totalDuration = calculateTotalDuration();

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation userId={user?.id} profile={profile} />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-12 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/library")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>

          <h1 className="font-display text-3xl mb-2">
            {id ? "Edit Training Session" : "Create Training Session"}
          </h1>
          <p className="text-muted-foreground">
            Organize drills into a structured training session
          </p>
        </div>

        {/* Session Details */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Session Name *</label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Wednesday Team Practice"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                placeholder="Optional session notes or objectives..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary">
                {profile?.sport}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{totalDuration} min</span>
                <span>total</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Warm-up Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl">Warm-up</h2>
              <p className="text-sm text-muted-foreground">
                {warmupDrills.reduce((sum, d) => sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0), 0)} min
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSection("warmup");
                  setDrillPickerOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Drill
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSection("warmup");
                  setCustomActivityOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Custom
              </Button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "warmup")}
          >
            <SortableContext items={warmupDrills.map(d => d.id)} strategy={verticalListSortingStrategy}>
              {warmupDrills.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onRemove={(id) => removeItem(id, "warmup")}
                  onDurationChange={(id, duration) => updateDuration(id, duration, "warmup")}
                />
              ))}
            </SortableContext>
          </DndContext>

          {warmupDrills.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              No warm-up activities yet
            </div>
          )}
        </div>

        {/* Main Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl">Main Training</h2>
              <p className="text-sm text-muted-foreground">
                {mainDrills.reduce((sum, d) => sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0), 0)} min
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSection("main");
                  setDrillPickerOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Drill
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSection("main");
                  setCustomActivityOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Custom
              </Button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "main")}
          >
            <SortableContext items={mainDrills.map(d => d.id)} strategy={verticalListSortingStrategy}>
              {mainDrills.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onRemove={(id) => removeItem(id, "main")}
                  onDurationChange={(id, duration) => updateDuration(id, duration, "main")}
                />
              ))}
            </SortableContext>
          </DndContext>

          {mainDrills.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              No main training activities yet
            </div>
          )}
        </div>

        {/* Cool-down Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl">Cool-down</h2>
              <p className="text-sm text-muted-foreground">
                {cooldownDrills.reduce((sum, d) => sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0), 0)} min
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSection("cooldown");
                  setDrillPickerOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Drill
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSection("cooldown");
                  setCustomActivityOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Custom
              </Button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "cooldown")}
          >
            <SortableContext items={cooldownDrills.map(d => d.id)} strategy={verticalListSortingStrategy}>
              {cooldownDrills.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onRemove={(id) => removeItem(id, "cooldown")}
                  onDurationChange={(id, duration) => updateDuration(id, duration, "cooldown")}
                />
              ))}
            </SortableContext>
          </DndContext>

          {cooldownDrills.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              No cool-down activities yet
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/library")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : id ? "Update Session" : "Create Session"}
          </Button>
        </div>
      </div>

      <MobileBottomNav userId={user?.id} profile={profile} />

      <DrillPickerDialog
        open={drillPickerOpen}
        onOpenChange={setDrillPickerOpen}
        onSelectDrill={(drill) => {
          addDrillToSection(drill, activeSection);
          setDrillPickerOpen(false);
        }}
        userId={user?.id}
        sport={profile?.sport}
      />

      <AddCustomActivityDialog
        open={customActivityOpen}
        onOpenChange={setCustomActivityOpen}
        onAdd={(name, duration) => {
          addCustomActivity(name, duration, activeSection);
          setCustomActivityOpen(false);
        }}
      />
    </div>
  );
}
