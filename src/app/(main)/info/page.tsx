import { Anchor, Shield, MessageCircle, AlertTriangle, ExternalLink, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Info",
};

export default function InfoPage() {
  return (
    <div className="container max-w-3xl px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Report The Reef</h1>
        <p className="text-muted-foreground">
          Protecting British Virgin Islands waters through community-driven conservation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-primary" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Report The Reef is a community-powered platform for the BVI boating community.
            We help sailors explore anchorages, connect with fellow boaters, report marine
            incidents, and log wildlife sightings — all to support the conservation and
            protection of the British Virgin Islands&apos; marine environment.
          </p>
          <p>
            Report The Reef is an initiative by{" "}
            <a
              href="https://1beyondthereef.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Beyond The Reef
              <ExternalLink className="h-3 w-3" />
            </a>
            , a locally registered ocean conservation non-profit organisation in the British
            Virgin Islands, with support from the{" "}
            <a
              href="https://www.vipurposefund.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              VI Purpose Fund
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            How Messaging Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            The Connect feature allows you to check in at anchorages, see who&apos;s
            nearby, and message other boaters directly within the app. Conversations
            persist even after you check out, so you can continue communicating with
            people you&apos;ve connected with.
          </p>
          <p>
            Messages are sent over encrypted HTTPS connections and stored securely in
            our database. Messages are not end-to-end encrypted, which means Report The
            Reef administrators may access message content for safety, moderation, or
            legal compliance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            All GPS coordinates, anchorage information, depth data, holding descriptions,
            and mooring details provided in this application are for{" "}
            <strong className="text-foreground">educational and reference purposes only</strong>.
          </p>
          <p>
            Users are solely responsible for verifying all navigational information with
            their own GPS equipment, official nautical charts, and visual observation.
            Always visually locate mooring fields before approaching, and confirm depths
            and conditions independently before anchoring.
          </p>
          <p>
            Report The Reef, Beyond The Reef, and their affiliates are not liable for
            any navigational decisions, property damage, personal injury, or other losses
            arising from the use of information provided in this application.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="text-xs font-medium text-foreground">Last updated: 2026-02-27</p>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account information (email address, display name, profile photo)</li>
              <li>Vessel information (boat name, provided voluntarily)</li>
              <li>GPS location data (used for check-in verification; your exact position is never displayed to other users)</li>
              <li>Messages sent through the Connect feature</li>
              <li>Incident reports and wildlife sighting submissions (including photos and location data)</li>
              <li>Push notification subscription data</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the Report The Reef platform</li>
              <li>To display your check-in at a general anchorage location (not your exact GPS coordinates)</li>
              <li>To facilitate messaging between users</li>
              <li>To send push notifications about new messages</li>
              <li>To aggregate incident and wildlife data for conservation purposes</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Data Security</h3>
            <p>
              All data is transmitted over encrypted HTTPS connections and stored in a
              secure, encrypted database. Profile photos are stored in secure cloud storage.
              We do not sell or share your personal information with third parties for
              marketing purposes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Your Rights</h3>
            <p>
              You may request access to, correction of, or deletion of your personal data
              at any time by contacting us. You can{" "}
              <a href="/delete-account" className="text-primary hover:underline">
                delete your account
              </a>{" "}
              at any time.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:volunteer@1beyondthereef.com"
                className="text-primary hover:underline"
              >
                volunteer@1beyondthereef.com
              </a>
            </p>
          </div>

          <p className="text-xs italic border-t pt-4">
            This legal text is informational and should be reviewed by qualified counsel
            before public launch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
