"use client";

import { useState } from "react";
import { X, Fish, Calendar, AlertTriangle, Phone, Mail, ChevronDown, ChevronUp, Shield, Anchor, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BVI_CLOSED_SEASONS,
  BVI_GENERAL_REGULATIONS,
  getActiveClosedSeasons
} from "@/lib/constants/restricted-areas";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface RegulationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonthRange(startMonth: number, endMonth: number): string {
  if (startMonth === 1 && endMonth === 12) {
    return 'Year-round';
  }
  return `${monthNames[startMonth - 1]} - ${monthNames[endMonth - 1]}`;
}

export function RegulationsPanel({ isOpen, onClose, className }: RegulationsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('closed-seasons');

  // Lock body scroll when panel is open (mobile)
  useBodyScrollLock(isOpen);

  if (!isOpen) {
    return null;
  }

  const currentMonth = new Date().getMonth() + 1;
  const activeClosedSeasons = getActiveClosedSeasons(currentMonth);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-ocean-600 to-ocean-800">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="h-14 w-14 mb-2 bg-white/20 rounded-full flex items-center justify-center">
              <Fish className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold">BVI Marine Regulations</h2>
          </div>
        </div>

        {/* Active Alerts */}
        {activeClosedSeasons.length > 0 && (
          <div className="mx-4 mt-4 rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Active Closed Seasons
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {activeClosedSeasons.map((season) => (
                    <Badge
                      key={season.id}
                      variant="outline"
                      className="text-xs border-amber-600 text-amber-700 dark:text-amber-300"
                    >
                      {season.species}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="p-4 space-y-3">
          {/* Closed Seasons Section */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => toggleSection('closed-seasons')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Fishing Closed Seasons</h3>
                  <p className="text-xs text-muted-foreground">Protected species & seasons</p>
                </div>
              </div>
              {expandedSection === 'closed-seasons' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSection === 'closed-seasons' && (
              <div className="px-4 pb-4 space-y-3">
                {BVI_CLOSED_SEASONS.map((season) => {
                  const isActive = activeClosedSeasons.some(s => s.id === season.id);
                  const isYearRound = season.startMonth === 1 && season.endMonth === 12;

                  return (
                    <div
                      key={season.id}
                      className={cn(
                        "rounded-lg border p-3",
                        isActive ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-border"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{season.species}</h4>
                          <p className={cn(
                            "text-xs mt-0.5",
                            isYearRound ? "text-red-600 font-medium" : "text-muted-foreground"
                          )}>
                            {getMonthRange(season.startMonth, season.endMonth)}
                          </p>
                        </div>
                        {isActive && (
                          <Badge className="bg-red-600 text-white text-xs">
                            CLOSED
                          </Badge>
                        )}
                        {isYearRound && !isActive && (
                          <Badge className="bg-red-600 text-white text-xs">
                            PROTECTED
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {season.description}
                      </p>
                      <div className="mt-2 space-y-1">
                        {season.restrictions.slice(0, 3).map((restriction, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <Ban className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="text-muted-foreground">{restriction}</span>
                          </div>
                        ))}
                        {season.restrictions.length > 3 && (
                          <p className="text-xs text-muted-foreground italic">
                            +{season.restrictions.length - 3} more restrictions
                          </p>
                        )}
                      </div>
                      {season.notes && (
                        <p className="text-xs text-primary mt-2 italic">
                          {season.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* General Regulations Section */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => toggleSection('general')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">General Fishing Rules</h3>
                  <p className="text-xs text-muted-foreground">Territory-wide regulations</p>
                </div>
              </div>
              {expandedSection === 'general' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSection === 'general' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="space-y-2">
                  {BVI_GENERAL_REGULATIONS.generalRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      <span className="text-muted-foreground">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mooring Rules Section */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => toggleSection('mooring')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center">
                  <Anchor className="h-5 w-5 text-ocean-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Mooring & Anchoring</h3>
                  <p className="text-xs text-muted-foreground">Where and how to anchor</p>
                </div>
              </div>
              {expandedSection === 'mooring' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSection === 'mooring' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="space-y-2">
                  {BVI_GENERAL_REGULATIONS.mooringRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-ocean-500 flex-shrink-0 mt-2" />
                      <span className="text-muted-foreground">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Penalties Section */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => toggleSection('penalties')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Penalties</h3>
                  <p className="text-xs text-muted-foreground">Fines and enforcement</p>
                </div>
              </div>
              {expandedSection === 'penalties' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSection === 'penalties' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="space-y-2">
                  {BVI_GENERAL_REGULATIONS.penalties.map((penalty, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                      <span className="text-muted-foreground">{penalty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Report Violations */}
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
            <h3 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">
              Report Violations
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 mb-3">
              {BVI_GENERAL_REGULATIONS.reportViolations.description}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${BVI_GENERAL_REGULATIONS.reportViolations.phone}`}
                className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 hover:underline"
              >
                <Phone className="h-4 w-4" />
                {BVI_GENERAL_REGULATIONS.reportViolations.phone}
              </a>
              <a
                href={`mailto:${BVI_GENERAL_REGULATIONS.reportViolations.email}`}
                className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 hover:underline"
              >
                <Mail className="h-4 w-4" />
                {BVI_GENERAL_REGULATIONS.reportViolations.email}
              </a>
            </div>
          </div>

          {/* Attribution */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            {BVI_GENERAL_REGULATIONS.attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
