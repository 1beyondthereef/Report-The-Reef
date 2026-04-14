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
            Website Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            This Website Disclaimer sets out the terms on which Report The Reef makes anchorage
            information, depth data, GPS coordinates, holding descriptions, mooring details, and
            related content, alerts, notices, and recommendations (together, the &quot;Navigational
            Information&quot;) available through its website, portal, application, or connected
            digital services (together, the &quot;Website&quot;).
          </p>
          <p>
            By accessing or using the Website, the user acknowledges and agrees that use of the
            Navigational Information is entirely at the user&apos;s own risk and subject to this
            disclaimer.
          </p>
          <p>
            All Navigational Information provided on the Website is for{" "}
            <strong className="text-foreground">educational and reference purposes only</strong>.
            It is not intended to constitute professional navigational advice, voyage planning
            advice, or a substitute for properly maintained official charts, licensed mapping
            products, notices to mariners, on-site observations, competent human judgment, or
            mandatory or recommended safety procedures.
          </p>
          <p>
            The Website may use or display data, mapping layers, feeds, software, content or
            services supplied by third parties. The Website operator does not control and is not
            responsible for the accuracy, completeness, timeliness, legality, availability or
            performance of any third-party content or service, nor for any loss or damage arising
            from reliance on it. Links to third-party websites or systems are provided for
            convenience only and do not imply endorsement.
          </p>
          <p>
            Users must not rely on the Website as their sole or primary source for navigation,
            voyage planning, mooring decisions, or for planning any sporting or leisure activity
            where inaccurate, delayed, incomplete, or unavailable information may cause loss,
            damage, delay, injury, or death. Users remain solely responsible for verifying all
            relevant information from official, current, and appropriate sources before acting.
          </p>
          <p>
            Users are solely responsible for verifying all navigational and other information with
            their own GPS and other technical equipment, official nautical charts, and visual
            observation. Always visually locate mooring fields before approaching and confirm
            depths and conditions independently before anchoring. Each user is responsible for
            exercising independent judgment and for ensuring compliance with all applicable laws,
            regulations, codes, operating procedures, safety obligations, and licensing
            requirements relevant to the user&apos;s activities.
          </p>
          <p>
            Users should maintain appropriate equipment, backups, communications capability, and
            alternative navigation resources.
          </p>
          <p>
            Users acknowledge that navigational and marine conditions can change rapidly and
            without notice and may differ materially from information displayed on the Website.
          </p>
          <p>
            While Report The Reef endeavours to keep the Website reasonably up to date, Report
            The Reef does not represent or warrant that any Navigational Information or other
            information on the Website is accurate, complete, current, suitably scaled,
            uninterrupted, error-free, fit for a particular route or purpose, or free from
            omission, delay, technical fault, transmission failure, cartographic inaccuracy,
            geolocation error, or third-party data defect.
          </p>
          <p>
            To the fullest extent permitted by law, Report The Reef, Beyond The Reef and their
            respective affiliates exclude liability for any loss, damage, cost, claim, expense,
            or liability arising out of or in connection with use of, inability to use, or
            reliance on the Website or any Navigational Information contained in it, including
            any direct, indirect, incidental, consequential, special, economic, or pure financial
            loss, loss of profit, loss of opportunity, loss of revenue, loss of data, business
            interruption, delay, detention, route deviation, increased operating cost, property
            damage, personal inconvenience, or third-party claim.
          </p>
          <p>
            Report The Reef may suspend, withdraw, restrict, correct, update, or change any part
            of the Website or its content at any time and without notice.
          </p>
          <p>
            Unless otherwise stated, all intellectual property rights in the Website and the
            Navigational Information are owned by or licensed to Report The Reef. No part of the
            Navigational Information may be copied, reproduced, republished, extracted, adapted,
            reverse engineered, redistributed or exploited for commercial purposes without prior
            written permission, except as permitted by law or by any applicable licence terms.
          </p>
          <p>
            If any provision of this disclaimer is held to be unlawful, invalid or unenforceable,
            that provision shall be deemed severed and the remaining provisions shall continue in
            full force and effect.
          </p>
          <p>
            This disclaimer and any non-contractual obligations arising out of or in connection
            with it shall be governed by the laws applicable in the British Virgin Islands, and
            the courts of the British Virgin Islands shall have exclusive jurisdiction.
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

        </CardContent>
      </Card>
    </div>
  );
}
