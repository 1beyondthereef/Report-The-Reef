"use client";

import { X, MapPin, AlertTriangle, Ban, Shield, Calendar, DollarSign, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RestrictedArea } from "@/lib/constants/restricted-areas";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface RestrictedAreaPanelProps {
  area: RestrictedArea | null;
  onClose: () => void;
  className?: string;
}

const typeLabels: Record<RestrictedArea['type'], string> = {
  marine_park: 'Marine National Park',
  fisheries_protected: 'Fisheries Protected Area',
  coral_restoration: 'Coral Restoration Site',
  seagrass_protection: 'Seagrass Protection Zone',
  bird_sanctuary: 'Bird Sanctuary',
  no_anchor_zone: 'No Anchor Zone'
};

const typeColors: Record<RestrictedArea['type'], string> = {
  marine_park: 'bg-red-600',
  fisheries_protected: 'bg-orange-600',
  coral_restoration: 'bg-pink-600',
  seagrass_protection: 'bg-emerald-600',
  bird_sanctuary: 'bg-amber-600',
  no_anchor_zone: 'bg-red-700'
};

export function RestrictedAreaPanel({ area, onClose, className }: RestrictedAreaPanelProps) {
  // Lock body scroll when panel is open (mobile)
  useBodyScrollLock(!!area);

  if (!area) {
    return null;
  }

  const currentMonth = new Date().getMonth() + 1;
  const isSeasonallyRestricted = area.seasonalRestrictions &&
    currentMonth >= area.seasonalRestrictions.startMonth &&
    currentMonth <= area.seasonalRestrictions.endMonth;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl border-t bg-background shadow-2xl transition-transform duration-300 md:absolute md:inset-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-96 md:rounded-none md:rounded-l-xl md:border-l md:border-t-0",
        className
      )}
    >
      {/* Sticky header with handle bar and close button */}
      <div className="sticky top-0 z-20 bg-background">
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
        className="h-full overflow-y-auto pb-24 md:pb-4 scrollbar-thin overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {/* Header with Warning Icon */}
        <div className="relative h-40 w-full overflow-hidden md:h-48 bg-gradient-to-br from-red-600 to-red-800">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="h-16 w-16 mb-2 bg-white/20 rounded-full flex items-center justify-center">
              <Ban className="h-10 w-10" />
            </div>
            <Badge className={cn("mt-2", typeColors[area.type])}>
              {typeLabels[area.type]}
            </Badge>
          </div>
          {isSeasonallyRestricted && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0">
                <Calendar className="mr-1 h-3 w-3" />
                Seasonal Restrictions Active
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold">{area.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{area.location}</span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Protected Area - Restrictions Apply
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {area.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Key Restrictions */}
          <div>
            <h3 className="mb-2 text-sm font-medium flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              Prohibited Activities
            </h3>
            <div className="space-y-1.5">
              {area.prohibitedActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allowed Activities */}
          <div>
            <h3 className="mb-2 text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Allowed Activities
            </h3>
            <div className="space-y-1.5">
              {area.allowedActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Restrictions Summary */}
          <div className="grid grid-cols-2 gap-2">
            {area.restrictions.noAnchoring && (
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 text-center">
                <Ban className="h-4 w-4 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300">No Anchoring</p>
              </div>
            )}
            {area.restrictions.noFishing && (
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 text-center">
                <Ban className="h-4 w-4 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300">No Fishing</p>
              </div>
            )}
            {area.restrictions.mooringRequired && (
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2 text-center">
                <Shield className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Mooring Required</p>
              </div>
            )}
            {area.restrictions.dayUseOnly && (
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2 text-center">
                <Calendar className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Day Use Only</p>
              </div>
            )}
            {area.restrictions.diveOperatorRequired && (
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2 text-center">
                <Shield className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Operator Required</p>
              </div>
            )}
            {area.restrictions.noEntry && (
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 text-center">
                <Ban className="h-4 w-4 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300">No Landing</p>
              </div>
            )}
          </div>

          {/* Seasonal Restrictions */}
          {area.seasonalRestrictions && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Seasonal Restrictions
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {area.seasonalRestrictions.description}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Active: {getMonthName(area.seasonalRestrictions.startMonth)} - {getMonthName(area.seasonalRestrictions.endMonth)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Penalties */}
          {area.penalties && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Penalties
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {area.penalties}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Managing Authority */}
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Managed by: </span>
              <span className="font-medium">{area.managingAuthority}</span>
            </span>
          </div>

          {/* Permit Info */}
          {area.permitRequired && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm">
              <p className="font-medium text-primary">Permit Required</p>
              <p className="text-muted-foreground mt-1">
                NPT Marine Conservation Permit required. Available from charter companies, dive shops, or NPT office in Road Town.
              </p>
            </div>
          )}

          {/* Notes */}
          {area.notes && (
            <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              <p className="font-medium mb-1">Notes:</p>
              <p>{area.notes}</p>
            </div>
          )}

          {/* Coordinates */}
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {area.coordinates.lat.toFixed(5)}, {area.coordinates.lng.toFixed(5)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
}
