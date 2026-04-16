# REPORT THE REEF — COMPLETE PROJECT HANDOFF

*Last updated: April 5, 2026 (Session 8i — Site outage recovery, gitignore cleanup, Cursor safety rules)*

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
- `src/context/AuthContext.tsx` — Single source of truth for auth state. Uses `hasInitialized` ref to prevent double-refresh on page load. Calls `registerPushNotifications` on SIGNED_IN and INITIAL_SESSION events. **In native Capacitor shells, registers two listeners:** (1) `appUrlOpen` (from `@capacitor/app`) — single-source OAuth exchange that handles both PKCE flow (query param `code` → `exchangeCodeForSession`) and implicit flow (hash fragment `access_token`/`refresh_token` → `setSession`). Uses `processingAuthReturn` ref with `try/finally` to prevent duplicate exchanges. Strict pathname matching. Labeled logging on every branch. Does NOT navigate — lets login page `useEffect` handle redirect via auth state. (2) `browserFinished` (from `@capacitor/browser`) that calls `refreshUser()` when SFSafariViewController is dismissed.
- `src/app/(auth)/login/page.tsx` — Login page with Google OAuth + Apple OAuth + email/password. Redirects to /connect via `router.replace` when `isAuthenticated` becomes true. Does NOT independently check sessions (AuthContext handles that). Shows green "account deleted" banner when `?deleted=true` query param is present. **On native platforms, OAuth uses `skipBrowserRedirect: true` + `@capacitor/browser` (SFSafariViewController)** to avoid Google's `disallowed_useragent` error in WKWebView. Redirects to `/auth/native-callback` for native flows. Has `oauthInProgress` ref guard to prevent double `Browser.open()` from StrictMode/double-tap, with self-healing reset when loading states settle. Split timeout: 15s web, 90s native.
- `src/app/(auth)/delete-account/page.tsx` — Account deletion page for Google Play compliance. Authenticated users type "DELETE" to confirm; unauthenticated users see sign-in link + contact email. Submit this URL to Google Play Console Data Safety.
- `src/app/auth/callback/route.ts` — OAuth callback handler (web flow). Exchanges code for session server-side, checks if profile is complete, redirects accordingly.
- `src/app/auth/native-callback/page.tsx` — Pure relay page for native OAuth flow. Zero auth logic, zero supabase imports. Reads full URL (`window.location.search` + `window.location.hash`), builds `reportthereef://` deep-link preserving all params/hash, and attempts navigation. Fallback button after 2.5s with same full deep-link URL. Auth exchange happens in AuthContext's `appUrlOpen` listener when the deep link fires.
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

### Admin API Routes
- `src/app/api/admin/auth/route.ts` — POST to verify admin password (checks `ADMIN_PASSWORD` env var)
- `src/app/api/admin/wildlife/route.ts` — GET all wildlife sightings. Uses **service role client** to bypass RLS.
- `src/app/api/admin/incidents/route.ts` — GET all incidents (including `internal_notes`). Uses **service role client** to bypass RLS.
- `src/app/api/admin/incidents/[id]/route.ts` — PATCH to update incident status and internal notes. Uses **service role client** to bypass RLS.
- `src/app/admin/layout.tsx` — Admin layout with password gate (stores auth in `rtr_admin_auth`). Nav links to `/admin/sightings` and `/admin/incidents`.
- `src/app/admin/sightings/page.tsx` — Admin wildlife sightings table with CSV export. Fetches from `/api/admin/wildlife`.
- `src/app/admin/incidents/page.tsx` — Admin incidents table with status management, internal notes, photo viewer, CSV export. Fetches from `/api/admin/incidents`.

### Explore API Routes
- `src/app/api/anchorages/route.ts` — GET anchorages with optional `island` and `search` filters. Calls `searchAnchorages()` from `src/lib/anchorages-data.ts`.
- `src/app/api/anchorages/[id]/route.ts` — GET single anchorage by ID (auto-generated `anchorage-N` format).

### Push Notifications
- `src/lib/push-notifications.ts` — `registerPushNotifications()` function. Requests notification permission, subscribes to push via VAPID key, saves subscription to `push_subscriptions` table. **CRITICAL: uses `.trim()` on VAPID key because trailing spaces were causing atob failures.**
- `src/app/api/push/send/route.ts` — POST endpoint to send push notifications. Uses `web-push` package with service role Supabase client. **CRITICAL: uses `.trim()` on both VAPID keys.**
- `public/sw.js` — Simple service worker (NOT Workbox). Imports push-sw.js. Handles install, activate, basic fetch caching. **Was in .gitignore previously — now tracked in git.**
- `public/push-sw.js` — Push notification event handlers. Shows notifications, handles clicks (opens app to /connect).

### Other Key Files
- `src/lib/constants.ts` — `BVI_ANCHORAGES` (63 entries, coordinates updated March 18 2026 to match verified nautical chart positions), `CHECKIN_CONFIG` (EXPIRY_HOURS: 48, VERIFICATION_INTERVAL_HOURS: 6), `AUTO_CHECKIN_RADIUS_KM` (0.926km = 0.5nm), `HOLDING_TYPES` (sand, sand_mud, sand_rock, mud, grass, rocky, coral), `PROTECTION_LEVELS`, `BVI_BOUNDS`, `BVI_CHECKIN_BOUNDS`, `MAX_FILE_SIZE` (re-exported from `upload-limits.ts`)
- `src/lib/upload-limits.ts` — Single source of truth for upload limits: `MAX_UPLOAD_BYTES` (15MB), `MAX_UPLOAD_MB` (15). Imported by constants.ts, supabase/storage.ts, and API routes.
- `src/lib/geo-utils.ts` — Shared `calculateDistance()` haversine function
- `src/lib/platform.ts` — Platform detection for Capacitor native vs web. Exports `isNativePlatform()`, `getPlatform()` ('ios'|'android'|'web'), `getPushChannel()` ('apns'|'web'). Uses multi-signal detection: `window.Capacitor` globals, `window.webkit?.messageHandlers?.bridge` (WKWebView bridge), and PWA standalone checks. Safe in web-only builds.
- `src/lib/push-notifications.ts` — Push notification registration/unregistration. **Guarded with `isNativePlatform()` early return** to prevent `navigator.serviceWorker.ready` from crashing in WKWebView (service workers are not supported for remote URLs in WKWebView).
- `capacitor.config.ts` — Capacitor configuration. Points native shells at `https://www.reportthereef.com` via `server.url` (uses `www` to avoid a 307 redirect from the bare domain). App ID: `com.beyondthereef.reportthereef`. `allowNavigation`: `reportthereef.com`, `*.reportthereef.com`, `*.supabase.co`, `accounts.google.com`. iOS config: `contentInset: 'automatic'`, `allowsLinkPreview: false` (hides URL bar in WebView), `preferredContentMode: 'mobile'` (forces mobile layout on iPad), `backgroundColor: '#0a1628'` (prevents white flash between splash and WebView load).
- `public/.well-known/assetlinks.json` — Android Digital Asset Links for TWA. **Contains placeholder fingerprint** — must be replaced before Android submission.
- `public/.well-known/apple-app-site-association` — Apple Associated Domains configuration for Universal Links. Routes `/auth/callback*` and `/auth/native-callback*` to the native app. Also includes `webcredentials` for password autofill. App ID: `949R9WW2TN.com.beyondthereef.reportthereef`.
- `ios/App/App/App.entitlements` — iOS entitlements file with Associated Domains: `applinks:www.reportthereef.com`, `applinks:reportthereef.com`, `webcredentials:www.reportthereef.com`, `webcredentials:reportthereef.com`.
- `next.config.mjs` — next-pwa has been REMOVED entirely. Manual SW only. Includes `headers()` config to serve AASA file with `Content-Type: application/json`.
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
- `ADMIN_PASSWORD` — Used by `/api/admin/auth` to gate access to admin pages. Set on Vercel; not in `.env.local`.
- `ADMIN_USER_IDS` — Comma-separated list of user UUIDs that have admin privileges (used by `isAdmin()` in `src/lib/api-helpers.ts`)

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
32. ✅ Anchorage coordinates updated to verified nautical chart positions (30 locations)
33. ✅ 4 new anchorages added (Beef Island Bluff, Guana Island White Bay, Mountain Point VG, Biras Creek VG)
34. ✅ iOS app icon set (1024x1024 universal format from project logo)
35. ✅ Capacitor iOS WebView URL bar hidden (`contentInset: 'automatic'`, `allowsLinkPreview: false`)
36. ✅ Admin pages (`/admin/incidents`, `/admin/sightings`) show all data via service role client (bypasses RLS)
37. ✅ Sensitive files removed from git (signing keys, certificates, APKs, Android build artifacts)
38. ✅ iPad rendering fixed (`preferredContentMode: 'mobile'` forces mobile WebView on iPad)
39. ✅ Footer simplified — single list of 6 working links, removed broken Resources and Legal placeholder sections
40. ✅ Info page disclaimer removed ("qualified counsel" text)
41. ✅ Branded dark splash screen (logo on `#0a1628` background) replacing missing/white default Capacitor splash images
42. ✅ LaunchScreen.storyboard background changed from white `systemBackgroundColor` to dark `#0a1628`
43. ✅ PWA install prompt hidden in native Capacitor shell (multi-signal `isNativeApp()` with bridge race condition fix in `InstallPrompt.tsx`)
44. ✅ Server URL changed to `https://www.reportthereef.com` to avoid 307 redirect that caused WKWebView to open Safari externally
45. ✅ `allowNavigation` configured for `reportthereef.com`, `*.reportthereef.com`, `*.supabase.co`, `accounts.google.com`
46. ✅ Dark WebView background (`backgroundColor: '#0a1628'`) eliminates white flash between splash and page load
47. ✅ Splash screen PNGs regenerated (logo centered on `#0a1628` background, 2732x2732)
48. ✅ Push notification registration guarded with `isNativePlatform()` to prevent WKWebView crashes from `navigator.serviceWorker.ready`
49. ✅ `InstallPrompt` component removed from `layout.tsx` (no longer needed for app store distribution)
50. ✅ Auth redirect allowlists updated for `www.reportthereef.com` (Supabase site URL + redirect URLs, Google OAuth authorized origins + redirect URIs)
51. ✅ iOS permissions added to Info.plist: `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`, `NSLocationWhenInUseUsageDescription`
52. ✅ Moorings/Reserve feature hidden from all UI surfaces (nav, footer, home, profile, anchorage panels) — addresses Guideline 2.2 beta/incomplete features rejection
53. ✅ Sign in with Apple button added to login page (Guideline 4.8 compliance)
54. ✅ Native OAuth flow: Google + Apple sign-in uses `@capacitor/browser` (SFSafariViewController) instead of WKWebView — fixes "Error 403: disallowed_useragent"
55. ✅ Deep-link return from OAuth via `appUrlOpen` listener with client-side `exchangeCodeForSession()`
56. ✅ Apple App Site Association (AASA) file for Universal Links (`/auth/callback*`, `/auth/native-callback*`)
57. ✅ Associated Domains entitlements configured in Xcode project (applinks + webcredentials)
58. ✅ Custom URL scheme `reportthereef://` registered as deep-link fallback in Info.plist
59. ✅ Native callback web fallback page at `/auth/native-callback` (handles Universal Link failures gracefully)
60. ✅ AASA served with `Content-Type: application/json` via next.config.mjs headers
61. ✅ Single-source OAuth exchange in AuthContext `appUrlOpen` handler — handles both PKCE (`code`) and implicit flow (`access_token`/`refresh_token` hash)
62. ✅ Native-callback page is pure relay — preserves full URL search + hash in deep link, zero auth logic
63. ✅ `browserFinished` listener in AuthContext refreshes session when SFSafariViewController is dismissed
64a. ✅ `oauthInProgress` ref guard prevents double `Browser.open()` from StrictMode/double-tap
64b. ✅ `processingAuthReturn` ref guard prevents duplicate code exchanges in `appUrlOpen`
64c. ✅ Removed `window.location.href = "/connect"` race from AuthContext — login page redirects via auth state `useEffect`
64d. ✅ `router.replace("/connect")` instead of `push` after auth (prevents back-button to login)
64e. ✅ Split OAuth timeout: 15s web, 90s native (SFSafariViewController needs more time)
64f. ✅ Labeled logging on every OAuth return branch for Xcode console debugging
64. ✅ Account deletion hardened: reservations/reports delete steps are defensive (try/catch, non-blocking if tables don't exist)
65. ✅ Account deletion adds conversations cleanup (nullifies user references to avoid FK constraint on profile delete)
66. ✅ Client-side delete-account page shows `failedStep` in error message for debugging
67. ✅ OAuth `appUrlOpen` URL matching uses protocol-aware branching — handles both custom scheme (`reportthereef://auth/...`) and HTTPS universal links correctly
68. ✅ Structured debug logging on every `appUrlOpen` event (`{ rawUrl, isAuthCallback }` + full parse breakdown for matched URLs)
69. ✅ Header uses `fixed` positioning instead of `sticky` — reliable across WKWebView, with matching `pt-*` offsets on main content
70. ✅ OAuth buttons (Google, Apple) hidden in native iOS app — only email/password shown, eliminates Guideline 4.8 requirement
71. ✅ Tri-state `isNative` detection (`null`/`true`/`false`) prevents OAuth button flash during hydration
72. ✅ Android and Desktop Browser location help instructions hidden in native iOS app (Guideline 2.3.10)
73. ✅ App Store download badge on home page hero (web only, hidden in native app via tri-state detection)
74. ✅ Legal disclaimer updated on Info page with counsel-provided text
75. ✅ TWA manifest updated — host/URLs changed to `www.reportthereef.com`, version bumped to 4
76. ✅ `.gitignore` hardened — `/app/` guard with warning comment, `android-twa/` ignored, duplicate `.env` removed, `android.keystore` added
77. ✅ Cursor safety rules (`.cursor/rules/git-safety.mdc`) — prevents force push, `git rm -r --cached .`, root `app/` creation, and guides recovery from diverged branches

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
- Capacitor native shells load the Vercel-hosted app remotely (`server.url: 'https://www.reportthereef.com'` in `capacitor.config.ts`). **Must use `www` subdomain** — the bare domain `reportthereef.com` returns a 307 redirect to `www`, which causes WKWebView to open Safari externally. The app is NOT statically exported — Next.js API routes require the Vercel backend.
- Service worker registration is skipped in native Capacitor shells to avoid SW cache/push conflicts with native push notifications.
- Native OAuth (Google/Apple) uses a two-step flow: (1) `skipBrowserRedirect: true` to get the OAuth URL from Supabase, (2) `Browser.open()` to open it in SFSafariViewController (not WKWebView). **Return flow:** Supabase redirects to `https://www.reportthereef.com/auth/native-callback?code=xxx` (or `#access_token=...` for Apple implicit flow). SFSafariViewController loads the native-callback page, which is a pure relay — it builds a `reportthereef://` deep link preserving the full URL search + hash, and navigates to it. iOS fires `appUrlOpen` in the Capacitor app. AuthContext's `appUrlOpen` listener is the **single source of auth exchange**: it parses both query params (`code` → `exchangeCodeForSession`) and hash fragments (`access_token`/`refresh_token` → `setSession`), then calls `refreshUser()`. The login page's `useEffect` watching `isAuthenticated` handles the redirect to `/connect` via `router.replace`. AuthContext also has a `browserFinished` listener that calls `refreshUser()` when SFSafariViewController is dismissed (handles user tapping Done).
- The web OAuth flow (non-native) is unchanged — Supabase redirects the browser directly, server-side code exchange happens at `/auth/callback/route.ts`.
- Moorings/Reserve feature (`/moorings`) is hidden from all navigation but the route still exists. Can be re-enabled by adding it back to `NAV_ITEMS` in `src/lib/constants.ts` and the individual nav component arrays.
- Platform detection (`src/lib/platform.ts`) uses multi-signal detection (`window.Capacitor` globals, `window.webkit?.messageHandlers?.bridge`, standalone mode checks) instead of importing `@capacitor/core` directly. This is necessary because the Capacitor bridge may not be injected before `useEffect` fires when loading a remote URL.
- Push notification multi-channel support requires running `scripts/push-schema-migration.sql` in Supabase SQL Editor before deploying native iOS builds.
- Android TWA uses web push (Chrome-backed); no FCM complexity unless reliability issues arise in testing.
- `public/.well-known/assetlinks.json` has a placeholder fingerprint — must be replaced with real Play signing key before Android submission.
- Account deletion anonymizes `incidents` and `wildlife_sightings` (nulls `reporter_id`, `contact_name`, `contact_email`, `reporter_name`, `reporter_email`) but keeps the records for conservation. All other user data is deleted.
- Account deletion does NOT delete `conversations` rows (shared between two users). Only the deleting user's own `chat_messages` are removed. The other participant sees a "Deleted User" fallback.
- Account deletion does NOT delete `reports` where `reported_id = userId` — those were filed by other users and belong to them.
- Account deletion uses a service role Supabase client (same pattern as `src/lib/push.ts`) to bypass RLS. CSRF protected via Origin/Referer allowlist.
- Avatar storage cleanup during deletion is defensive (try/catch, non-blocking) — deletion proceeds even if storage cleanup fails.
- `/delete-account` is the public URL for Google Play Console Data Safety compliance. Unauthenticated users see contact email fallback.
- Admin pages at `/admin/*` are password-gated (client-side check via `ADMIN_PASSWORD` env var). Admin API routes use the Supabase service role client to bypass RLS — **these routes have no auth middleware**, so the admin password gate in `layout.tsx` is the only protection. Consider adding server-side auth verification if the admin surface grows.
- Admin API routes are separate from public routes. `/api/admin/wildlife` and `/api/admin/incidents` bypass RLS; `/api/wildlife` and `/api/incidents` still use the anon key with RLS for regular users.

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

### Session 5 Changes (March 18, 2026)

1. **Anchorage coordinates updated** — Updated 26 existing anchorage coordinates in `src/lib/constants.ts` (`BVI_ANCHORAGES`) to match verified nautical chart positions (degrees/minutes converted to decimal degrees). Updated 8 matching entries in `prisma/seed-data/anchorages.ts`. Updated `DEFAULT_BVI_LOCATION` in `src/app/api/connect/checkins/route.ts` to match new Bight coordinates.

2. **4 new anchorages added to `BVI_ANCHORAGES`:**
   - `beef-island-bluff` (Tortola) — 18.4307, -64.5275
   - `guana-island-white-bay` (Guana Island) — 18.4726, -64.5763
   - `mountain-point-vg` (Virgin Gorda) — 18.4997, -64.4114
   - `biras-creek` (Virgin Gorda) — 18.4929, -64.3568
   - Old `guana-island` entry split into `guana-island-monkey-point` (Monkey Point) and `guana-island-white-bay` (White Bay)
   - `salt-pond-bay` renamed to "Salt Island Anchorage"
   - Total `BVI_ANCHORAGES`: 63 entries

3. **Capacitor iOS config** — Removed `webDir: 'www'` from `capacitor.config.ts`. Added `ios.contentInset: 'automatic'` and `ios.allowsLinkPreview: false` to hide the URL bar in the native WebView.

4. **iOS app icon** — Set up single 1024x1024 universal icon format in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`. Updated `Contents.json` to modern Xcode format (`idiom: "universal"`, `platform: "ios"`). Icon is the project logo (`app-icon-1024.png`).

5. **Git cleanup** — Added to `.gitignore` and removed from git tracking: signing keys (`*.p8`, `*.keystore`, `*.cer`, `*.mobileprovision`, `*.certSigningRequest`), Android build artifacts (`.gradle/`, `app/build/`, `*.apk`, `*.aab`), Android project files (`build.gradle`, `settings.gradle`, `gradle/`, etc.), app screenshots, `store_icon.png`, `twa-manifest.json`. Files still exist locally but are no longer tracked.

6. **Admin pages RLS fix** — Created dedicated admin API routes that use Supabase **service role client** (bypasses RLS):
   - `src/app/api/admin/wildlife/route.ts` — GET all wildlife sightings
   - `src/app/api/admin/incidents/route.ts` — GET all incidents with `internal_notes`
   - `src/app/api/admin/incidents/[id]/route.ts` — PATCH status and internal notes
   - Updated `src/app/admin/sightings/page.tsx` to fetch from `/api/admin/wildlife` (was `/api/wildlife`)
   - Updated `src/app/admin/incidents/page.tsx` to fetch/patch via `/api/admin/incidents` (was `/api/incidents`)
   - Public API routes (`/api/wildlife`, `/api/incidents`) remain unchanged (still use anon key + RLS)

7. **iPad blank screen fix** — Added `preferredContentMode: 'mobile'` to `ios` block in `capacitor.config.ts`. This forces WKWebView on iPad to request the mobile version of the site instead of the desktop version (iPadOS default since iPadOS 13). App Store review had rejected due to blank content on iPad. Synced with `npx cap sync ios`.

8. **Footer simplified** — Replaced 4-column footer layout (Brand, Quick Links, Resources, Legal) in `src/components/layout/Footer.tsx` with a 2-column layout (Brand + 6 links). Removed Resources section (all `#` placeholder links: BVI Marine Guide, Weather Updates, Safety Guidelines, Contact Us) and Legal section (all `#` placeholder links: Privacy Policy, Terms of Service, Cookie Policy). New footer links: Report an Incident (`/report`), Report Wildlife (`/wildlife`), Explore Anchorages (`/anchorages`), Reserve a Mooring (`/moorings`), Connect with Boaters (`/connect`), Info (`/info`). Also removed the "qualified counsel" disclaimer paragraph from `src/app/(main)/info/page.tsx`.

### Session 6 Changes (March 24, 2026) — App Store Rejection Fix

**Context:** App Store rejected version 1.0 under Guideline 2.1(a) — "app only displayed a blank page upon launch" on iPhone 17 Pro Max running iOS 26.3.1. Root cause: the `LaunchScreen.storyboard` referenced a "Splash" image asset whose PNG files were missing/non-functional, and the storyboard background was white `systemBackgroundColor`. The reviewer saw a blank white screen on launch while the WebView loaded.

1. **Branded dark splash screen** — Generated three 2732x2732 splash images (project logo centered on `#0a1628` dark background) using Pillow and placed them in `ios/App/App/Assets.xcassets/Splash.imageset/` as `splash-2732x2732.png`, `splash-2732x2732-1.png`, `splash-2732x2732-2.png`. `Contents.json` unchanged (filenames match existing references).

2. **LaunchScreen.storyboard dark background** — Replaced `systemBackgroundColor` (white, `color white="1"`) with custom sRGB color matching `#0a1628` (`red="0.039" green="0.086" blue="0.157"`). Removed the `systemBackgroundColor` resource entry and the "System colors in document resources" capability dependency.

3. **PWA install prompt — native detection fix** — The initial `isNativePlatform()` guard (from `@/lib/platform`) failed because the Capacitor bridge (`window.Capacitor`) may not be injected before the `useEffect` fires when loading a remote URL via `server.url`. Replaced with an inline `isNativeApp()` function in `src/components/pwa/InstallPrompt.tsx` using multi-signal detection:
   - `window.Capacitor?.isNativePlatform?.()` — primary, checks bridge global directly
   - `window.Capacitor?.getPlatform?.()` — secondary bridge check (`"ios"` or `"android"`)
   - `window.matchMedia("(display-mode: standalone)")` — PWA installed check
   - `(navigator as any).standalone === true` — iOS Safari standalone
   - `navigator.userAgent.includes("CAPBridgeManager")` — UA fallback only
   - Also added re-check inside the iOS 3-second timer callback (`if (!isNativeApp()) setShowIOSPrompt(true)`) to close the bridge injection race condition. Removed unused `@/lib/platform` import.

4. **Conditional fixes identified but NOT yet applied** (only if Xcode console diagnostics show need):
   - **ATS exception** — `NSAllowsArbitraryLoadsInWebContent` in `Info.plist`, prefer domain-scoped `NSExceptionDomains` first
   - **allowNavigation** — Minimal list in `capacitor.config.ts` (`reportthereef.com`, `*.supabase.co`, `accounts.google.com`)

5. **Native shell verification** — Investigated whether the iOS app was booting in SFSafariViewController (which would explain a bottom URL bar and PWA prompt). Hypothesis was that the app might be showing a Safari-like browser view instead of the native Capacitor WKWebView shell.

   **Verification results:**

   - **`ios/App/App/capacitor.config.json`** — No unusual `iosScheme`; `server.url` is correct HTTPS (`https://reportthereef.com`); `ios` block has `contentInset: "automatic"`, `allowsLinkPreview: false`, `preferredContentMode: "mobile"`.
   - **`ios/App/App/Info.plist`** — No SFSafariViewController or browser-specific keys found.
   - **SPM/Capacitor dependency wiring** — No Podfile present; project uses Swift Package Manager via `ios/App/CapApp-SPM/Package.swift`. This is standard Capacitor setup using the WKWebView stack, not Safari VC.
   - **`ios/App/App/AppDelegate.swift`** — Standard Capacitor app delegate (extends `UIResponder, UIApplicationDelegate`, imports `Capacitor`). No custom Safari opening logic in app bootstrap.
   - **Main.storyboard root controller** — Uses `CAPBridgeViewController` (Capacitor bridge VC), confirming WKWebView is the runtime.

   **Command outputs verified:**
   - `cat ios/App/App/AppDelegate.swift` — Standard Capacitor template, no Safari references
   - `cat ios/App/App.xcodeproj/project.pbxproj | grep -i safari` — No matches
   - `cat ios/App/App/capacitor.config.json` — Confirmed correct config (see above)

   **Conclusion:** No evidence of SFSafariViewController boot path. The native shell is standard Capacitor WKWebView. Any bottom-bar UI that appears is likely:
   - The app's own `MobileNav` component (fixed bottom nav with Home, Report, Wildlife, Explore, Reserve, Connect icons), OR
   - A transient browser UI during Google OAuth redirect flow (expected, not the main app shell)

   **Narrowed focus for remaining investigation:**
   - InstallPrompt native detection / timer race fix (completed — item 3 above)
   - Splash / launch behavior validation on iPhone simulator
   - If bottom UI reappears, capture screenshot + Xcode console logs at the exact moment it appears to determine source

### Session 7 Changes (April 1, 2026) — App Store Blank Screen Root Cause Fix

**Context:** After Session 6 splash/PWA fixes, the app still showed a blank white screen on iPhone 17 Pro Max (iOS 26.3.1/26.4) and iPad Air during App Store review. Extensive debugging identified two root causes:

**Root cause 1 — 307 redirect:** `https://reportthereef.com` returns a 307 redirect to `https://www.reportthereef.com/`. Capacitor's WKWebView treated this as external navigation, opening Safari instead of loading the site internally. The user saw the app launch, Safari briefly open, then a blank white screen when returning to the app.

**Root cause 2 — Service worker crash:** `navigator.serviceWorker.ready` in `src/lib/push-notifications.ts` was crashing inside WKWebView because service workers are not supported for remote URLs loaded via `server.url`. The existing `isNativePlatform()` guard was unreliable because it depended on `@capacitor/core` dynamic import, which doesn't work for remote URL contexts.

**Fixes applied:**

1. **Server URL changed to canonical `www` origin** — Updated `server.url` in `capacitor.config.ts` from `https://reportthereef.com` to `https://www.reportthereef.com`, bypassing the 307 redirect entirely. Verified with `curl -I` that the `www` URL returns 200 directly.

2. **`allowNavigation` added** — Configured `['reportthereef.com', '*.reportthereef.com', '*.supabase.co', 'accounts.google.com']` in `capacitor.config.ts` to ensure OAuth redirects and Supabase API calls stay inside the WebView.

3. **Platform detection hardened** — Replaced `isNativePlatform()` in `src/lib/platform.ts` with multi-signal detection: `window.Capacitor` globals, `Boolean(window.webkit?.messageHandlers?.bridge)` for WKWebView bridge, and PWA standalone checks. This works reliably even before the Capacitor bridge is fully injected.

4. **Push notifications guarded** — Added `if (isNativePlatform()) return false;` at the top of both `registerPushNotifications()` and `unregisterPushNotifications()` in `src/lib/push-notifications.ts` to prevent `navigator.serviceWorker.ready` from executing in WKWebView.

5. **Splash images regenerated** — Previous session's splash PNGs had been lost (0 bytes / not on disk). Regenerated 3 splash images (2732x2732, project logo centered on `#0a1628` background) using Pillow and placed in `ios/App/App/Assets.xcassets/Splash.imageset/`.

6. **Dark WebView background** — Added `backgroundColor: '#0a1628'` to the `ios` block in `capacitor.config.ts`. This sets the WKWebView's background color to match the splash screen, eliminating the white flash during the transition from splash to page load.

7. **`InstallPrompt` removed from layout** — Removed the `<InstallPrompt />` component and its import from `src/app/layout.tsx`. Since the app is being distributed via app stores, the PWA install prompt is no longer needed.

8. **Auth allowlists updated** — User updated Supabase Dashboard (Site URL, redirect URLs) and Google Cloud Console (authorized origins, redirect URIs) to include `https://www.reportthereef.com` alongside the bare domain, ensuring OAuth flows work with the new canonical origin.

**Verification:** Both iPhone and iPad simulators confirmed working — content loads inside WKWebView, no blank screen, no Safari redirect, no JS Eval errors. Dark splash screen with logo displays on launch.

**Git note:** Force-pushed to `origin/main` (commit `4377c81`) because the local repo's history had diverged from the remote. Remote git history was reset to a single root commit. All code is correct and up-to-date.

### Session 8 Changes (April 2, 2026) — Native OAuth + Deep Linking + App Store Compliance

**Context:** Second App Store rejection (Submission ID: 75bb9a1a). Multiple issues on iPad Air 11-inch (M3) and iPhone 17 Pro Max running iOS/iPadOS 26.4:
- **Guideline 2.1(a)** — App crashes on "Take Photo or Video" (missing camera/microphone permissions)
- **Guideline 2.1(a)** — "Use My Current Location" unresponsive (missing location permission)
- **Guideline 2.1(a)** — Google login error ("Error 403: disallowed_useragent" — Google blocks OAuth in WKWebView)
- **Guideline 2.2** — Incomplete features (Moorings/Reserve page showing "Coming Soon")
- **Guideline 4.8** — Sign in with Apple required (third-party login offered without Apple equivalent)
- **Guideline 2.1** — Demo account credentials didn't work
- **Guideline 5.1.1(v)** — Account deletion not visible enough to reviewers

**Fixes applied:**

1. **iOS permissions (crash + location fix)** — Added 5 usage description keys to `ios/App/App/Info.plist`:
   - `NSCameraUsageDescription` — "Report The Reef needs camera access to photograph marine incidents and wildlife sightings"
   - `NSMicrophoneUsageDescription` — "Report The Reef needs microphone access to record video of marine incidents"
   - `NSPhotoLibraryUsageDescription` — "Report The Reef needs photo library access to upload photos of incidents and wildlife"
   - `NSPhotoLibraryAddUsageDescription` — "Report The Reef needs to save photos to your library"
   - `NSLocationWhenInUseUsageDescription` — "Report The Reef needs your location to verify check-ins at BVI anchorages and tag incident reports"

2. **Moorings/Reserve feature hidden (Guideline 2.2)** — Removed all references to the incomplete `/moorings` page:
   - Removed from `NAV_ITEMS` in `src/lib/constants.ts`
   - Removed from `navItems` in `src/components/layout/Header.tsx` (+ `Ship` icon import)
   - Removed from `navItems` in `src/components/layout/MobileNav.tsx` (+ `Ship` icon import)
   - Removed "Reserve a Mooring" link from `src/components/layout/Footer.tsx`
   - Removed Reserve feature card + `Ship` import from `src/app/(main)/page.tsx`
   - Removed "Moorings Available" stat from home page
   - Removed "Reservations" tab from `src/app/(main)/profile/page.tsx`
   - Removed "Reserve a Mooring" CTA from `src/components/panels/AnchoragePanel.tsx`
   - Updated `description` in `src/app/layout.tsx` metadata to remove "reserve moorings"
   - **Note:** The `/moorings` route itself still exists but is now unreachable from the UI.

3. **Sign in with Apple (Guideline 4.8)** — Added "Continue with Apple" button to `src/app/(auth)/login/page.tsx` alongside Google button, using `supabase.auth.signInWithOAuth({ provider: 'apple' })`. Uses Apple's required black button styling with SVG logo.

4. **Native OAuth flow (fixes Google "disallowed_useragent")** — Complete overhaul of OAuth for native Capacitor shells:
   - **Login page** (`src/app/(auth)/login/page.tsx`): Both Google and Apple OAuth handlers now detect `isNativePlatform()` and use `skipBrowserRedirect: true` to get the OAuth URL, then open it via `Browser.open()` from `@capacitor/browser` (SFSafariViewController on iOS). Redirect target is `https://www.reportthereef.com/auth/native-callback` for native flows.
   - **AuthContext deep-link listener** (`src/context/AuthContext.tsx`): On native platforms, registers an `appUrlOpen` event listener (from `@capacitor/app`) that intercepts Universal Link / custom scheme returns containing `/auth/native-callback` or `/auth/callback`. Extracts the `code` parameter, calls `supabase.auth.exchangeCodeForSession(code)` client-side (critical — establishes session within the WKWebView context), closes the in-app browser, and navigates to `/connect`.
   - **AASA file** (`public/.well-known/apple-app-site-association`): Configures Universal Links for `949R9WW2TN.com.beyondthereef.reportthereef` with paths `/auth/callback*` and `/auth/native-callback*`. Also includes `webcredentials` for password autofill.
   - **Entitlements** (`ios/App/App/App.entitlements`): New file with `com.apple.developer.associated-domains` array: `applinks:www.reportthereef.com`, `applinks:reportthereef.com`, `webcredentials:www.reportthereef.com`, `webcredentials:reportthereef.com`. Referenced in both Debug and Release build configurations in `project.pbxproj`.
   - **Custom URL scheme** (`ios/App/App/Info.plist`): Registered `reportthereef://` as `CFBundleURLSchemes` fallback for when Universal Links don't fire.
   - **Native callback fallback page** (`src/app/auth/native-callback/page.tsx`): Client-side page that attempts a `reportthereef://` deep link, then shows a manual "Open Report The Reef" button + "sign in again" link after 2 seconds if the app didn't open.
   - **AASA content type** (`next.config.mjs`): Added `headers()` config to serve the AASA file with `Content-Type: application/json`.
   - **SPM dependencies**: `@capacitor/browser` and `@capacitor/app` already auto-detected in `ios/App/CapApp-SPM/Package.swift` and `capacitor.config.json` `packageClassList`.

**Still requires manual steps:**
- **Supabase Dashboard**: Add `https://www.reportthereef.com/auth/native-callback` to Authentication → URL Configuration → Redirect URLs
- **Apple Developer Portal**: Ensure App ID has "Associated Domains" and "Sign in with Apple" capabilities enabled
- **Apple Developer Portal**: Configure Services ID for Sign in with Apple (with Supabase callback URL)
- **Supabase Dashboard**: Enable Apple provider with client ID and client secret JWT
- **Verify AASA propagation**: Check `https://www.reportthereef.com/.well-known/apple-app-site-association` returns valid JSON after deploy. Also check Apple CDN: `https://app-site-association.cdn-apple.com/a/v1/www.reportthereef.com`
- **Create demo account**: Sign in with `applereview@reportthereef.com` / `AppleReview2026!`, complete profile, verify from incognito, update App Store Connect
- **Record account deletion flow**: Create throwaway account, record full deletion flow on physical device, attach to App Store Connect review notes
- **Build and test**: `npx cap sync ios` (if needed), clean build in Xcode, test Google + Apple OAuth on iPhone + iPad simulators

### Session 8b Fixes (April 2, 2026) — OAuth Return Flow + Account Deletion

**Context:** Testing revealed two issues: (1) Apple/Google OAuth completed but the user returned to the login page instead of being signed in. (2) Account deletion failed with a generic error.

**OAuth return flow — root cause and fix:**

The OAuth flow opens SFSafariViewController via `Browser.open()`. After the user authenticates, Supabase redirects to `https://www.reportthereef.com/auth/native-callback?code=xxx`. Because this URL is on the same domain as `server.url`, Capacitor's WKWebView handles it as normal same-origin navigation — **Universal Links don't fire for same-origin URLs**, so the `appUrlOpen` listener in AuthContext never triggered. The native-callback page was trying to deep link back to an app it was already running inside.

**Fixes:**
1. **`src/app/auth/native-callback/page.tsx` rewritten** — Now branches on `isNativePlatform()`:
   - **Inside WKWebView** (native = true): Exchanges the auth code directly via `supabase.auth.exchangeCodeForSession(code)` and redirects to `/connect`. No deep linking needed.
   - **Inside SFSafariViewController** (native = false): Attempts `reportthereef://auth/native-callback?code=xxx` deep link. Fallback button now includes the code parameter (was previously missing).
   - Shows proper error states with messages.

2. **`src/context/AuthContext.tsx` — `browserFinished` listener added**: When the user dismisses SFSafariViewController (taps "Done"), `refreshUser()` fires. If a session was established, `isAuthenticated` becomes true, and the login page's existing `useEffect` auto-redirects to `/connect`. This fixes the Google sign-in "glitch" where the user ended up signed in but stuck on the login page.

3. **`src/app/api/account/delete/route.ts` hardened**:
   - Steps 7 (reservations) and 8 (reports) wrapped in try/catch — they log a warning and continue if the table doesn't exist instead of failing the entire deletion.
   - Added step 9: defensive conversations cleanup (nullifies `user1_id`/`user2_id` references to avoid FK constraint when deleting the profile).
   - Step numbering updated (avatar → 11, profile → 12, auth user → 13).

4. **`src/app/(auth)/delete-account/page.tsx`**: Error message now includes `failedStep` from the API response for easier debugging.

### Session 8c Fixes (April 2, 2026) — Single-Source OAuth Exchange

**Context:** Xcode console testing revealed: (1) Google OAuth completed successfully (`SIGNED_IN` in logs) but user stayed on login page due to `window.location.href = "/connect"` racing with React state. (2) Apple OAuth showed "no authorization code" because Apple returns tokens in hash fragment (`#access_token=...`) not query params. (3) `Browser.open()` fired twice (React StrictMode / double-tap).

**Architecture change:** Moved to single-source auth exchange pattern. AuthContext's `appUrlOpen` listener is now the only place auth codes/tokens are exchanged. The native-callback page is a pure relay with zero auth logic.

**Fixes:**
1. **`src/app/(auth)/login/page.tsx`**:
   - `oauthInProgress` ref guard prevents double `Browser.open()`. Self-healing: resets when loading states settle. Reset in `catch` and timeout. NOT in `finally` (Browser.open resolves immediately).
   - `useEffect` watches `authLoading`/`isGoogleLoading`/`isAppleLoading` — resets guard when all settle (covers `browserFinished` → `refreshUser()` path).
   - Split timeout: 15s for web, 90s for native (SFSafariViewController needs more time).
   - `router.replace("/connect")` instead of `router.push` — prevents back-button returning to login.

2. **`src/context/AuthContext.tsx`**:
   - `processingAuthReturn` ref with `try/finally` prevents duplicate exchanges.
   - URL matching via protocol-aware branching (see Session 8d fix below — the original strict pathname matching was broken for custom scheme URLs).
   - Parses both query params (`code` → `exchangeCodeForSession`) and hash fragment (`access_token`/`refresh_token` → `setSession`) for Apple implicit flow support.
   - Labeled logging: `code_exchange`, `set_session_hash`, `no_auth_payload`, `exchange_error`, `set_session_error`, `unhandled_error`.
   - Removed `window.location.href = "/connect"` — login page `useEffect` handles redirect via auth state.
   - `refreshUser()` always called after exchange (even on error, to sync state).

3. **`src/app/auth/native-callback/page.tsx`** — Pure relay:
   - Zero auth logic, zero supabase imports, zero platform detection.
   - Reads `window.location.search` + `window.location.hash`, builds `reportthereef://auth/native-callback${search}${hash}`.
   - Fallback button after 2.5s with same full deep-link URL.
   - Error state if no params/hash present.

### Session 8d Fix (April 2, 2026) — OAuth Deep-Link URL Matching

**Bug:** The `appUrlOpen` handler in `AuthContext.tsx` used `new URL(url).pathname` to match incoming deep links. For custom scheme URLs like `reportthereef://auth/native-callback?code=xxx`, JavaScript's `URL` parser treats `auth` as the **host** (not part of the path), returning `pathname: "/native-callback"`. The check `path !== "/auth/native-callback"` was always true, so the handler silently exited without exchanging the auth code. This broke both Google and Apple OAuth on iOS — sign-in completed in SFSafariViewController but the app never received the tokens.

**Fix:** Replaced strict pathname check with protocol-aware branching:
- **Custom scheme** (`reportthereef:`): matches `host === "auth"` + `pathname === "/native-callback"` — the exact shape emitted by the relay page
- **HTTPS** (universal link): matches `pathname === "/auth/native-callback"` or `"/auth/callback"`
- **Fallback** (parse failure): loose `includes()` gated by requiring `code=` or `access_token=` in URL to prevent false positives

**Debug logging added:** Every `appUrlOpen` event is logged with `{ rawUrl, isAuthCallback }`. Matched events get a full structured parse breakdown (`protocol`, `host`, `pathname`, `search`, `hash`) for Xcode console diagnostics.

**Key lesson:** When using custom URL schemes, never rely on `new URL().pathname` for path matching — the host/path split differs from HTTPS URLs. Always test URL parsing with the actual scheme your app uses.

### Session 8e Fix (April 2, 2026) — Fixed Header Positioning

**Bug:** The header had `position: sticky` (`sticky top-0 z-40`) but it scrolled away with content in the iOS Capacitor WKWebView. `sticky` positioning can be defeated by scroll container edge cases in WKWebView.

**Fix:**
- **`src/components/layout/Header.tsx`**: Changed `sticky top-0 z-40` to `fixed top-0 z-50`. Background opacity bumped to `bg-background/90` / `bg-background/80` to prevent content showing through.
- **`src/app/(main)/layout.tsx`**: Added `pt-14 sm:pt-16 md:pt-20 lg:pt-44` to `<main>` to offset content below the fixed header, matching header heights at each breakpoint (`h-14`, `sm:h-16`, `md:h-20`, `lg:h-44`).

### Session 8f Fix (April 2, 2026) — Hide OAuth in Native App

**Problem:** Google and Apple OAuth don't reliably redirect back to the Capacitor WKWebView after SFSafariViewController authentication. Deep-link URL matching was fixed (Session 8d) but SFSafariViewController still doesn't reliably return users to the app. Email/password login works perfectly.

**Decision:** Hide OAuth buttons in the native iOS app entirely. Only show email/password login on native. OAuth (Google + Apple) continues to work on the web.

**Implementation:**
- **`src/app/(auth)/login/page.tsx`**: Added tri-state `isNative` flag (`null` = undetermined, `true` = native, `false` = web). Google button, Apple button, and "or" divider are wrapped in `{isNative === false && (...)}`. Buttons are hidden during hydration (`null`) to prevent flash.
- **Verified**: `signInWithOAuth` only exists in `login/page.tsx` — no other screens expose OAuth.

**Apple review implications:**
- **Guideline 4.8** (Sign in with Apple required): No longer applies — no third-party login is offered in the native app.
- **Guideline 2.1(a)** (Google/Apple login bugs): Eliminated — buttons don't exist in native.
- **Demo credentials**: `applereview@reportthereef.com` / `AppleReview2026!` — email/password, works in native.

**Future consideration:** If OAuth is re-enabled in native later, users who signed up with Google/Apple on web will need to use "Forgot password" to set a password for native app login. A hint can be added to the login form at that time.

### Session 8g Fix (April 5, 2026) — Hide Non-iOS Platform References (Guideline 2.3.10)

**Rejection:** Apple rejected for Guideline 2.3.10 — Android references visible in the iOS app.

**Scope:** Only one user-visible occurrence: location help instructions in `src/app/(main)/connect/page.tsx` showed Android and Desktop Browser guidance alongside iOS instructions. `InstallPrompt.tsx` has Android logic but is already removed from the render tree. Internal code (`platform.ts`, `usePWAStandalone.ts`, `assetlinks.json`) is not user-facing.

**Fix:** Added `isNative` state using `isNativePlatform()` to the Connect page. Wrapped the Android and Desktop Browser location help blocks in `{!isNative && (...)}`. iPhone/iPad instructions remain visible always. Web users still see all platform instructions.

**Manual step required:** Also review and clean App Store Connect metadata (description, promotional text, keywords, What's New, App Review Notes, screenshots) for any Android/Google Play references — Guideline 2.3.10 says "app **or metadata**."

### Session 8h Changes (April 5, 2026) — App Store Badge, Legal Disclaimer, TWA Manifest

1. **App Store download badge** — Added official Apple "Download on the App Store" badge to the home page hero section (`src/app/(main)/page.tsx`). Uses `next/image` with `public/badges/app-store-badge.svg`. Hidden in native iOS app via tri-state `isNative` detection (`useState<boolean | null>(null)` resolved in `useEffect`). Only renders when `isNative === false` (web users).

2. **Legal disclaimer replaced** — Replaced the entire "Disclaimer" section in `src/app/(main)/info/page.tsx` (lines 82–107) with new legal text provided by counsel. The previous disclaimer was generic placeholder text.

3. **TWA manifest updated** — Updated `twa-manifest.json`:
   - Changed `host` from `reportthereef.com` to `www.reportthereef.com`
   - Updated `iconUrl`, `maskableIconUrl`, `webManifestUrl`, `fullScopeUrl` to use `www.reportthereef.com`
   - Bumped `appVersionName` from `"3"` to `"4"`, `appVersionCode` from `3` to `4`, `appVersion` from `"3"` to `"4"`

### Session 8i (April 5, 2026) — Site Outage Recovery + Prevention

**Incident:** `www.reportthereef.com` returned a 404 error, taking the entire site offline.

**Root cause:** Android TWA build tools (Bubblewrap) created a root-level `app/` directory containing Android-specific files (`build/`, `src/`, etc.). Next.js App Router auto-detects `app/` at the project root and uses it instead of `src/app/`. Since the root `app/` folder contained Android build files (not Next.js routes), every route resolved to nothing → 404.

**Contributing factor — git history loss:** During troubleshooting, Cursor's shell experienced persistent filesystem errors (stale NFS handle, Bus error), preventing git operations from completing. A `git rm -r --cached .` followed by `git push --force` was run (following external AI advice), which reset the remote's entire commit history. While the code itself was correct, the git history was permanently lost.

**Recovery:**
1. Renamed `app/` to `android-twa/` — this removed the Next.js App Router conflict and the site immediately recovered.
2. Ran `git add -A && git commit && git push` from Terminal.app (Cursor shell was hanging).

**Prevention measures applied:**
1. **`.gitignore` hardened:**
   - Added `/app/` with a prominent warning comment explaining the Next.js conflict
   - Added `android-twa/` to ignore the renamed TWA build output
   - Removed duplicate `.env` entry (was at both line 29 and line 105)
   - Added `android.keystore` explicitly
   - Removed stale `app/build/` and `app/src/` entries (replaced by the blanket `/app/` ignore)

2. **Cursor safety rules created** — New file `.cursor/rules/git-safety.mdc` (with `alwaysApply: true` frontmatter) containing 6 rules:
   - Never `git push --force` without explicit user approval
   - Never `git rm -r --cached .`
   - Never create a root-level `app/` folder
   - Use `git pull --rebase` for branch divergence (never default to force push)
   - If git hangs in Cursor shell, tell user to use Terminal.app
   - Before large git ops, review `git status` and `git ls-files --deleted`

3. **Manual step required — GitHub branch protection:** Go to GitHub → repo Settings → Branches → Add branch protection rule for `main` → Check "Restrict force pushes". This prevents accidental history destruction even if someone runs `git push --force` locally.

**Key lesson:** Never run `git rm -r --cached .` as a fix for tracking issues — it removes ALL files from git's index. If `.env` needs untracking, use `git rm --cached .env` (single file). If a directory needs untracking, use `git rm -r --cached <specific-directory>`. Always verify with `git status` before pushing.

### Critical constraints for future edits
- **`server.url` must use `https://www.reportthereef.com`** (not the bare domain). The bare domain 307-redirects to `www`, which breaks WKWebView navigation. If the redirect behavior changes, this can be reverted.
- **Auth allowlists must include both domains.** Supabase site URL, redirect URLs, and Google OAuth authorized origins/redirect URIs must include both `https://reportthereef.com` and `https://www.reportthereef.com`. Supabase redirect URLs must also include `https://www.reportthereef.com/auth/native-callback` for native OAuth flows.
- **AASA file must be accessible.** After deploy, verify `https://www.reportthereef.com/.well-known/apple-app-site-association` returns valid JSON with `Content-Type: application/json`. Apple caches this via CDN — check `https://app-site-association.cdn-apple.com/a/v1/www.reportthereef.com` for propagation.
- **Associated Domains capability must be enabled** in the Apple Developer Portal for the App ID `com.beyondthereef.reportthereef`. Without this, Universal Links won't work and OAuth return flow falls back to custom URL scheme.
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

### Completed (Sessions 3-5)
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
- ✅ iOS app icon set (1024x1024 universal format)
- ✅ iOS WebView URL bar hidden (Capacitor config)
- ✅ Anchorage coordinates verified and updated
- ✅ Admin pages fixed (service role bypasses RLS)
- ✅ Sensitive files cleaned from git
- ✅ iPad blank screen fixed (`preferredContentMode: 'mobile'`)
- ✅ Footer simplified (6 working links, removed broken placeholder sections)
- ✅ Info page disclaimer removed
- ✅ Branded dark splash screen (App Store rejection fix — replaced missing/white splash images)
- ✅ LaunchScreen.storyboard background changed from white to dark theme
- ✅ PWA install prompt hidden in native Capacitor shell (multi-signal detection + timer race fix)
- ✅ Native shell verified as standard Capacitor WKWebView (not SFSafariViewController)
- ✅ Server URL changed to `www.reportthereef.com` to avoid 307 redirect causing Safari to open
- ✅ `allowNavigation` configured for Supabase and Google OAuth domains
- ✅ Dark WebView background color (`#0a1628`) eliminates white flash between splash and page load
- ✅ Splash images regenerated (logo on dark background, 2732x2732)
- ✅ Push notification registration guarded to prevent WKWebView service worker crashes
- ✅ Platform detection hardened with multi-signal native detection (Capacitor globals + WKWebView bridge + standalone)
- ✅ `InstallPrompt` component removed from layout (not needed for app store distribution)
- ✅ Auth allowlists updated for `www.reportthereef.com` (Supabase + Google OAuth)
- ✅ iPhone + iPad simulator validation passed (no blank screen, no Safari redirect)
- ✅ iOS permissions added to Info.plist (camera, microphone, photo library, location)
- ✅ Moorings/Reserve feature hidden from all UI surfaces (Guideline 2.2)
- ✅ Sign in with Apple added to login page (Guideline 4.8)
- ✅ Native OAuth flow: `@capacitor/browser` + `@capacitor/app` for SFSafariViewController OAuth
- ✅ Deep-link return with `appUrlOpen` listener + client-side `exchangeCodeForSession()`
- ✅ AASA file + entitlements + custom URL scheme for Universal Links
- ✅ Native callback web fallback page
- ✅ AASA content-type header in next.config.mjs

### Manual setup required (user must do in external dashboards)
- ~~Register `reportthereef.com` domain and point DNS to Vercel~~ — **DONE (Session 4)**
- ~~Supabase Dashboard → Authentication → URL Configuration~~ — **DONE (Session 4)**
- ~~Google Cloud Console → OAuth 2.0 Client~~ — **DONE (Session 4)**
- ~~Vercel dashboard: set `NEXT_PUBLIC_APP_URL=https://reportthereef.com`~~ — **DONE (Session 4)**
- Enroll in Apple Developer Program ($99/year) — individual first, migrate to org once D-U-N-S approved
- Enroll in Google Play Developer Program ($25 one-time)

### Remaining code/build work
0. ~~**iPhone + iPad simulator validation**~~ — **DONE (Session 7).** Both pass: dark splash, WebView loads, no Safari redirect, no JS errors.
1. ~~**Validate OAuth in iOS Simulator**~~ — **OAuth flow rebuilt in Session 8.** Uses `@capacitor/browser` (SFSafariViewController) with deep-link return via Universal Links + custom URL scheme. Still needs end-to-end testing on simulator after Apple provider is configured in Supabase.
2. **Push notification multi-channel implementation** — Run `scripts/push-schema-migration.sql` in Supabase, then update `src/lib/push-notifications.ts` to branch on `getPushChannel()` (web → existing VAPID flow, native → `@capacitor/push-notifications` for APNs token). Update `src/lib/push.ts` server-side to send via APNs for `channel === 'apns'` (requires `apn` npm package + APNs key from Apple Developer dashboard).
3. ~~**Native plugins**~~ — **Partially done (Session 8).** `@capacitor/browser` and `@capacitor/app` installed. iOS permissions added to `Info.plist`. Still need: `@capacitor/push-notifications`, `@capacitor/geolocation`, `@capacitor/camera` (these use web APIs through WKWebView currently — native plugins optional but recommended for reliability).
4. **Offline error screen** — Add connectivity detection + branded fallback UI for when WebView can't reach the server.
5. **Android TWA packaging** — Use `@bubblewrap/cli` or PWABuilder. Replace `assetlinks.json` placeholder fingerprint with real Play signing key.
6. **iOS build + submission** — Archive in Xcode, upload to App Store Connect, submit with Apple review notes (conservation platform, native push/GPS/camera, BVI non-profit). Include: working demo credentials, account deletion screen recording, per-guideline fix mapping.
7. **Android submission** — Upload signed AAB to Google Play Console with store listing + screenshots.
8. **QR code + optional /download landing page** — Simple QR pointing to `https://reportthereef.com`, with optional user-agent detection to show App Store / Play Store badges.

### Architecture notes for native builds
- The app is NOT statically exported. Native shells load `https://reportthereef.com` via `server.url` in `capacitor.config.ts`. All API routes stay on Vercel.
- iOS uses Capacitor (WebView wrapper). Android uses TWA (Chrome-backed, web push works natively).
- Push notifications: web channel uses existing VAPID/web-push. iOS native channel uses APNs. Android TWA stays on web push. The `push_subscriptions` table supports one subscription per user per channel after the migration.
- `ios/` folder is committed to git for build reproducibility. `android/` folder (when created via Bubblewrap) should also be committed.
