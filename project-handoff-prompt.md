# REPORT THE REEF — COMPLETE PROJECT HANDOFF

*Last updated: February 27, 2026 (Session 2 — UX fixes, Info page, upload limits)*

## What This App Is
Report The Reef is a web app (PWA) for the BVI (British Virgin Islands) boating community. It runs at https://report-the-reef.vercel.app

**Stack:** Next.js 14 (App Router), TypeScript, Supabase (auth, database, storage), Mapbox, Tailwind CSS, deployed on Vercel.

**Core Features:**
1. **Report** — Report marine incidents (groundings, pollution, anchor damage, illegal activity) with GPS location and photos
2. **Wildlife** — Log megafauna sightings (whales, dolphins, turtles, rays) with photos and GPS for citizen science
3. **Explore** — Browse 60 BVI anchorages with detailed information (descriptions, depth, holding, protection, amenities, habitat warnings, moorings) on an interactive map. Also includes dive sites, marine parks, national parks, bird sanctuaries, fisheries zones.
4. **Connect** — Check in at 43 overnight-eligible anchorages, see who's nearby on a real-time map, and message other boaters directly (in-app messaging)
5. **Reserve** — Mooring reservations (integrates with BoatyBall via iframe/redirect)
6. **Home** — Dashboard with stats (incidents reported, anchorages, moorings, community members)
7. **Info** — About page with legal disclaimer, privacy policy, messaging encryption disclosure, and partner links (Beyond The Reef, VI Purpose Fund)

---

## Project Structure — Key Files

### Anchorage Data (Two Datasets)

The app has two independent anchorage datasets that are kept in sync via an automated script:

- **Explore dataset** — `src/data/anchorages.ts` exports `anchoragesData` (60 detailed entries using the `AnchorageSeedData` interface). Transformed by `src/lib/anchorages-data.ts` into the `Anchorage` format, served via `/api/anchorages`. IDs are auto-generated as `anchorage-1`, `anchorage-2`, etc. (not persisted in DB).
- **Connect dataset** — `src/lib/constants.ts` exports `BVI_ANCHORAGES` (43 simple entries: id, name, island, lat, lng). Consumed by `src/app/(main)/connect/page.tsx`, `src/components/maps/ConnectMap.tsx`, and `src/app/api/connect/checkins/route.ts`. IDs are semantic slugs (e.g., `the-bight`, `great-harbour-jvd`) and **persisted in the Supabase `checkins` table** — never change them.
- **Sync script** — `scripts/check-anchorage-sync.ts` validates coordinate consistency between the two datasets. Run via `npm run check:anchorages`. Checks: coordinate drift (0.001° tolerance), BVI bounding box, required fields, duplicate names, intentional non-overlaps, and the-bight reference coordinates.
- **Coordinate review CSV** — `anchorage-coordinates-review.csv` lists all 60 Explore entries with Name, Island, Latitude, Longitude, Dataset (Both/Explore Only), Notes. Regenerated after each data change.

**Key constraint:** 43 of the 60 Explore entries overlap with Connect. 17 are intentionally Explore-only (day-use sites, private islands, hurricane anchorages, dinghy-only landings, removed-from-Connect entries). The sync script tracks both sets explicitly.

### Auth
- `src/context/AuthContext.tsx` — Single source of truth for auth state. Uses `hasInitialized` ref to prevent double-refresh on page load. Calls `registerPushNotifications` on SIGNED_IN and INITIAL_SESSION events.
- `src/app/(auth)/login/page.tsx` — Login page with Google OAuth + email/password. Redirects to /connect when authenticated. Does NOT independently check sessions (AuthContext handles that).
- `src/app/auth/callback/route.ts` — OAuth callback handler. Exchanges code for session, checks if profile is complete, redirects accordingly.
- `src/middleware.ts` — Refreshes auth tokens. Matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, `sw.js`, `push-sw.js`, `manifest.json`, `login`, `verify`, `auth`, `api/auth`, and static file extensions.
- `src/lib/supabase/client.ts` — Browser Supabase client (singleton, persistSession: true)
- `src/lib/supabase/server.ts` — Server Supabase client with cookie handlers

### Connect (Social/Messaging)
- `src/app/(main)/connect/page.tsx` — Main Connect page (~1800 lines). Contains: check-in system, anchorage map (ConnectMap), user panels, messaging interface, profile viewing, anchorage browsing, verification timer (6hr intervals), GPS distance checking, toast notifications. This is the biggest file in the project. Uses a single root return with conditional rendering (`ChatView` vs main content) — the `viewingProfile` Dialog is mounted at the fragment root outside both branches.
- `src/components/maps/ConnectMap.tsx` — Mapbox map showing anchorages with boater count badges. Builds marker list from `BVI_ANCHORAGES` — only the 43 Connect entries appear as check-in-able map pins.
- `src/components/ConnectNavBadge.tsx` — Red unread message count badge on the Connect nav icon. Polls /api/connect/conversations every 15 seconds.
- `src/components/ServiceWorkerRegistration.tsx` — Registers /sw.js on mount. Imported in layout.tsx.

### Connect API Routes
- `src/app/api/connect/checkins/route.ts` — GET (list active checkins), POST (check in at anchorage). Validates display_name and avatar_url before check-in. `DEFAULT_BVI_LOCATION` is derived from `BVI_ANCHORAGES` (not hardcoded).
- `src/app/api/connect/checkins/verify/route.ts` — POST with GPS coords. Checks distance from anchorage (5 nautical miles / 9.3km threshold). Returns `movedAway: true` if too far instead of auto-checkout.
- `src/app/api/connect/conversations/route.ts` — GET (list conversations with last message + unread count), POST (create/get conversation). Uses `chat_messages` table (NOT the `messages` table which is Supabase Realtime system table).
- `src/app/api/connect/conversations/[id]/messages/route.ts` — GET (messages in conversation), POST (send message + trigger push notification to recipient)
- `src/app/api/connect/profile/[id]/route.ts` — GET another user's profile
- `src/app/api/connect/profile/photo/route.ts` — POST to upload profile photo. Limit: 15MB (centralized via `src/lib/upload-limits.ts`). Stores in Supabase Storage "avatars" bucket (public).

### Explore API Routes
- `src/app/api/anchorages/route.ts` — GET anchorages with optional `island` and `search` filters. Calls `searchAnchorages()` from `src/lib/anchorages-data.ts`.
- `src/app/api/anchorages/[id]/route.ts` — GET single anchorage by ID (auto-generated `anchorage-N` format).

### Push Notifications
- `src/lib/push-notifications.ts` — `registerPushNotifications()` function. Requests notification permission, subscribes to push via VAPID key, saves subscription to `push_subscriptions` table. **CRITICAL: uses `.trim()` on VAPID key because trailing spaces were causing atob failures.**
- `src/app/api/push/send/route.ts` — POST endpoint to send push notifications. Uses `web-push` package with service role Supabase client. **CRITICAL: uses `.trim()` on both VAPID keys.**
- `public/sw.js` — Simple service worker (NOT Workbox). Imports push-sw.js. Handles install, activate, basic fetch caching. **Was in .gitignore previously — now tracked in git.**
- `public/push-sw.js` — Push notification event handlers. Shows notifications, handles clicks (opens app to /connect).

### Other Key Files
- `src/lib/constants.ts` — `BVI_ANCHORAGES` (43 entries), `CHECKIN_CONFIG` (EXPIRY_HOURS: 48, VERIFICATION_INTERVAL_HOURS: 6), `AUTO_CHECKIN_RADIUS_KM` (0.926km = 0.5nm), `HOLDING_TYPES` (sand, sand_mud, sand_rock, mud, grass, rocky, coral), `PROTECTION_LEVELS`, `BVI_BOUNDS`, `BVI_CHECKIN_BOUNDS`, `MAX_FILE_SIZE` (re-exported from `upload-limits.ts`)
- `src/lib/upload-limits.ts` — Single source of truth for upload limits: `MAX_UPLOAD_BYTES` (15MB), `MAX_UPLOAD_MB` (15). Imported by constants.ts, supabase/storage.ts, and API routes.
- `src/lib/geo-utils.ts` — Shared `calculateDistance()` haversine function
- `next.config.mjs` — next-pwa has been REMOVED entirely. Manual SW only.
- `prisma/seed.ts` — Excluded from tsconfig build (was causing PrismaClient import error)

### Scripts
- `scripts/check-anchorage-sync.ts` — Anchorage coordinate sync validation. Run via `npm run check:anchorages`.

---

## Supabase Database Schema

### Tables
- `profiles` — id (uuid, references auth.users), display_name, avatar_url, vessel_name, boat_name, bio, created_at, updated_at
- `checkins` — id, user_id, location_name, location_lat, location_lng, **anchorage_id** (references BVI_ANCHORAGES IDs by convention, not FK), is_active, visibility, expires_at, last_verified_at, actual_gps_lat, actual_gps_lng, created_at. **anchorage_id values persist even if the entry is removed from BVI_ANCHORAGES.**
- `conversations` — id, user1_id, user2_id, created_at, updated_at. UNIQUE(user1_id, user2_id)
- `chat_messages` — id, conversation_id (references conversations), sender_id (references profiles), content, read_at, created_at. **NOT the `messages` table** (that's Supabase Realtime system table).
- `push_subscriptions` — id, user_id, subscription (jsonb), created_at, updated_at. Has unique index on user_id.
- `blocked_users` — blocker_id, blocked_id
- `incidents` — incident reports with location, category, photos
- `wildlife_sightings` — megafauna sighting reports
- `reports` — legacy reports table

### Key RLS Policies
- `checkins` SELECT: Users always see own checkins; others see active+public+non-expired only
- `chat_messages`: Users can read/write messages in conversations they belong to
- `conversations`: Users can see conversations where they are user1 or user2
- `push_subscriptions`: FOR ALL where auth.uid() = user_id; plus open SELECT for push sending

### Supabase Storage
- `avatars` bucket (public) — Profile photos

### Functions
- `get_or_create_conversation(p_user1_id uuid, p_user2_id uuid)` — Returns conversation ID, creates if needed (handles user ordering)

---

## Environment Variables (Vercel + .env.local)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **Was placeholder "YOUR_SERVICE_ROLE_KEY_HERE" in .env.local but correct on Vercel**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — **HAD TRAILING SPACES that broke atob(). Fixed with .trim() in code AND cleaned on Vercel.**
- `VAPID_PRIVATE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## What's Working Now
1. ✅ Auth (Google OAuth + email/password sign-in/sign-up)
2. ✅ Session persistence (stays logged in across browser restarts)
3. ✅ Incident reporting with GPS and photo upload
4. ✅ Wildlife sighting logging
5. ✅ Explore page with 60 detailed BVI anchorages on interactive map
6. ✅ Connect — check-in at 43 overnight-eligible anchorages (48hr expiry)
7. ✅ Connect — see boaters on map with count badges
8. ✅ Connect — browse any anchorage's boaters
9. ✅ Connect — in-app messaging (conversations persist forever)
10. ✅ Profile photos (upload up to 15MB, stored in Supabase avatars bucket)
11. ✅ Profile viewing (from chat header, map panel, anchorage list — works from both main view and chat view)
12. ✅ Service worker registered and active
13. ✅ Push subscription created and saved to database
14. ✅ Push notification sending (api/push/send returns sent:1)
15. ✅ GPS verification with 5nm distance threshold (warns instead of auto-checkout)
16. ✅ Unread message badge on Connect nav icon
17. ✅ Anchorage sync validation script (`npm run check:anchorages`)
18. ✅ Message input with text wrapping, auto-resize, Enter/Shift+Enter, 2000 char limit
19. ✅ Check-in GPS privacy notice (banner + dialog)
20. ✅ Info page with About, Legal Disclaimer, Privacy Policy, Messaging disclosure
21. ✅ App branded as "Report The Reef" in manifest and push notifications
22. ✅ Upload limits normalized to 15MB across all upload paths

## What Needs Fixing / Testing
1. **Push notifications not appearing on screen** — `sent:1` is returned but no notification shows. Possible causes:
   - Chrome may suppress when tab is active (test by switching tabs after sending)
   - Mac notification settings for Chrome may be off (System Settings → Notifications → Chrome)
   - Service worker push event handler in push-sw.js may not be firing — needs debugging
   
2. **Unread badge positioning** — The red notification count badge on the Connect nav button overlaps the button directly. User wants it positioned ABOVE the button instead.

3. **Profile photo squishing** — Need `className="object-cover"` on ALL `<AvatarImage>` components throughout the app (connect page, settings, chat header, user panels, conversation list). Also add to base AvatarImage in `src/components/ui/avatar.tsx`.

4. **PKCE error on cross-device auth** — When user clicks email link on a different device than where they initiated login, shows raw PKCE error. Need friendly error message in callback route and login page.

5. **Supabase email delivery** — Rate limited on free tier (3-4 emails/hour). Password reset emails may not arrive. Consider configuring custom SMTP in Supabase settings.

6. **Multiple user accounts** — User (Kendyl Berna) has 3 profile records with different UUIDs. The active one is `30c3a415-d8df-4ea9-b57f-f261d76a22cb`. The others are from signing in via different methods. May want to merge or clean up.

7. **Sign-out on phone** — Was reported as not working but then started working. Monitor for regressions. Sign-out is in AuthContext.tsx (`logout` function) and called from Header.tsx and profile/page.tsx.

8. **Chrome stale cache issues** — Old Workbox service worker from next-pwa was caching aggressively. After removing next-pwa, users with old cached data may need to clear site data. The new sw.js is simple and doesn't precache.

9. **Anchorage data Phase 4 follow-ups** — See "BVI Anchorage Data Overhaul" section below for remaining coordinate verification tasks.

## Known Architecture Decisions
- Explore map markers (`AnchorageMap.tsx`) do NOT show mooring count badges — removed to reduce visual clutter. Mooring data is still visible in the anchorage detail panel when clicked.
- `chat_messages` table is used (NOT `messages` which is Supabase Realtime system table)
- Conversations persist forever regardless of check-in status (users can message after checkout)
- Check-in required to appear on map, but not required to send messages
- 48-hour check-in expiry with 6-hour GPS verification intervals
- GPS movement > 5 nautical miles triggers a "Still here?" toast, not auto-checkout
- Profile photo + display name required before check-in
- Push notification upsert uses `onConflict: "user_id"` (one subscription per user)
- next-pwa removed entirely — manual service worker only
- sw.js must NOT be in .gitignore (was previously, causing 404 on Vercel)
- Explore and Connect use separate anchorage datasets by design (different detail levels, different purposes). Sync enforced by `scripts/check-anchorage-sync.ts`.
- Connect anchorage IDs are persisted in DB. **Never rename or change existing IDs.** Entries can be removed from `BVI_ANCHORAGES` but historical checkins remain valid.
- Connect page uses a single root return (`<>...</>`) with conditional rendering of `ChatView` vs main content. The profile `Dialog` is mounted at the fragment root so it works from both views.
- The disabled "Friends" visibility option was removed from the check-in dialog. The `checkinVisibility` state type still includes `"friends"` for future backend compatibility.
- All file upload limits are centralized in `src/lib/upload-limits.ts` (15MB). Other modules re-export or import from there.
- Info page (`/info`) is a static server-rendered page (no client state). Linked from header nav, dropdown, and hamburger menu.
- Push notification title is "Report The Reef" (app-branded), with sender name and preview in the body.
- Messages are NOT end-to-end encrypted (HTTPS transport + secure DB storage only). This is disclosed on the Info page.

---

## BVI Anchorage Data Overhaul (Completed Feb 28, 2026)

A major data overhaul was performed across the two anchorage datasets. The plan file is at `.cursor/plans/bvi_anchorage_overhaul_v4_4a3691ce.plan.md` (read-only reference, do not edit).

### What was done

**Phase 1a — Fixed 8 wrong coordinates in `src/lib/constants.ts`:**
- `the-baths`, `savannah-bay`, `pond-bay`, `valley-trunk-bay`, `berchers-bay`, `lee-bay`, `cow-wreck-bay`, `pomato-point` all had incorrect lat/lng values (some were in the wrong ocean). Corrected using BVI Pirate GPS waypoints and other verified sources.
- `lee-bay` was reassigned from Salt Island to Great Camanoe (correct island).
- `DEFAULT_BVI_LOCATION` in `src/app/api/connect/checkins/route.ts` (lines 12-16) is now derived from `BVI_ANCHORAGES` instead of being hardcoded, eliminating a drift risk.
- `valley-trunk-bay` and `berchers-bay` remain **medium-confidence** — queued for Phase 4 visual verification.

**Phase 1b — Created sync validation script:**
- New file: `scripts/check-anchorage-sync.ts` — validates coordinate consistency between Connect (`BVI_ANCHORAGES`) and Explore (`anchoragesData`), checks BVI bounding box, required fields, duplicate names, and intentional non-overlaps.
- Run via `npm run check:anchorages` (added to `package.json`).
- After Round 2, reports: `✓ 43 coordinate pairs in sync. 60 Explore entries, 43 Connect entries. the-bight validated. All quality checks passed.`

**Phase 2 — Removed 14 entries from Connect (still in Explore):**
- Day-use only: `the-caves`, `sandy-spit`, `loblolly-bay`, `cow-wreck-bay`, `the-dogs`
- Redundant/restricted: `cistern-point`, `necker-island`, `eustatia-island`
- Day-stop/edge cases: `sandy-cay`, `buck-island`, `lee-bay`, `west-end`, `east-end`, `the-baths`
- Connect went from 63 → 49 entries (further reduced to 43 in Round 2). All section comments updated.
- `valley-trunk-bay` removal held pending user input on overnight usage.
- Historical `checkins` DB records with removed IDs remain valid but won't render on the Connect map.

**Phase 3 — Expanded Explore from 9 → 64 entries (further refined to 60 in Round 2):**
- `src/data/anchorages.ts` had 64 entries after Phase 3 (all 63 original Connect locations + The Indians). Round 2 trimmed to 60 and added 2 new entries.
- Each entry uses the `AnchorageSeedData` interface with: description, coordinates, island, depth, holding, protection, capacity, amenities, habitat warnings, moorings.
- Moorings arrays are empty for new entries (only the original 9 had verified mooring data).
- Images arrays are empty for new entries (placeholders).
- `src/lib/anchorages-data.ts` required no changes — it auto-transforms the expanded data.

**Post-review fixes (from two rounds of AI code review):**
- Header comment in `constants.ts` updated to reflect mixed coordinate confidence.
- Long Bay West description corrected (had incorrectly referenced north-coast resort).
- `sand_rock` added to `HOLDING_TYPES` in `constants.ts` so UI renders "Sand/Rock" properly.

### Anchorage Corrections Round 2 (Completed Feb 27, 2026)

A second round of corrections was performed based on continued coordinate review and data cleanup. The plan file is at `.cursor/plans/anchorage_corrections_round_2_40db9a95.plan.md` (read-only reference, do not edit).

**Entries removed from both Connect and Explore (5):**
- `east-end` (East End, Tortola) — already removed from Connect in Phase 2; now removed from Explore
- `maya-cove` (Maya Cove, Tortola)
- `long-bay-west` (Long Bay West, Tortola)
- `berchers-bay` (Berchers Bay, Virgin Gorda)
- `pomato-point` (Pomato Point, Anegada)

**Removed from Explore only (1):**
- Loblolly Bay, Anegada

**Moved from Both to Explore-only (2):**
- `paraquita-bay` — description updated to note "hurricane anchorage only"
- `mosquito-island` — removed from Connect, kept in Explore

**Renamed:**
- "Anegada Settlement" → "Setting Point, Anegada" in Explore (Connect ID `setting-point` unchanged). Description updated to focus on main yacht anchorage.

**New Explore-only entries (2):**
- **Anegada Settlement** (18.7126, -64.3157) — the actual settlement on Anegada, dinghy landing only, used by local fishermen. Distinct from Setting Point.
- **Red Rock, Tortola** (18.4387, -64.5611) — rocky islet off east Tortola, snorkel/dive site, day-use only.

**Coordinate updates (14 entries across both datasets):**
- Both datasets: Brandywine Bay, Hodges Creek, Nanny Cay, Benures Bay, Privateer Bay, Valley Trunk Bay, Gun Creek, Marina Cay, Scrub Island
- Explore only: Paraquita Bay, Cow Wreck Bay, The Dogs, Mosquito Island

**Description updates:**
- Paraquita Bay: now notes "hurricane anchorage" designation
- Cow Wreck Bay: now notes "dinghies only from Setting Point; yachts may not approach"

**Sync script updates:**
- Removed 6 mappings from `EXPLORE_TO_CONNECT_ID` (for deleted/moved entries)
- Renamed Anegada mapping key from "Anegada Settlement" to "Setting Point, Anegada"
- Updated `exploreOnly` list: removed 2 fully-deleted entries, added 4 new Explore-only entries

**Final state:** Connect has 43 entries, Explore has 60 entries. 43 mapped pairs + 17 exploreOnly entries. All checks pass.

### Phase 4 follow-ups (not yet done)
- Re-add `lee-bay` to Connect once Great Camanoe coordinates validated
- Add `cam-bay` (Great Camanoe) once coordinates verified
- Decide on `valley-trunk-bay` Connect removal
- Consider `dayUseOnly` / `connectEligible` flags in `AnchorageSeedData` interface
- Factual QA sweep on Explore descriptions (spot-check geographic/directional claims)

### UX & Feature Updates (Completed Feb 27, 2026)

1. **Message input wrapping** — Replaced single-line `<Input>` with auto-resizing `<textarea>` in `src/components/connect/ChatView.tsx`. Supports Enter-to-send, Shift+Enter for newline, IME guard, maxLength 2000, and height reset after send.

2. **Profile tap from chat fixed** — Removed early return for `ChatView` in `src/app/(main)/connect/page.tsx`. Component now uses a single root return with conditional rendering. The `viewingProfile` Dialog is mounted at the Fragment root so it renders from both chat view and main view.

3. **Removed disabled Friends button** — The "Friends (Soon)" visibility button in the check-in dialog has been removed. `checkinVisibility` state type kept for backend compat. `Lock` icon import cleaned up.

4. **Upload limits normalized to 15MB** — Created `src/lib/upload-limits.ts` as single source of truth (`MAX_UPLOAD_BYTES`, `MAX_UPLOAD_MB`). Updated `src/lib/constants.ts` (re-exports as `MAX_FILE_SIZE`), `src/lib/supabase/storage.ts`, `src/app/(main)/profile/page.tsx`, `src/app/(main)/profile/setup/page.tsx`, and `src/app/api/connect/profile/photo/route.ts` to use consistent 15MB limit.

5. **Check-in privacy notice** — Added GPS privacy text in two locations: the active check-in banner ("Your exact GPS is used only for check-in verification...") and the check-in dialog description.

6. **App naming fixed** — Updated `public/manifest.json` `short_name` from "ReportReef" to "Report The Reef". Updated push notification format in `src/app/api/connect/conversations/[id]/messages/route.ts` to use "Report The Reef" as title with "New message from {sender}: {preview}" as body.

7. **Info page created** — New route at `src/app/(main)/info/page.tsx` with sections: About (with Beyond The Reef and VI Purpose Fund links), How Messaging Works (accurate encryption disclosure), Disclaimer (GPS/nav liability), and Privacy Policy (data collection, use, security, rights, contact email). Linked from Header dropdown (authenticated users), desktop nav bar, and mobile hamburger menu via `navItems` array and a dedicated `DropdownMenuItem`.

### Critical constraints for future edits
- Connect anchorage IDs are persisted in the Supabase `checkins` table (`anchorage_id` column). **Never change existing IDs.**
- Display names are stored as strings in `location_name`. Removed entries remain interpretable in historical records.
- The sync script mapping uses Explore display names as keys. If you rename an Explore entry, update the mapping in `scripts/check-anchorage-sync.ts`.
- Always run `npm run check:anchorages` after editing either anchorage dataset.

---

## Previous Conversation Transcripts
Full conversation history is available at:
- `/mnt/transcripts/2026-02-16-20-20-28-bvi-app-auth-gps-push-fixes.txt` — Auth fixes, GPS, initial push setup
- `/mnt/transcripts/2026-02-18-20-55-27-connect-messaging-visibility-fixes.txt` — Messaging, Connect visibility
- `/mnt/transcripts/2026-02-21-00-54-15-connect-messaging-profiles-push-notifications.txt` — Profiles, photo upload, push notifications, service worker

---

## Go-To-Market Status
- Created charter boat flyer (HTML + PDF) with QR code
- Created Instagram carousel (6-slide PDF) with app screenshots
- Created Canva guides for both
- Created comprehensive GTM strategy document with messaging for Instagram, Facebook, WhatsApp, press, marina flyers, partnerships
- Created "Project Loading" Instagram teaser post
- User is actively editing promotional video in iMovie
