"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, addDays, isDateInRange, calculateNights } from "@/lib/utils";

interface ReserveCalendarProps {
  unavailableDates?: Date[];
  selectedRange?: { start: Date | null; end: Date | null };
  onRangeSelect: (start: Date | null, end: Date | null) => void;
  maxNights?: number;
  className?: string;
}

export function ReserveCalendar({
  unavailableDates = [],
  selectedRange = { start: null, end: null },
  onRangeSelect,
  maxNights = 30,
  className,
}: ReserveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (ud) =>
        ud.getFullYear() === date.getFullYear() &&
        ud.getMonth() === date.getMonth() &&
        ud.getDate() === date.getDate()
    );
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateUnavailable(date);
  };

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return isDateInRange(date, selectedRange.start, selectedRange.end);
  };

  const isStartDate = (date: Date) => {
    if (!selectedRange.start) return false;
    return (
      date.getFullYear() === selectedRange.start.getFullYear() &&
      date.getMonth() === selectedRange.start.getMonth() &&
      date.getDate() === selectedRange.start.getDate()
    );
  };

  const isEndDate = (date: Date) => {
    if (!selectedRange.end) return false;
    return (
      date.getFullYear() === selectedRange.end.getFullYear() &&
      date.getMonth() === selectedRange.end.getMonth() &&
      date.getDate() === selectedRange.end.getDate()
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selecting === "start" || !selectedRange.start) {
      onRangeSelect(date, null);
      setSelecting("end");
    } else {
      // Check if clicking before start date
      if (date < selectedRange.start) {
        onRangeSelect(date, null);
        setSelecting("end");
        return;
      }

      // Check max nights
      const nights = calculateNights(selectedRange.start, date);
      if (nights > maxNights) {
        const maxEndDate = addDays(selectedRange.start, maxNights);
        onRangeSelect(selectedRange.start, maxEndDate);
      } else {
        onRangeSelect(selectedRange.start, date);
      }
      setSelecting("start");
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold">{monthYear}</h3>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const disabled = isDateDisabled(date);
          const inRange = isDateInSelectedRange(date);
          const isStart = isStartDate(date);
          const isEnd = isEndDate(date);
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={cn(
                "h-10 rounded-md text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                disabled && "cursor-not-allowed text-muted-foreground/30",
                !disabled && !inRange && "hover:bg-accent",
                inRange && "bg-primary/10",
                (isStart || isEnd) && "bg-primary text-primary-foreground hover:bg-primary",
                isToday && !isStart && !isEnd && "border border-primary"
              )}
              aria-label={`${date.toLocaleDateString()}, ${
                disabled ? "unavailable" : isStart ? "check-in date" : isEnd ? "check-out date" : "available"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-primary/10" />
          <span>In range</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm border border-primary" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted-foreground/20" />
          <span>Unavailable</span>
        </div>
      </div>

      {/* Selection info */}
      {(selectedRange.start || selectedRange.end) && (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Check-in</p>
              <p className="font-medium">
                {selectedRange.start?.toLocaleDateString() || "Select date"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Nights</p>
              <p className="font-medium">
                {selectedRange.start && selectedRange.end
                  ? calculateNights(selectedRange.start, selectedRange.end)
                  : "-"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Check-out</p>
              <p className="font-medium">
                {selectedRange.end?.toLocaleDateString() || "Select date"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
