import { Link, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import drilzzLogo from "@/assets/logo-black.png";
import { getSportConfig } from "@/config/sports";
import { Helmet } from "react-helmet-async";

const SportLanding = () => {
  const location = useLocation();
  // Extract sport from pathname (e.g., "/field-hockey" → "field-hockey")
  const sport = location.pathname.slice(1);
  const sportConfig = sport ? getSportConfig(sport) : undefined;

  if (!sportConfig) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Drilzz - {sportConfig.displayName} Coaching Platform</title>
        <meta 
          name="description" 
          content={`${sportConfig.description} Join Drilzz, the ultimate ${sportConfig.displayName.toLowerCase()} coaching platform.`}
        />
        <meta property="og:title" content={`Drilzz - ${sportConfig.displayName} Coaching Platform`} />
        <meta property="og:description" content={sportConfig.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={drilzzLogo} alt="Drilzz" className="h-10" />
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-28 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-6">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                {sportConfig.socialProof}
              </Badge>
            </div>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-secondary to-[hsl(var(--accent))] bg-clip-text text-transparent">
                    {sportConfig.tagline}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {sportConfig.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-shadow">
                      {sportConfig.heroCtaText}
                    </Button>
                  </Link>
                  <Link to="/community">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      {sportConfig.heroCtaSecondary}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sport Hero Image */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={sportConfig.heroImage} 
                    alt={`${sportConfig.displayName} training`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is Drilzz Section */}
        <section className="py-14 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <Badge variant="outline" className="text-xs px-3 py-1 mb-4">
                The Ultimate Coaching Tool
              </Badge>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                What is Drilzz?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Drilzz is a <span className="text-foreground font-medium">free coaching platform</span> that helps you create professional drill diagrams, 
                build training sessions, and connect with coaches worldwide. 
                No more messy whiteboards or scattered notes.
              </p>
            </div>
            
            {/* How it Works Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto text-primary-foreground font-bold">
                  1
                </div>
                <h3 className="font-semibold">Create</h3>
                <p className="text-sm text-muted-foreground">
                  Sketch on paper or use our editor. AI transforms it into a pro diagram.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto text-primary-foreground font-bold">
                  2
                </div>
                <h3 className="font-semibold">Organize</h3>
                <p className="text-sm text-muted-foreground">
                  Save drills to your library. Create collections by skill, age, or theme.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto text-primary-foreground font-bold">
                  3
                </div>
                <h3 className="font-semibold">Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Build complete training sessions. Drag, drop, done.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto text-primary-foreground font-bold">
                  4
                </div>
                <h3 className="font-semibold">Share</h3>
                <p className="text-sm text-muted-foreground">
                  Export PDFs for pitch-side. Share with your team or the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-14 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Why Coaches Love Drilzz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sportConfig.featureHighlights.map((feature, index) => {
                const IconComponent = Icons[feature.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                return (
                  <div 
                    key={index} 
                    className="group bg-background p-6 rounded-xl border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-default"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                      {IconComponent && <IconComponent className="w-7 h-7 text-primary" />}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-14 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sportConfig.benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border-l-4 border-primary/40 hover:border-primary hover:bg-muted/70 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icons.Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl blur-xl" />
              <div className="relative bg-background/80 backdrop-blur border border-border rounded-2xl p-8 md:p-10 text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                  <Icons.Rocket className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">
                  {sportConfig.finalCtaHeadline}
                </h2>
                <p className="text-muted-foreground">
                  Free to use. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-shadow">
                      {sportConfig.finalCtaText}
                      <Icons.ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/community">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Browse Drills
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link to="/" className="flex items-center">
              <img src={drilzzLogo} alt="Drilzz" className="h-8" />
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Empowering coaches to create better training experiences.
              </p>
              <div className="flex gap-6 text-sm">
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SportLanding;
