import { z } from "zod";
import { BVI_BOUNDS } from "./constants";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// User schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  boatName: z.string().max(100).optional(),
  boatLength: z.number().min(10).max(300).optional(),
  homePort: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

// Helper to validate datetime-local format (YYYY-MM-DDTHH:mm) or full ISO
const datetimeLocalOrISO = z.string().refine(
  (val) => {
    // Accept datetime-local format: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
    // Also accept full ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
    const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    return datetimeLocalRegex.test(val) && !isNaN(new Date(val).getTime());
  },
  { message: "Please enter a valid date and time" }
);

// Incident schemas
export const createIncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Please provide more details (at least 20 characters)").max(2000),
  category: z.enum(["reef_damage", "pollution", "abandoned_fishing_gear", "wildlife", "safety", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  latitude: z.number()
    .min(BVI_BOUNDS.southwest.lat, "Location must be within BVI waters")
    .max(BVI_BOUNDS.northeast.lat, "Location must be within BVI waters"),
  longitude: z.number()
    .min(BVI_BOUNDS.southwest.lng, "Location must be within BVI waters")
    .max(BVI_BOUNDS.northeast.lng, "Location must be within BVI waters"),
  locationName: z.string().max(200).optional(),
  occurredAt: datetimeLocalOrISO,
  // Optional reporter info for anonymous submissions
  reporterEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  reporterName: z.string().max(100).optional(),
});

export const updateIncidentSchema = createIncidentSchema.partial().extend({
  status: z.enum(["pending", "investigating", "resolved", "dismissed"]).optional(),
});

// Wildlife sighting schemas
export const createWildlifeSightingSchema = z.object({
  species: z.enum([
    "humpback_whale", "bottlenose_dolphin", "spinner_dolphin", "atlantic_spotted_dolphin",
    "clymene_dolphin", "rough_toothed_dolphin", "sperm_whale", "cuviers_beaked_whale",
    "dwarf_sperm_whale", "pygmy_sperm_whale", "west_indian_manatee", "short_finned_pilot_whale",
    "tiger_shark", "great_hammerhead", "scalloped_hammerhead", "unknown"
  ]),
  latitude: z.number()
    .min(BVI_BOUNDS.southwest.lat, "Location must be within BVI waters")
    .max(BVI_BOUNDS.northeast.lat, "Location must be within BVI waters"),
  longitude: z.number()
    .min(BVI_BOUNDS.southwest.lng, "Location must be within BVI waters")
    .max(BVI_BOUNDS.northeast.lng, "Location must be within BVI waters"),
  locationName: z.string().max(200).optional(),
  sightedAt: datetimeLocalOrISO,
  count: z.enum(["1", "2", "3", "4", "5", "6-10", "11-20", "20+"]),
  comments: z.string().max(2000).optional(),
  // Optional reporter info for anonymous submissions
  reporterEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  reporterName: z.string().max(100).optional(),
});

// Reservation schemas
export const createReservationSchema = z.object({
  mooringId: z.string().min(1, "Mooring is required"),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

// Message schemas
export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

// Review schemas
export const createReviewSchema = z.object({
  anchorageId: z.string().min(1, "Anchorage is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  visitedAt: z.string().datetime().or(z.date()).optional(),
});

// Search/filter schemas
export const incidentFilterSchema = z.object({
  category: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const anchorageFilterSchema = z.object({
  island: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  search: z.string().optional(),
});

export const mooringFilterSchema = z.object({
  anchorageId: z.string().optional(),
  minLength: z.number().optional(),
  maxPrice: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type CreateWildlifeSightingInput = z.infer<typeof createWildlifeSightingSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type IncidentFilterInput = z.infer<typeof incidentFilterSchema>;
export type AnchorageFilterInput = z.infer<typeof anchorageFilterSchema>;
export type MooringFilterInput = z.infer<typeof mooringFilterSchema>;
