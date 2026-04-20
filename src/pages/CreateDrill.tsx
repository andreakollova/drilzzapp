import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Save, Sparkles, Video, Clock, Play, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useFormAutoSave } from "@/hooks/useFormAutoSave";

// Sport-specific categories
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

const DRAFT_KEY = "drilzz_create_drill_draft";

const CreateDrill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiRedrawing, setAiRedrawing] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  
  // Check if we're duplicating a drill
  const duplicateData = location.state?.drillData;
  
  const [formData, setFormData] = useState({
    title: duplicateData?.title ? `${duplicateData.title} (Copy)` : "",
    category: duplicateData?.category || "",
    ageGroup: duplicateData?.age_group || "",
    difficulty: duplicateData?.difficulty || "",
    description: duplicateData?.description || "",
    coachingPoints: duplicateData?.coaching_points || "",
    equipment: duplicateData?.equipment || "",
    duration: duplicateData?.duration?.toString() || "",
    players: duplicateData?.players || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save hook
  const handleRestoreDraft = useCallback((data: typeof formData) => {
    setFormData(data);
    setShowDraftBanner(false);
  }, []);

  const { clearDraft, checkForDraft, restoreDraft } = useFormAutoSave({
    key: DRAFT_KEY,
    data: formData,
    enabled: !duplicateData, // Don't auto-save when duplicating
    onRestore: handleRestoreDraft,
  });

  // Check for draft on mount
  useEffect(() => {
    if (!duplicateData) {
      const draft = checkForDraft();
      if (draft && draft.data.title) {
        setShowDraftBanner(true);
      }
    }
  }, [duplicateData, checkForDraft]);

  useEffect(() => {
    checkUser();
  }, [navigate]);

  useEffect(() => {
    // Pre-populate image preview if duplicating
    if (duplicateData?.image_url) {
      setImagePreview(duplicateData.image_url);
    }
  }, [duplicateData]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
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

    // Auto-select first category for user's sport
    if (profileData?.sport && !duplicateData && !formData.category) {
      const sportCats = SPORT_CATEGORIES[profileData.sport];
      if (sportCats?.length > 0) {
        setFormData(prev => ({ ...prev, category: sportCats[0] }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.ageGroup) {
      newErrors.ageGroup = "Age group is required";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "Difficulty is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.coachingPoints.trim()) {
      newErrors.coachingPoints = "Coaching points are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Store the file for upload
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 100MB",
          variant: "destructive"
        });
        return;
      }

      // Store the file for upload
      setVideoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiRedraw = async () => {
    if (!imagePreview || !profile?.sport) return;

    setAiRedrawing(true);
    try {
      const { data, error } = await supabase.functions.invoke('redraw-drill-image', {
        body: { imageBase64: imagePreview, sport: profile.sport }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        // Convert base64 to blob for storage
        const response = await fetch(data.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "ai-redrawn-drill.png", { type: "image/png" });
        
        setImageFile(file);
        setImagePreview(data.imageUrl);
        
        toast({
          title: "AI Redraw Complete!",
          description: "Your drill has been transformed into a professional diagram"
        });
      }
    } catch (error: any) {
      console.error("AI redraw error:", error);
      toast({
        title: "AI Redraw Failed",
        description: error.message || "Failed to redraw image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAiRedrawing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    if (!user || !profile) return;

    setLoading(true);

    try {
      let imageUrl = "/placeholder.svg";
      let videoUrl = null;

      // Upload image to Supabase Storage if file exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('drill-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('drill-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Upload video to Supabase Storage if file exists
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('drill-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('drill-videos')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from("drills")
        .insert({
          user_id: user.id,
          title: formData.title,
          sport: profile.sport,
          category: formData.category,
          age_group: formData.ageGroup,
          difficulty: formData.difficulty,
          description: formData.description,
          coaching_points: formData.coachingPoints,
          equipment: formData.equipment || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          players: formData.players || null,
          image_url: imageUrl,
          video_url: videoUrl,
          published: true
        })
        .select()
        .single();

      if (error) throw error;

      // Clear draft on successful save
      clearDraft();

      toast({
        title: "Drill Created!",
        description: "Your drill has been saved to your library"
      });

      navigate("/library");
    } catch (error: any) {
      console.error("Error creating drill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create drill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const categories = SPORT_CATEGORIES[profile.sport] || [];

  // Live Preview Card Component
  const DrillPreviewCard = () => (
    <div className="relative aspect-video rounded-lg overflow-hidden group bg-muted">
      {imagePreview ? (
        <img 
          src={imagePreview} 
          alt="Drill preview" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Upload className="w-12 h-12 opacity-40" />
        </div>
      )}
      
      {/* Category Badge */}
      {formData.category && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
            {formData.category}
          </Badge>
        </div>
      )}

      {/* Video Play Icon */}
      {videoPreview && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-black fill-black ml-1" />
          </div>
        </div>
      )}

      {/* Title & Duration Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
          {formData.title || "Untitled Drill"}
        </h3>
        {formData.duration && (
          <div className="flex items-center gap-1 text-white/90 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formData.duration} min</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Hero Header - Simplified */}
      <div className="relative" style={{ backgroundColor: "#171412" }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-3">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {profile.sport}
            </Badge>
          </div>
          
          <h1 className="font-display text-2xl md:text-3xl text-white">
            {duplicateData ? "Duplicate Drill" : "Create New Drill"}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {duplicateData 
              ? `Creating a variation of "${duplicateData.title}"` 
              : "Add a new drill to your library"}
          </p>
        </div>
      </div>

      {/* Draft Banner */}
      {showDraftBanner && (
        <div className="bg-muted border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              You have an unsaved draft from a previous session.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDraftBanner(false)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={restoreDraft}
              >
                Restore Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className="container mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form Section */}
          <div className="flex-1 lg:max-w-2xl">
            <Card className="p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-medium">
                      1
                    </span>
                    <h2 className="font-display text-lg">Basic Information</h2>
                  </div>
                
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Drill Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., 4v4 Possession Game"
                        className={errors.title ? "border-destructive" : ""}
                        disabled={loading}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          disabled={loading}
                        >
                          <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-sm text-destructive">{errors.category}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ageGroup">Age Group *</Label>
                        <Select
                          value={formData.ageGroup}
                          onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                          disabled={loading}
                        >
                          <SelectTrigger id="ageGroup" className={errors.ageGroup ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                          <SelectContent>
                            {AGE_GROUPS.map((age) => (
                              <SelectItem key={age} value={age}>
                                {age}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.ageGroup && (
                          <p className="text-sm text-destructive">{errors.ageGroup}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty *</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                          disabled={loading}
                        >
                          <SelectTrigger id="difficulty" className={errors.difficulty ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTY_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.difficulty && (
                          <p className="text-sm text-destructive">{errors.difficulty}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (min)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="15"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="players">Players</Label>
                        <Input
                          id="players"
                          value={formData.players}
                          onChange={(e) => setFormData({ ...formData, players: e.target.value })}
                          placeholder="8-12"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drill Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-medium">
                      2
                    </span>
                    <h2 className="font-display text-lg">Drill Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the drill setup, objectives, and how to execute it..."
                        rows={5}
                        className={`placeholder:text-muted-foreground/50 ${errors.description ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formData.description.length} characters (minimum 20)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coachingPoints">Coaching Points *</Label>
                      <Textarea
                        id="coachingPoints"
                        value={formData.coachingPoints}
                        onChange={(e) => setFormData({ ...formData, coachingPoints: e.target.value })}
                        placeholder="• Key technical points to emphasize&#10;• Common mistakes to correct&#10;• Progression and regression options"
                        rows={5}
                        className={`placeholder:text-muted-foreground/50 ${errors.coachingPoints ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors.coachingPoints && (
                        <p className="text-sm text-destructive">{errors.coachingPoints}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipment">Equipment Needed</Label>
                      <Input
                        id="equipment"
                        value={formData.equipment}
                        onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                        placeholder="e.g., 10 cones, 1 ball per player, 4 bibs"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Drill Diagram & Media */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-medium">
                      3
                    </span>
                    <h2 className="font-display text-lg">Drill Drawing / Diagram & Video</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label>Drill Drawing / Diagram</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                              <Info className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 text-sm" side="right">
                            <p className="font-semibold mb-2">Drawing Legend</p>
                            <ul className="space-y-1.5 text-muted-foreground">
                              <li><span className="font-medium text-foreground">○ Circle</span> — Player / attacker</li>
                              <li><span className="font-medium text-foreground">× X mark</span> — Defender</li>
                              <li><span className="font-medium text-foreground">△ Triangle / cone</span> — Cone / marker</li>
                              <li><span className="font-medium text-foreground">→ Solid arrow</span> — Running path</li>
                              <li><span className="font-medium text-foreground">--→ Dashed arrow</span> — Pass / ball path</li>
                              <li><span className="font-medium text-foreground">~~→ Wavy arrow</span> — Dribble</li>
                              <li><span className="font-medium text-foreground">⚡ Lightning arrow</span> — Shot on goal</li>
                              <li><span className="font-medium text-foreground">□ Rectangle</span> — Goal / zone</li>
                            </ul>
                            <p className="mt-3 text-xs text-muted-foreground">Upload your hand-drawn sketch and AI will convert it into a clean, unified graphic.</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-muted/30 transition-all duration-200">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Drill preview"
                              className="max-h-56 mx-auto rounded-lg"
                            />
                            <div className="flex gap-2 justify-center flex-wrap">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAiRedraw}
                                disabled={loading || aiRedrawing}
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {aiRedrawing ? "Redrawing..." : "AI Redraw"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setImagePreview("");
                                  setImageFile(null);
                                }}
                                disabled={loading || aiRedrawing}
                              >
                                Remove
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Use AI Redraw to transform hand-drawn diagrams into professional graphics
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                            <Label
                              htmlFor="image-upload"
                              className="cursor-pointer"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">Upload Drill Diagram</p>
                                <p className="text-sm text-muted-foreground">
                                  PNG, JPG up to 5MB
                                </p>
                                <Button type="button" variant="outline" size="sm" className="mt-2" disabled={loading}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose File
                                </Button>
                              </div>
                            </Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={loading}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video Upload */}
                    <div>
                      <Label className="mb-2 block">Demonstration Video (Optional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-muted/30 transition-all duration-200">
                        {videoPreview ? (
                          <div className="space-y-4">
                            <video
                              src={videoPreview}
                              controls
                              className="max-h-56 mx-auto rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setVideoPreview("");
                                setVideoFile(null);
                              }}
                              disabled={loading}
                            >
                              Remove Video
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Video className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                            <Label
                              htmlFor="video-upload"
                              className="cursor-pointer"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">Upload Video</p>
                                <p className="text-sm text-muted-foreground">
                                  MP4, MOV, WEBM up to 100MB
                                </p>
                                <Button type="button" variant="outline" size="sm" className="mt-2" disabled={loading}>
                                  <Video className="w-4 h-4 mr-2" />
                                  Choose File
                                </Button>
                              </div>
                            </Label>
                            <Input
                              id="video-upload"
                              type="file"
                              accept="video/*"
                              capture="environment"
                              className="hidden"
                              onChange={handleVideoUpload}
                              disabled={loading}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-4 pt-4 border-t border-border">
                  <Button
                    type="submit"
                    className="flex-1 h-11"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Drill"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right: Live Preview Panel - Desktop Only */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-3">
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <p className="text-sm font-medium text-muted-foreground">Preview</p>
                </div>
                <DrillPreviewCard />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  How your drill will appear
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <Button
          onClick={handleSubmit as any}
          className="w-full h-11"
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Drill"}
        </Button>
      </div>
    </div>
  );
};

export default CreateDrill;
