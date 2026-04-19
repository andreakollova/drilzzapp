import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ArrowLeft, Clock, Layers, Download, MoreHorizontal, Pencil, Trash2, Play, Share2, Link as LinkIcon, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import { addDrilzzHeader, addDrilzzFooter } from "@/lib/pdf-utils";
import { Helmet } from "react-helmet-async";

interface SessionDrill {
  id: string;
  drill_id?: string;
  drill?: any;
  custom_activity_name?: string;
  custom_activity_duration?: number;
  duration_override?: number;
  section: string;
  position: number;
  notes?: string;
}

export default function SessionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [drills, setDrills] = useState<SessionDrill[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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
    } catch (error: any) {
      console.error("Error:", error);
      navigate("/login");
    }
  };

  const loadSession = async () => {
    if (!id) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: drillsData, error: drillsError } = await supabase
        .from("session_drills")
        .select(`
          *,
          drill:drills(*)
        `)
        .eq("session_id", id)
        .order("position");

      if (drillsError) throw drillsError;
      setDrills(drillsData || []);
    } catch (error: any) {
      console.error("Error loading session:", error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Session Deleted",
        description: "The training session has been removed"
      });

      navigate("/library");
    } catch (error: any) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Header with branding
      yPosition = addDrilzzHeader(pdf, pageWidth, margin);

      // Session Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(session.name, pageWidth - 2 * margin);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 10 + 5;

      // Metadata
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const metadata = `${session.sport} | ${session.total_duration} min | ${drills.length} activities`;
      pdf.text(metadata, margin, yPosition);
      yPosition += 10;

      // Description
      if (session.description) {
        const descLines = pdf.splitTextToSize(session.description, pageWidth - 2 * margin);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        descLines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Equipment Summary
      const equipment = aggregateEquipment();
      if (equipment.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Required Equipment", margin, yPosition);
        yPosition += 7;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(equipment.join(", "), margin, yPosition);
        yPosition += 10;
      }

      // Sections
      const sections = [
        { name: "Warm-up", items: drills.filter((d) => d.section === "warmup") },
        { name: "Main Training", items: drills.filter((d) => d.section === "main") },
        { name: "Cool-down", items: drills.filter((d) => d.section === "cooldown") },
      ];

      for (const section of sections) {
        if (section.items.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = margin;
          }

          // Section header
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          const sectionDuration = section.items.reduce(
            (sum, d) =>
              sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0),
            0
          );
          pdf.text(`${section.name} (${sectionDuration} min)`, margin, yPosition);
          yPosition += 10;
          pdf.setFont("helvetica", "normal");

          // Drills in section
          for (let index = 0; index < section.items.length; index++) {
            const item = section.items[index];

            if (yPosition > pageHeight - 50) {
              pdf.addPage();
              yPosition = margin;
            }

            const title =
              item.custom_activity_name || item.drill?.title || "Unknown Activity";
            const duration =
              item.custom_activity_duration || item.duration_override || item.drill?.duration || 0;

            // Activity number and title
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "bold");
            pdf.text(`${index + 1}. ${title}`, margin + 5, yPosition);
            yPosition += 6;

            // Duration and details
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Duration: ${duration} min`, margin + 10, yPosition);

            if (item.drill) {
              yPosition += 5;
              pdf.text(
                `${item.drill.category} | ${item.drill.difficulty}`,
                margin + 10,
                yPosition
              );
            }

            yPosition += 8;
          }

          yPosition += 3;
        }
      }

      // Footer with QR code
      await addDrilzzFooter(pdf, pageWidth, pageHeight, margin, window.location.href);

      // Save the PDF
      const filename = `${session.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_session.pdf`;
      pdf.save(filename);

      toast({
        title: "PDF Downloaded",
        description: "Your training session has been exported",
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

  const aggregateEquipment = () => {
    const equipmentSet = new Set<string>();
    drills.forEach((item) => {
      if (item.drill?.equipment) {
        const items = item.drill.equipment.split(",").map((e: string) => e.trim());
        items.forEach((e: string) => equipmentSet.add(e));
      }
    });
    return Array.from(equipmentSet);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Session link copied to clipboard"
    });
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(session.name);
    const description = encodeURIComponent(
      session.description || `Training session: ${session.name}`
    );

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session not found</p>
          <Button onClick={() => navigate("/library")}>Back to Library</Button>
        </div>
      </div>
    );
  }

  const warmupDrills = drills.filter(d => d.section === "warmup");
  const mainDrills = drills.filter(d => d.section === "main");
  const cooldownDrills = drills.filter(d => d.section === "cooldown");
  const equipment = aggregateEquipment();

  const sessionUrl = typeof window !== "undefined" ? window.location.href : "";
  const sessionDescription = session?.description || `Training session: ${session?.name || ""}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{session?.name || "Training Session"} | Drilzz</title>
        <meta name="description" content={sessionDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={sessionUrl} />
        <meta property="og:title" content={`${session?.name || "Training Session"} | Drilzz`} />
        <meta property="og:description" content={sessionDescription} />
        <meta property="og:site_name" content="Drilzz" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={sessionUrl} />
        <meta property="twitter:title" content={`${session?.name || "Training Session"} | Drilzz`} />
        <meta property="twitter:description" content={sessionDescription} />
      </Helmet>

      <AppNavigation userId={user?.id} profile={profile} />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-12 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl mb-2">{session.name}</h1>
              {session.description && (
                <p className="text-muted-foreground mb-3">{session.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{session.sport}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{session.total_duration} min</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Layers className="w-4 h-4" />
                  <span>{drills.length} activities</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.id === session.user_id && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/sessions/${id}/edit`)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Session
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Session
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={exportToPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Equipment Summary */}
        {equipment.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="font-medium text-sm mb-2">Required Equipment</h3>
            <div className="flex flex-wrap gap-2">
              {equipment.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Warm-up Section */}
        {warmupDrills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl">Warm-up</h2>
              <span className="text-sm text-muted-foreground">
                {warmupDrills.reduce((sum, d) => sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0), 0)} min
              </span>
            </div>
            <div className="space-y-2">
              {warmupDrills.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium">
                          {item.custom_activity_name || item.drill?.title}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{item.custom_activity_duration || item.duration_override || item.drill?.duration} min</span>
                        </div>
                      </div>
                      {item.drill && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {item.drill.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.drill.difficulty}
                          </span>
                          {item.drill.video_url && (
                            <Badge variant="outline" className="text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      )}
                      {item.drill && (
                        <Link
                          to={`/drill/${item.drill.id}`}
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          View drill details →
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Training Section */}
        {mainDrills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl">Main Training</h2>
              <span className="text-sm text-muted-foreground">
                {mainDrills.reduce((sum, d) => sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0), 0)} min
              </span>
            </div>
            <div className="space-y-2">
              {mainDrills.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium">
                          {item.custom_activity_name || item.drill?.title}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{item.custom_activity_duration || item.duration_override || item.drill?.duration} min</span>
                        </div>
                      </div>
                      {item.drill && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {item.drill.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.drill.difficulty}
                          </span>
                          {item.drill.video_url && (
                            <Badge variant="outline" className="text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      )}
                      {item.drill && (
                        <Link
                          to={`/drill/${item.drill.id}`}
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          View drill details →
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cool-down Section */}
        {cooldownDrills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl">Cool-down</h2>
              <span className="text-sm text-muted-foreground">
                {cooldownDrills.reduce((sum, d) => sum + (d.custom_activity_duration || d.duration_override || d.drill?.duration || 0), 0)} min
              </span>
            </div>
            <div className="space-y-2">
              {cooldownDrills.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium">
                          {item.custom_activity_name || item.drill?.title}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{item.custom_activity_duration || item.duration_override || item.drill?.duration} min</span>
                        </div>
                      </div>
                      {item.drill && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {item.drill.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.drill.difficulty}
                          </span>
                          {item.drill.video_url && (
                            <Badge variant="outline" className="text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      )}
                      {item.drill && (
                        <Link
                          to={`/drill/${item.drill.id}`}
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          View drill details →
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <MobileBottomNav userId={user?.id} profile={profile} />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Training Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Copy Link Button */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            {/* Social Media Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Share on social media</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleShare("facebook")}
                  className="w-full justify-start"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("twitter")}
                  className="w-full justify-start"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("linkedin")}
                  className="w-full justify-start"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("whatsapp")}
                  className="w-full justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
