import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cookie-consent";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-border shadow-lg">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-lg">Cookie Settings</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience, provide essential functionality, and analyze usage patterns. 
                By clicking "Accept All", you consent to our use of cookies as described in our{" "}
                <Link to="/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>
                . You can manage preferences or decline non-essential cookies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAccept} size="sm">
                  Accept All
                </Button>
                <Button onClick={handleDecline} variant="outline" size="sm">
                  Decline Optional
                </Button>
                <Link to="/cookies">
                  <Button variant="ghost" size="sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleDecline}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
