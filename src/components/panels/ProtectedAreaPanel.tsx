"use client";

import { X, MapPin, Shield, Bird, Fish, TreePine, Anchor, AlertTriangle, Info, Calendar, Scale, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProtectedArea, ManagementCategory } from "@/lib/constants/protected-areas";
import { MANAGEMENT_CATEGORIES, getActivityRestrictions } from "@/lib/constants/protected-areas";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ProtectedAreaPanelProps {
  area: ProtectedArea | null;
  onClose: () => void;
  className?: string;
}

const getProtectionTypeConfig = (type: string, existingStatus: string) => {
  // Determine the primary category for styling
  if (type === 'Bird Sanctuary' || existingStatus === 'Bird Sanctuary') {
    return {
      label: 'Bird Sanctuary',
      bgClass: 'bg-gradient-to-br from-green-600 to-green-800',
      badgeClass: 'bg-green-600',
      icon: Bird,
      iconColor: 'text-green-600'
    };
  }
  if (type === 'Fisheries Protected Area' || existingStatus === 'Fisheries Protected Area') {
    return {
      label: 'Fisheries Protected Area',
      bgClass: 'bg-gradient-to-br from-blue-600 to-blue-800',
      badgeClass: 'bg-blue-600',
      icon: Fish,
      iconColor: 'text-blue-600'
    };
  }
  if (type === 'Fisheries Priority Area' || existingStatus === 'Fisheries Priority Area') {
    return {
      label: 'Fisheries Priority Area',
      bgClass: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
      badgeClass: 'bg-yellow-600',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    };
  }
  if (existingStatus === 'National Park' || type.includes('National Park')) {
    return {
      label: 'National Park',
      bgClass: 'bg-gradient-to-br from-emerald-700 to-emerald-900',
      badgeClass: 'bg-emerald-700',
      icon: Anchor,
      iconColor: 'text-emerald-700'
    };
  }
  if (existingStatus === 'Marine Park' || type.includes('Marine Park')) {
    return {
      label: 'Marine Park',
      bgClass: 'bg-gradient-to-br from-teal-600 to-teal-800',
      badgeClass: 'bg-teal-600',
      icon: Anchor,
      iconColor: 'text-teal-600'
    };
  }
  if (type.includes('Proposed')) {
    return {
      label: 'Proposed Protected Area',
      bgClass: 'bg-gradient-to-br from-orange-500 to-orange-700',
      badgeClass: 'bg-orange-500',
      icon: Shield,
      iconColor: 'text-orange-500'
    };
  }
  // Default
  return {
    label: type,
    bgClass: 'bg-gradient-to-br from-slate-600 to-slate-800',
    badgeClass: 'bg-slate-600',
    icon: Shield,
    iconColor: 'text-slate-600'
  };
};

export function ProtectedAreaPanel({ area, onClose, className }: ProtectedAreaPanelProps) {
  useBodyScrollLock(!!area);

  if (!area) {
    return null;
  }

  const config = getProtectionTypeConfig(area.protectionType, area.existingStatus);
  const Icon = config.icon;
  const restrictions = getActivityRestrictions(area);
  const isProposed = area.protectionType.includes('Proposed') || area.existingStatus === 'none';
  const managementInfo = area.proposedMgmtCategory
    ? MANAGEMENT_CATEGORIES[area.proposedMgmtCategory as ManagementCategory]
    : null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border-t bg-background shadow-2xl transition-transform duration-300 md:absolute md:inset-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-96 md:rounded-none md:rounded-l-xl md:border-l md:border-t-0",
        className
      )}
    >
      {/* Fixed header with handle bar and close button */}
      <div className="relative z-20 flex-shrink-0 bg-background">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div
        className="min-h-0 flex-1 overflow-y-auto pb-24 md:pb-4 scrollbar-thin overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {/* Header */}
        <div className={cn("relative h-40 w-full overflow-hidden md:h-48", config.bgClass)}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="h-16 w-16 mb-2 bg-white/20 rounded-full flex items-center justify-center">
              <Icon className="h-10 w-10" />
            </div>
            <Badge className={cn("mt-2", config.badgeClass)}>
              {config.label}
            </Badge>
            {isProposed && (
              <Badge variant="outline" className="mt-1 border-white/50 text-white">
                Proposed
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Name and Location */}
          <div>
            <h2 className="text-xl font-semibold">{area.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{area.region}</span>
            </div>
          </div>

          {/* Site Type Badge */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={cn(
              area.siteType === 'Marine' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'
            )}>
              {area.siteType === 'Marine' ? (
                <><Anchor className="h-3 w-3 mr-1" /> Marine</>
              ) : (
                <><TreePine className="h-3 w-3 mr-1" /> Terrestrial</>
              )}
            </Badge>
            {area.existingStatus !== 'none' && area.existingStatus !== area.protectionType && (
              <Badge variant="outline">
                {area.existingStatus}
              </Badge>
            )}
          </div>

          {/* Description if available */}
          {area.description && (
            <div className="rounded-xl border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">{area.description}</p>
            </div>
          )}

          {/* Management Category */}
          {managementInfo && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Scale className={cn("h-5 w-5", config.iconColor)} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    Category {area.proposedMgmtCategory}: {managementInfo.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {managementInfo.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Proposed Status Banner */}
          {isProposed && (
            <div className="rounded-xl border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                    Proposed Protected Area
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This area has been identified for future protection. Current regulations may differ from proposed management plans.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Restrictions */}
          {restrictions.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Activity Restrictions
              </h3>
              <div className="space-y-1.5">
                {restrictions.map((restriction, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{restriction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size if available */}
          {area.sizeAcres && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="text-muted-foreground">Size: </span>
                <span className="font-medium">{area.sizeAcres.toLocaleString()} acres</span>
              </span>
            </div>
          )}

          {/* Date Established */}
          {area.dateEstablished && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="text-muted-foreground">Established: </span>
                <span className="font-medium">{area.dateEstablished}</span>
              </span>
            </div>
          )}

          {/* Legal Source */}
          {area.legalSource && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="text-muted-foreground">Source: </span>
                <span className="font-medium">{area.legalSource}</span>
              </span>
            </div>
          )}

          {/* Coordinates */}
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {area.coordinates.lat.toFixed(4)}, {area.coordinates.lng.toFixed(4)}
            </span>
          </div>

          {/* Legend Number if from map data */}
          {area.legendNo && (
            <p className="text-xs text-muted-foreground text-center">
              Map Legend #{area.legendNo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
