# REPORT THE REEF — COMPLETE PROJECT HANDOFF

## What This App Is
Report The Reef is a web app (PWA) for the BVI (British Virgin Islands) boating community. It runs at https://report-the-reef.vercel.app

**Stack:** Next.js 14 (App Router), TypeScript, Supabase (auth, database, storage), Mapbox, Tailwind CSS, deployed on Vercel.

**Core Features:**
1. **Report** — Report marine incidents (groundings, pollution, anchor damage, illegal activity) with GPS location and photos
2. **Wildlife** — Log megafauna sightings (whales, dolphins, turtles, rays) with photos and GPS for citizen science
3. **Explore** — Browse all dive sites, anchorages, marine parks, national parks, bird sanctuaries, fisheries zones in the BVI on an interactive map
4. **Connect** — Check in at anchorages, see who's nearby on a real-time map, and message other boaters directly (in-app messaging)
5. **Reserve** — Mooring reservations (integrates with BoatyBall via iframe/redirect)
6. **Home** — Dashboard with stats (incidents reported, anchorages, moorings, community members)

---

## Project Structure — Key Files

### Auth
- `src/context/AuthContext.tsx` — Single source of truth for auth state. Uses `hasInitialized` ref to prevent double-refresh on page load. Calls `registerPushNotifications` on SIGNED_IN and INITIAL_SESSION events.
- `src/app/(auth)/login/page.tsx` — Login page with Google OAuth + email/password. Redirects to /connect when authenticated. Does NOT independently check sessions (AuthContext handles that).
- `src/app/auth/callback/route.ts` — OAuth callback handler. Exchanges code for session, checks if profile is complete, redirects accordingly.
- `src/middleware.ts` — Refreshes auth tokens. Matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, `sw.js`, `push-sw.js`, `manifest.json`, `login`, `verify`, `auth`, `api/auth`, and static file extensions.
- `src/lib/supabase/client.ts` — Browser Supabase client (singleton, persistSession: true)
- `src/lib/supabase/server.ts` — Server Supabase client with cookie handlers

### Connect (Social/Messaging)
- `src/app/(main)/connect/page.tsx` — Main Connect page (~1000+ lines). Contains: check-in system, anchorage map (ConnectMap), user panels, messaging interface, profile viewing, anchorage browsing. This is the biggest file in the project.
- `src/components/maps/ConnectMap.tsx` — Mapbox map showing anchorages with boater count badges. Markers update when count or selection changes.
- `src/components/ConnectNavBadge.tsx` — Red unread message count badge on the Connect nav icon. Polls /api/connect/conversations every 15 seconds.
- `src/components/ServiceWorkerRegistration.tsx` — Registers /sw.js on mount. Imported in layout.tsx.

### Connect API Routes
- `src/app/api/connect/checkins/route.ts` — GET (list active checkins), POST (check in at anchorage). Validates display_name and avatar_url before check-in.
- `src/app/api/connect/checkins/verify/route.ts` — POST with GPS coords. Checks distance from anchorage (5 nautical miles / 9.3km threshold). Returns `movedAway: true` if too far instead of auto-checkout.
- `src/app/api/connect/conversations/route.ts` — GET (list conversations with last message + unread count), POST (create/get conversation). Uses `chat_messages` table (NOT the `messages` table which is Supabase Realtime system table).
- `src/app/api/connect/conversations/[id]/messages/route.ts` — GET (messages in conversation), POST (send message + trigger push notification to recipient)
- `src/app/api/connect/profile/[id]/route.ts` — GET another user's profile
- `src/app/api/connect/profile/photo/route.ts` — POST to upload profile photo. Limit: 20MB. Stores in Supabase Storage "avatars" bucket (public).

### Push Notifications
- `src/lib/push-notifications.ts` — `registerPushNotifications()` function. Requests notification permission, subscribes to push via VAPID key, saves subscription to `push_subscriptions` table. **CRITICAL: uses `.trim()` on VAPID key because trailing spaces were causing atob failures.**
- `src/app/api/push/send/route.ts` — POST endpoint to send push notifications. Uses `web-push` package with service role Supabase client. **CRITICAL: uses `.trim()` on both VAPID keys.**
- `public/sw.js` — Simple service worker (NOT Workbox). Imports push-sw.js. Handles install, activate, basic fetch caching. **Was in .gitignore previously — now tracked in git.**
- `public/push-sw.js` — Push notification event handlers. Shows notifications, handles clicks (opens app to /connect).

### Other Key Files
- `src/app/(main)/connect/page.tsx` — Also contains: verification timer (6hr intervals), GPS distance checking, toast notifications for moved-away warnings
- `src/lib/constants.ts` — `CHECKIN_CONFIG`: EXPIRY_HOURS: 48, VERIFICATION_INTERVAL_HOURS: 6
- `next.config.mjs` — next-pwa has been REMOVED entirely. Manual SW only.
- `prisma/seed.ts` — Excluded from tsconfig build (was causing PrismaClient import error)

---

## Supabase Database Schema

### Tables
- `profiles` — id (uuid, references auth.users), display_name, avatar_url, vessel_name, boat_name, bio, created_at, updated_at
- `checkins` — id, user_id, location_name, location_lat, location_lng, anchorage_id, is_active, visibility, expires_at, last_verified_at, actual_gps_lat, actual_gps_lng, created_at
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
5. ✅ Explore page with all BVI sites on map
6. ✅ Connect — check-in at anchorages (48hr expiry)
7. ✅ Connect — see boaters on map with count badges
8. ✅ Connect — browse any anchorage's boaters
9. ✅ Connect — in-app messaging (conversations persist forever)
10. ✅ Profile photos (upload up to 20MB, stored in Supabase avatars bucket)
11. ✅ Profile viewing (from chat header, map panel, anchorage list)
12. ✅ Service worker registered and active
13. ✅ Push subscription created and saved to database
14. ✅ Push notification sending (api/push/send returns sent:1)
15. ✅ GPS verification with 5nm distance threshold (warns instead of auto-checkout)
16. ✅ Unread message badge on Connect nav icon

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

## Known Architecture Decisions
- `chat_messages` table is used (NOT `messages` which is Supabase Realtime system table)
- Conversations persist forever regardless of check-in status (users can message after checkout)
- Check-in required to appear on map, but not required to send messages
- 48-hour check-in expiry with 6-hour GPS verification intervals
- GPS movement > 5 nautical miles triggers a "Still here?" toast, not auto-checkout
- Profile photo + display name required before check-in
- Push notification upsert uses `onConflict: "user_id"` (one subscription per user)
- next-pwa removed entirely — manual service worker only
- sw.js must NOT be in .gitignore (was previously, causing 404 on Vercel)

## Previous Conversation Transcripts
Full conversation history is available at:
- `/mnt/transcripts/2026-02-16-20-20-28-bvi-app-auth-gps-push-fixes.txt` — Auth fixes, GPS, initial push setup
- `/mnt/transcripts/2026-02-18-20-55-27-connect-messaging-visibility-fixes.txt` — Messaging, Connect visibility
- `/mnt/transcripts/2026-02-21-00-54-15-connect-messaging-profiles-push-notifications.txt` — Profiles, photo upload, push notifications, service worker

## Go-To-Market Status
- Created charter boat flyer (HTML + PDF) with QR code
- Created Instagram carousel (6-slide PDF) with app screenshots
- Created Canva guides for both
- Created comprehensive GTM strategy document with messaging for Instagram, Facebook, WhatsApp, press, marina flyers, partnerships
- Created "Project Loading" Instagram teaser post
- User is actively editing promotional video in iMovie
