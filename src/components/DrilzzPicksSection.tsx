import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Collection } from "@/hooks/useCollections";
import { Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface DrilzzPicksSectionProps {
  collections: Collection[];
  title?: string;
  subtitle?: string;
}

export const DrilzzPicksSection = ({ 
  collections, 
  title = "Drilzz Picks",
  subtitle = "Curated collections to help you get started"
}: DrilzzPicksSectionProps) => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  if (collections.length === 0) return null;

  return (
    <div 
      ref={ref}
      className={`mb-8 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {collections.map((collection) => (
          <div
            key={collection.id}
            onClick={() => navigate(`/collections/${collection.id}`)}
            className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-3">
              {collection.icon && (
                <span className="text-2xl flex-shrink-0">{collection.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {collection.drill_count} {collection.drill_count === 1 ? 'drill' : 'drills'}
                </p>
              </div>
            </div>
            {collection.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {collection.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
