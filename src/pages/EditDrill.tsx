import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Save, Sparkles, Video } from "lucide-react";
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

const EditDrill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aiRedrawing, setAiRedrawing] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    ageGroup: "",
    difficulty: "",
    description: "",
    coachingPoints: "",
    equipment: "",
    duration: "",
    players: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save hook with drill-specific key
  const draftKey = `drilzz_edit_drill_draft_${id}`;
  
  const handleRestoreDraft = useCallback((data: typeof formData) => {
    setFormData(data);
    setShowDraftBanner(false);
  }, []);

  const { clearDraft, checkForDraft, restoreDraft } = useFormAutoSave({
    key: draftKey,
    data: formData,
    enabled: !initialLoading,
    onRestore: handleRestoreDraft,
  });

  useEffect(() => {
    loadDrill();
  }, [id, navigate]);

  const loadDrill = async () => {
    try {
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

      // Load the drill to edit
      const { data: drillData, error } = await supabase
        .from("drills")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id) // Ensure user owns the drill
        .single();

      if (error || !drillData) {
        toast({
          title: "Error",
          description: "Drill not found or you don't have permission to edit it",
          variant: "destructive"
        });
        navigate("/library");
        return;
      }

      // Populate form with existing data
      const loadedFormData = {
        title: drillData.title || "",
        category: drillData.category || "",
        ageGroup: drillData.age_group || "",
        difficulty: drillData.difficulty || "",
        description: drillData.description || "",
        coachingPoints: drillData.coaching_points || "",
        equipment: drillData.equipment || "",
        duration: drillData.duration?.toString() || "",
        players: drillData.players || ""
      };
      
      setFormData(loadedFormData);
      setOriginalFormData(loadedFormData);

      // Check for draft after loading
      setTimeout(() => {
        const draft = checkForDraft();
        if (draft && JSON.stringify(draft.data) !== JSON.stringify(loadedFormData)) {
          setShowDraftBanner(true);
        }
      }, 100);

      setExistingImageUrl(drillData.image_url || "");
      setImagePreview(drillData.image_url || "");
      setExistingVideoUrl(drillData.video_url || "");
      setVideoPreview(drillData.video_url || "");
    } catch (error: any) {
      console.error("Error loading drill:", error);
      toast({
        title: "Error",
        description: "Failed to load drill",
        variant: "destructive"
      });
      navigate("/library");
    } finally {
      setInitialLoading(false);
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
      let imageUrl = existingImageUrl;
      let videoUrl = existingVideoUrl;

      // Upload new image if file exists
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

        // Delete old image if it's not the placeholder and different from new image
        if (existingImageUrl && existingImageUrl !== "/placeholder.svg" && existingImageUrl.includes('drill-images')) {
          const oldPath = existingImageUrl.split('/drill-images/')[1];
          if (oldPath) {
            await supabase.storage
              .from('drill-images')
              .remove([oldPath]);
          }
        }
      }

      // Upload new video if file exists
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

        // Delete old video if different from new video
        if (existingVideoUrl && existingVideoUrl.includes('drill-videos')) {
          const oldPath = existingVideoUrl.split('/drill-videos/')[1];
          if (oldPath) {
            await supabase.storage
              .from('drill-videos')
              .remove([oldPath]);
          }
        }
      }

      const { error } = await supabase
        .from("drills")
        .update({
          title: formData.title,
          category: formData.category,
          age_group: formData.ageGroup,
          difficulty: formData.difficulty,
          description: formData.description,
          coaching_points: formData.coachingPoints,
          equipment: formData.equipment || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          players: formData.players || null,
          image_url: imageUrl,
          video_url: videoUrl
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Clear draft on successful save
      clearDraft();

      toast({
        title: "Drill Updated!",
        description: "Your changes have been saved"
      });

      navigate(`/drill/${id}`);
    } catch (error: any) {
      console.error("Error updating drill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update drill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading drill...</div>
      </div>
    );
  }

  if (!profile) return null;

  const categories = SPORT_CATEGORIES[profile.sport] || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Hero Header */}
      <div className="gradient-hero relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-3">
            <Link 
              to={`/drill/${id}`} 
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Link>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {profile.sport}
            </Badge>
          </div>
          
          <h1 className="font-display text-2xl md:text-3xl text-white">
            Edit Drill
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Update your {profile.sport} drill
          </p>
        </div>
      </div>

      {/* Draft Banner */}
      {showDraftBanner && (
        <div className="bg-muted border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              You have unsaved changes from a previous session.
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl pb-24 md:pb-8">
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
                    className={errors.description ? "border-destructive" : ""}
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
                    className={errors.coachingPoints ? "border-destructive" : ""}
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

            {/* Drill Diagram & Video */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-medium">
                  3
                </span>
                <h2 className="font-display text-lg">Drill Diagram & Video</h2>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label className="mb-2 block">Drill Diagram</Label>
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
                          <Label htmlFor="image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={loading || aiRedrawing}
                              asChild
                            >
                              <span>Change</span>
                            </Button>
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImagePreview(existingImageUrl);
                              setImageFile(null);
                            }}
                            disabled={loading || aiRedrawing || imagePreview === existingImageUrl}
                          >
                            Reset
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
                      </div>
                    )}
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
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Label htmlFor="video-upload">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={loading}
                              asChild
                            >
                              <span>Change</span>
                            </Button>
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setVideoPreview(existingVideoUrl);
                              setVideoFile(null);
                            }}
                            disabled={loading || videoPreview === existingVideoUrl}
                          >
                            Reset
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setVideoPreview("");
                              setVideoFile(null);
                            }}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </div>
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
                      </div>
                    )}
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
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/drill/${id}`)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Floating Action Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <Button
          onClick={handleSubmit as any}
          className="w-full h-11"
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditDrill;
