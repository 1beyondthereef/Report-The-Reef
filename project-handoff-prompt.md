# REPORT THE REEF — COMPLETE PROJECT HANDOFF

*Last updated: March 11, 2026 (Session 4 — Account deletion for Google Play compliance)*

## What This App Is
Report The Reef is a web app (PWA) for the BVI (British Virgin Islands) boating community. It runs at https://reportthereef.com

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
- `src/app/(auth)/login/page.tsx` — Login page with Google OAuth + email/password. Redirects to /connect when authenticated. Does NOT independently check sessions (AuthContext handles that). Shows green "account deleted" banner when `?deleted=true` query param is present.
- `src/app/(auth)/delete-account/page.tsx` — Account deletion page for Google Play compliance. Authenticated users type "DELETE" to confirm; unauthenticated users see sign-in link + contact email. Submit this URL to Google Play Console Data Safety.
- `src/app/auth/callback/route.ts` — OAuth callback handler. Exchanges code for session, checks if profile is complete, redirects accordingly.
- `src/app/api/account/delete/route.ts` — POST endpoint for account deletion. Uses CSRF origin/referer allowlist, server-side `"DELETE"` confirmation, and service role client. Anonymizes incidents/wildlife (nulls identity fields), deletes user-owned data only (own messages, own reports — not conversations or other users' data), cleans up avatar from storage, then deletes auth user.
- `src/middleware.ts` — Refreshes auth tokens. Matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, `sw.js`, `push-sw.js`, `manifest.json`, `login`, `verify`, `auth`, `api/auth`, and static file extensions.
- `src/lib/supabase/client.ts` — Browser Supabase client (singleton, persistSession: true)
- `src/lib/supabase/server.ts` — Server Supabase client with cookie handlers

### Connect (Social/Messaging)
- `src/app/(main)/connect/page.tsx` — Main Connect page (~1800 lines). Contains: check-in system, anchorage map (ConnectMap), user panels, messaging interface, profile viewing, anchorage browsing, verification timer (6hr intervals), GPS distance checking, toast notifications. This is the biggest file in the project. Uses a single root return with conditional rendering (`ChatView` vs main content) — the `viewingProfile` Dialog is mounted at the fragment root outside both branches.
- `src/components/maps/ConnectMap.tsx` — Mapbox map showing anchorages with boater count badges. Builds marker list from `BVI_ANCHORAGES` — only the 43 Connect entries appear as check-in-able map pins.
- `src/components/ConnectNavBadge.tsx` — Red unread message count badge on the Connect nav icon. Polls /api/connect/conversations every 15 seconds.
- `src/components/ServiceWorkerRegistration.tsx` — Registers /sw.js on mount. Imported in layout.tsx. **Skips registration inside native Capacitor shells** (uses `isNativePlatform()` from `src/lib/platform.ts`).

### Connect API Routes
- `src/app/api/connect/checkins/route.ts` — GET (list active checkins), POST (check in at anchorage). Validates display_name and avatar_url before check-in. `DEFAULT_BVI_LOCATION` is derived from `BVI_ANCHORAGES` (not hardcoded).
- `src/app/api/connect/checkins/verify/route.ts` — POST with GPS coords. Checks distance from anchorage (5 nautical miles / 9.3km threshold). Returns `movedAway: true` if too far instead of auto-checkout.
- `src/app/api/connect/conversations/route.ts` — GET (list conversations with last message + unread count), POST (create/get conversation). Uses `chat_messages` table (NOT the `messages` table which is Supabase Realtime system table). GET uses `.maybeSingle()` for profile lookups with a "Deleted User" fallback; hides conversations with deleted users that have no messages. POST returns 404 when targeting a deleted user.
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
- `src/lib/platform.ts` — Platform detection for Capacitor native vs web. Exports `isNativePlatform()`, `getPlatform()` ('ios'|'android'|'web'), `getPushChannel()` ('apns'|'web'). Uses try/catch so it works safely in web-only builds.
- `capacitor.config.ts` — Capacitor configuration. Points native shells at `https://reportthereef.com` via `server.url`. App ID: `com.beyondthereef.reportthereef`.
- `public/.well-known/assetlinks.json` — Android Digital Asset Links for TWA. **Contains placeholder fingerprint** — must be replaced before Android submission.
- `next.config.mjs` — next-pwa has been REMOVED entirely. Manual SW only.
- `prisma/seed.ts` — Excluded from tsconfig build (was causing PrismaClient import error)

### Scripts
- `scripts/check-anchorage-sync.ts` — Anchorage coordinate sync validation. Run via `npm run check:anchorages`.
- `scripts/push-schema-migration.sql` — Reference SQL for adding multi-channel push support. Run manually in Supabase SQL Editor before deploying native iOS builds. Adds `channel` and `device_token` columns, changes unique constraint to `(user_id, channel)`.

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
23. ✅ Capacitor initialized with iOS platform (native shell loads Vercel-hosted app)
24. ✅ Platform detection utility (`src/lib/platform.ts`) for native vs web
25. ✅ Service worker gated — skips registration in native Capacitor shells
26. ✅ PKCE auth errors mapped to user-friendly messages
27. ✅ Unread badge repositioned above Connect nav icon
28. ✅ Account deletion page (`/delete-account`) for Google Play compliance
29. ✅ Account deletion API with CSRF protection, safe anonymization, storage cleanup
30. ✅ Conversations handle deleted profiles gracefully ("Deleted User" fallback)
31. ✅ Login page shows confirmation banner after account deletion

## What Needs Fixing / Testing
1. **Push notifications not appearing on screen** — `sent:1` is returned but no notification shows. Possible causes:
   - Chrome may suppress when tab is active (test by switching tabs after sending)
   - Mac notification settings for Chrome may be off (System Settings → Notifications → Chrome)
   - Service worker push event handler in push-sw.js may not be firing — needs debugging
   
2. ~~**Unread badge positioning**~~ — **FIXED in Session 3.** Changed `-top-4` to `-top-6` in `ConnectNavBadge.tsx`.

3. ~~**Profile photo squishing**~~ — **Not needed.** Base `AvatarImage` in `src/components/ui/avatar.tsx` already applies `object-cover` by default.

4. ~~**PKCE error on cross-device auth**~~ — **FIXED in Session 3.** `src/app/auth/callback/route.ts` now maps code verifier/challenge errors to a friendly message.

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
- Capacitor native shells load the Vercel-hosted app remotely (`server.url` in `capacitor.config.ts`). The app is NOT statically exported — Next.js API routes require the Vercel backend.
- Service worker registration is skipped in native Capacitor shells to avoid SW cache/push conflicts with native push notifications.
- Platform detection (`src/lib/platform.ts`) uses try/catch so `@capacitor/core` import doesn't crash in web-only builds.
- Push notification multi-channel support requires running `scripts/push-schema-migration.sql` in Supabase SQL Editor before deploying native iOS builds.
- Android TWA uses web push (Chrome-backed); no FCM complexity unless reliability issues arise in testing.
- `public/.well-known/assetlinks.json` has a placeholder fingerprint — must be replaced with real Play signing key before Android submission.
- Account deletion anonymizes `incidents` and `wildlife_sightings` (nulls `reporter_id`, `contact_name`, `contact_email`, `reporter_name`, `reporter_email`) but keeps the records for conservation. All other user data is deleted.
- Account deletion does NOT delete `conversations` rows (shared between two users). Only the deleting user's own `chat_messages` are removed. The other participant sees a "Deleted User" fallback.
- Account deletion does NOT delete `reports` where `reported_id = userId` — those were filed by other users and belong to them.
- Account deletion uses a service role Supabase client (same pattern as `src/lib/push.ts`) to bypass RLS. CSRF protected via Origin/Referer allowlist.
- Avatar storage cleanup during deletion is defensive (try/catch, non-blocking) — deletion proceeds even if storage cleanup fails.
- `/delete-account` is the public URL for Google Play Console Data Safety compliance. Unauthenticated users see contact email fallback.

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

### App Store Launch Prep (Completed Feb 27, 2026 — Session 3)

1. **Domain updated** — `project-handoff-prompt.md` and `.env.example` now reference `https://reportthereef.com`. External service updates (Supabase Auth URLs, Google OAuth console, Vercel env vars) must be done manually in their respective dashboards.

2. **Capacitor initialized** — Installed `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`. Ran `cap init`, configured `capacitor.config.ts` with `server.url: 'https://reportthereef.com'`, ran `cap add ios` and `cap sync`. The `ios/` folder is committed to git for build reproducibility.

3. **Platform detection** — Created `src/lib/platform.ts` with `isNativePlatform()`, `getPlatform()`, and `getPushChannel()`. Uses `Capacitor.isNativePlatform()` / `Capacitor.getPlatform()` with try/catch so the app doesn't crash in web-only contexts.

4. **Service worker gating** — `src/components/ServiceWorkerRegistration.tsx` now skips SW registration inside native Capacitor shells (prevents cache/push conflicts with native push).

5. **Digital Asset Links** — Created `public/.well-known/assetlinks.json` for Android TWA with `com.beyondthereef.reportthereef` package name. **Pre-release gate:** Do not submit Android build until real Play signing fingerprint replaces `YOUR_APP_SIGNING_KEY_FINGERPRINT` and is verified at `reportthereef.com/.well-known/assetlinks.json`.

6. **Push schema migration reference** — Created `scripts/push-schema-migration.sql` for manual execution in Supabase SQL Editor. Adds `channel` (text, default 'web') and `device_token` columns, changes unique constraint from `(user_id, subscription)` to `(user_id, channel)` for multi-channel push support.

7. **Unread badge positioning** — Changed `ConnectNavBadge` from `-top-4` to `-top-6` so the red badge sits above the Connect icon without overlapping.

8. **PKCE error messages** — `src/app/auth/callback/route.ts` now detects PKCE-related errors (code verifier/challenge) and shows a user-friendly message ("This sign-in link was opened on a different device or browser...") instead of raw technical errors. Original error is still logged server-side.

### Account Deletion (Completed March 11, 2026 — Session 4)

1. **Account deletion API** — Created `src/app/api/account/delete/route.ts`. Uses CSRF origin/referer allowlist (reportthereef.com, legacy Vercel, localhost), server-side `{ confirmation: "DELETE" }` check, and service role client. 11-step idempotent deletion: anonymize incidents + wildlife identity fields, delete push subscriptions, own chat messages, blocked users, checkins, reservations, own reports, avatar from storage, profile, then auth user. Each step has its own error handling; client can safely retry on failure.

2. **Account deletion page** — Created `src/app/(auth)/delete-account/page.tsx`. Authenticated flow: shows what will be deleted vs kept, requires typing "DELETE", destructive button, redirects to `/login?deleted=true` on success. Unauthenticated flow: sign-in link + contact email (`volunteer@1beyondthereef.com`).

3. **Conversations handle deleted profiles** — Updated `src/app/api/connect/conversations/route.ts` GET handler to use `.maybeSingle()` with a "Deleted User" fallback (id, display_name, null avatar). Conversations with deleted users and no remaining messages are filtered out. POST handler returns 404 when creating conversations with deleted users.

4. **Login deletion banner** — `src/app/(auth)/login/page.tsx` now shows a green `CheckCircle` confirmation banner when `?deleted=true` query param is present.

5. **Delete Account links** — Added "Delete Account" link (destructive styling) at the bottom of `src/app/(main)/profile/page.tsx`. Added clickable link to `/delete-account` in the "Your Rights" section of `src/app/(main)/info/page.tsx`.

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

---

## App Store Launch Roadmap (next steps — not yet done)

The full plan is at `.cursor/plans/domain_capacitor_fixes_v2_be46b5f5.plan.md` (read-only reference, do not edit). Below is a summary of what has been completed vs what remains.

### Completed (Sessions 3-4)
- ✅ Domain code references updated (`reportthereef.com`)
- ✅ Capacitor initialized with iOS platform + config
- ✅ Platform detection utility created
- ✅ Service worker gated for native shells
- ✅ Digital Asset Links placeholder created
- ✅ Push schema migration SQL reference created
- ✅ Badge positioning fixed
- ✅ PKCE friendly error messages added
- ✅ Account deletion page + API for Google Play compliance
- ✅ Conversations handle deleted user profiles gracefully

### Manual setup required (user must do in external dashboards)
- ~~Register `reportthereef.com` domain and point DNS to Vercel~~ — **DONE (Session 4)**
- ~~Supabase Dashboard → Authentication → URL Configuration~~ — **DONE (Session 4)**
- ~~Google Cloud Console → OAuth 2.0 Client~~ — **DONE (Session 4)**
- ~~Vercel dashboard: set `NEXT_PUBLIC_APP_URL=https://reportthereef.com`~~ — **DONE (Session 4)**
- Enroll in Apple Developer Program ($99/year) — individual first, migrate to org once D-U-N-S approved
- Enroll in Google Play Developer Program ($25 one-time)

### Remaining code/build work
1. **Validate OAuth in iOS Simulator** — Run Capacitor app in Xcode, test Google + email OTP sign-in inside WebView. If redirect fails, add custom URL scheme handling.
2. **Push notification multi-channel implementation** — Run `scripts/push-schema-migration.sql` in Supabase, then update `src/lib/push-notifications.ts` to branch on `getPushChannel()` (web → existing VAPID flow, native → `@capacitor/push-notifications` for APNs token). Update `src/lib/push.ts` server-side to send via APNs for `channel === 'apns'` (requires `apn` npm package + APNs key from Apple Developer dashboard).
3. **Native plugins** — Install `@capacitor/push-notifications`, `@capacitor/geolocation`, `@capacitor/camera`, run `npx cap sync`, configure iOS permissions in `ios/App/App/Info.plist`.
4. **Offline error screen** — Add connectivity detection + branded fallback UI for when WebView can't reach the server.
5. **Android TWA packaging** — Use `@bubblewrap/cli` or PWABuilder. Replace `assetlinks.json` placeholder fingerprint with real Play signing key.
6. **iOS build + submission** — Archive in Xcode, upload to App Store Connect, submit with Apple review notes (conservation platform, native push/GPS/camera, BVI non-profit).
7. **Android submission** — Upload signed AAB to Google Play Console with store listing + screenshots.
8. **QR code + optional /download landing page** — Simple QR pointing to `https://reportthereef.com`, with optional user-agent detection to show App Store / Play Store badges.

### Architecture notes for native builds
- The app is NOT statically exported. Native shells load `https://reportthereef.com` via `server.url` in `capacitor.config.ts`. All API routes stay on Vercel.
- iOS uses Capacitor (WebView wrapper). Android uses TWA (Chrome-backed, web push works natively).
- Push notifications: web channel uses existing VAPID/web-push. iOS native channel uses APNs. Android TWA stays on web push. The `push_subscriptions` table supports one subscription per user per channel after the migration.
- `ios/` folder is committed to git for build reproducibility. `android/` folder (when created via Bubblewrap) should also be committed.
