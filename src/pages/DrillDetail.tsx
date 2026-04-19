import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { jsPDF } from "jspdf";
import { addDrilzzHeader, generateDrillPage, addDrilzzFooter } from "@/lib/pdf-utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Heart, MessageSquare, Bookmark, Clock, Users, Target, Share2, Pencil, Trash2, Copy, FolderPlus, Facebook, Twitter, Linkedin, MessageCircle, Download, MoreHorizontal, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Comments } from "@/components/Comments";
import { useCollections } from "@/hooks/useCollections";
import { AddToCollectionDialog } from "@/components/AddToCollectionDialog";
import { CollectionDialog } from "@/components/CollectionDialog";

const DrillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [drill, setDrill] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false);
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false);
  const { collections, createCollection, addDrillToCollection } = useCollections(user?.id);
  const { averageRating, ratingCount } = useRatings(id || "");

  useEffect(() => {
    loadDrill();
  }, [id, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const loadDrill = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      setUser(user);

      // Load drill with author profile using public_profiles view
      const { data: drillData, error } = await supabase
        .from("drills")
        .select(`
          *,
          public_profiles!drills_user_id_fkey (name, club, sport),
          likes (count)
        `)
        .eq("id", id)
        .eq("published", true)
        .single();

      if (error) throw error;
      
      if (!drillData) {
        navigate("/community");
        return;
      }

      setDrill(drillData);
      setLikeCount(drillData.likes?.[0]?.count || 0);

      // Only check like/save status if user is authenticated
      if (user) {
        // Check if user has liked this drill
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("drill_id", id)
          .maybeSingle();

        setIsLiked(!!likeData);

        // Check if user has saved this drill
        const { data: savedData } = await supabase
          .from("saved_drills")
          .select("id")
          .eq("user_id", user.id)
          .eq("drill_id", id)
          .maybeSingle();

        setIsSaved(!!savedData);
      }
    } catch (error: any) {
      console.error("Error loading drill:", error);
      toast({
        title: "Error",
        description: "Failed to load drill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !drill) return;
    
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("drill_id", drill.id);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        toast({ title: "Removed like" });
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({
            user_id: user.id,
            drill_id: drill.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        toast({ title: "Liked!" });
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!user || !drill) return;

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from("saved_drills")
          .delete()
          .eq("user_id", user.id)
          .eq("drill_id", drill.id);

        if (error) throw error;

        setIsSaved(false);
        toast({ title: "Removed from library" });
      } else {
        // Save
        const { error } = await supabase
          .from("saved_drills")
          .insert({
            user_id: user.id,
            drill_id: drill.id
          });

        if (error) throw error;

        setIsSaved(true);
        toast({ title: "Saved to library!" });
      }
    } catch (error: any) {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteDrill = async () => {
    if (!user || !drill) return;

    try {
      // Delete image from storage if it exists and isn't the placeholder
      if (drill.image_url && drill.image_url !== "/placeholder.svg" && drill.image_url.includes('drill-images')) {
        const imagePath = drill.image_url.split('/drill-images/')[1];
        if (imagePath) {
          await supabase.storage
            .from('drill-images')
            .remove([imagePath]);
        }
      }

      // Delete video from storage if it exists
      if (drill.video_url && drill.video_url.includes('drill-videos')) {
        const videoPath = drill.video_url.split('/drill-videos/')[1];
        if (videoPath) {
          await supabase.storage
            .from('drill-videos')
            .remove([videoPath]);
        }
      }

      // Delete the drill (cascading deletes will handle likes, comments, saved_drills)
      const { error } = await supabase
        .from("drills")
        .delete()
        .eq("id", drill.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Drill Deleted",
        description: "The drill has been removed from your library"
      });

      navigate("/library");
    } catch (error: any) {
      console.error("Error deleting drill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete drill",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Drill link copied to clipboard"
    });
  };

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(drill?.title || "Check out this drill");
    const description = encodeURIComponent(drill?.description?.substring(0, 200) || "");

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleExportPDF = async () => {
    if (!drill) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add header
      const yPosition = addDrilzzHeader(pdf, pageWidth, margin);

      // Generate drill content
      await generateDrillPage(pdf, drill, yPosition, pageWidth, pageHeight, margin);

      // Add footer
      await addDrilzzFooter(pdf, pageWidth, pageHeight, margin, window.location.href);

      // Save the PDF
      const filename = `${drill.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_drill.pdf`;
      pdf.save(filename);

      toast({
        title: "PDF Downloaded!",
        description: "Drill sheet has been saved to your device",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!drill) return null;

  const drillUrl = window.location.href;
  const drillImageUrl = drill.image_url?.startsWith('http') 
    ? drill.image_url 
    : `${window.location.origin}${drill.image_url}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{drill.title} | Drilzz</title>
        <meta name="description" content={drill.description?.substring(0, 160)} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={drillUrl} />
        <meta property="og:title" content={drill.title} />
        <meta property="og:description" content={drill.description?.substring(0, 200)} />
        <meta property="og:image" content={drillImageUrl} />
        <meta property="og:site_name" content="Drilzz" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={drillUrl} />
        <meta name="twitter:title" content={drill.title} />
        <meta name="twitter:description" content={drill.description?.substring(0, 200)} />
        <meta name="twitter:image" content={drillImageUrl} />
        <meta name="twitter:site" content="@drilzz" />
        
        {/* Additional Meta Tags */}
        <meta property="article:author" content={drill.profiles?.name} />
        <meta property="article:tag" content={drill.sport} />
        <meta property="article:tag" content={drill.category} />
      </Helmet>
      {/* Navigation Header */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {/* Author Info in Header */}
            {user ? (
              <Link to={`/profile/${drill.user_id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={drill.public_profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {drill.public_profiles?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{drill.public_profiles?.name}</p>
                  {drill.public_profiles?.club && (
                    <p className="text-xs text-muted-foreground">{drill.public_profiles?.club}</p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={drill.public_profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {drill.public_profiles?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium hidden md:block">{drill.public_profiles?.name}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!user && (
              <Link to="/register">
                <Button size="sm" className="gradient-hero">
                  Sign Up
                </Button>
              </Link>
            )}
            {/* Three-dot menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user.id === drill.user_id && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/drill/${drill.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Drill
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Drill
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/create', { state: { drillData: drill } })}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAddToCollectionDialog(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Add to Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={handleShare}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content - Single Column */}
      <div className="container mx-auto px-4 py-8 max-w-3xl pb-24 md:pb-8">
        {/* Drill Media - No Card Wrapper */}
        <div className="mb-6">
          {drill.video_url ? (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                src={drill.video_url}
                controls
                className="w-full h-full"
                poster={drill.image_url}
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={drill.image_url}
                alt={drill.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

        {/* Engagement Bar - Below Media */}
        <div className="hidden md:flex items-center gap-4 py-4 border-b border-border/50">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-primary text-primary" : ""}`} />
                <span className="text-sm font-medium">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="gap-2"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-foreground" : ""}`} />
              </Button>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium">
                  {averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({ratingCount})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-2 ml-auto"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-5 h-5" />
                <span className="text-sm">{likeCount}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-sm">{averageRating?.toFixed(1) || "0.0"}</span>
              </div>
              <Link to="/register" className="ml-auto">
                <Button size="sm" variant="outline">
                  Sign up to interact
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Title and Metadata */}
        <div className="py-6 border-b border-border/50">
          <h1 className="font-display text-3xl md:text-4xl mb-4">{drill.title}</h1>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary">{drill.sport}</Badge>
            <Badge variant="outline">{drill.category}</Badge>
            <Badge variant="outline">{drill.difficulty}</Badge>
            <Badge variant="outline">{drill.age_group}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {drill.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{drill.duration} min</span>
              </div>
            )}
            {drill.players && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{drill.players}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Section - No Card */}
        <div className="py-6 border-b border-border/50">
          <h2 className="font-display text-xl mb-4">Description</h2>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {drill.description}
          </p>
        </div>

        {/* Coaching Points Section - No Card */}
        <div className="py-6 border-b border-border/50">
          <h2 className="font-display text-xl mb-4">Coaching Points</h2>
          <div className="text-foreground leading-relaxed whitespace-pre-line">
            {drill.coaching_points}
          </div>
        </div>

        {/* Equipment Section - No Card */}
        {drill.equipment && (
          <div className="py-6 border-b border-border/50">
            <h2 className="font-display text-xl mb-4">Equipment Needed</h2>
            <p className="text-foreground">{drill.equipment}</p>
          </div>
        )}

        {/* Rating Section */}
        {user ? (
          <div className="py-6">
            <h2 className="font-display text-xl mb-4">Rate this drill</h2>
            <DrillRatingInteractive drillId={drill.id} />
          </div>
        ) : (
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg mb-2">Want to rate this drill?</h3>
                <p className="text-sm text-muted-foreground">Join Drilzz to rate and save drills</p>
              </div>
              <Link to="/register">
                <Button className="gradient-hero">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="py-6">
          {user ? (
            <Comments drillId={drill.id} userId={user.id} />
          ) : (
            <div className="p-8 text-center bg-muted/30 rounded-lg">
              <h3 className="font-display text-2xl mb-3">Join the Coaching Community</h3>
              <p className="text-muted-foreground mb-6">
                Sign up to comment, connect with coaches, and build your drill library
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/register">
                  <Button size="lg" className="gradient-hero">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Action Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 shadow-strong z-50">
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="flex-col h-auto gap-1"
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-primary text-primary" : ""}`} />
              <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="flex-col h-auto gap-1"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-foreground" : ""}`} />
              <span className="text-xs">Save</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-col h-auto gap-1"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem onClick={handleShare}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-col h-auto gap-1"
                >
                  <MoreHorizontal className="w-5 h-5" />
                  <span className="text-xs">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.id === drill.user_id && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/drill/${drill.id}/edit`)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Drill
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Drill
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/create', { state: { drillData: drill } })}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAddToCollectionDialog(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add to Collection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Drill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this drill? This action cannot be undone. The drill will be permanently removed from your library and the community.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDrill} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to Collection Dialog */}
      <AddToCollectionDialog
        open={showAddToCollectionDialog}
        onOpenChange={setShowAddToCollectionDialog}
        collections={collections}
        drillId={drill?.id || ""}
        onAddToCollection={addDrillToCollection}
        onCreateNew={() => {
          setShowAddToCollectionDialog(false);
          setShowCreateCollectionDialog(true);
        }}
      />

      {/* Create Collection Dialog */}
      <CollectionDialog
        open={showCreateCollectionDialog}
        onOpenChange={setShowCreateCollectionDialog}
        onSave={async (name: string, description: string) => {
          const newCollection = await createCollection(name, description);
          if (newCollection && drill) {
            await addDrillToCollection(newCollection.id, drill.id);
          }
        }}
        title="Create Collection"
        description="Organize your drills into custom categories"
      />
    </div>
  );
};

// Helper component for interactive drill rating
const DrillRatingInteractive = ({ drillId }: { drillId: string }) => {
  const { averageRating, ratingCount, userRating, rateDrill } = useRatings(drillId);
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <StarRating
            rating={userRating || 0}
            size="lg"
            interactive={true}
            onRate={rateDrill}
            userRating={userRating}
            showValue={false}
          />
          {userRating && (
            <p className="text-xs text-muted-foreground mt-2">
              You rated this {userRating} star{userRating !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="border-l border-border pl-4">
          <div className="text-2xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : '—'}</div>
          <div className="text-xs text-muted-foreground">
            {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDetail;
