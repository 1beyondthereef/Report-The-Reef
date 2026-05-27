import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const ALERT_RECIPIENTS = [
  'kendyl@1beyondthereef.com',
  'report@1beyondthereef.com',
];

export const ALERT_FROM = 'Report The Reef <alerts@reportthereef.com>';

/**
 * Send an alert email. Returns silently on failure — never throws.
 */
export async function sendAlertEmail({
  subject,
  html,
}: {
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping alert email');
    return;
  }

  try {
    await resend.emails.send({
      from: ALERT_FROM,
      to: ALERT_RECIPIENTS,
      subject,
      html,
    });
  } catch (error) {
    console.error('[email] Failed to send alert:', error);
  }
}

function formatCoords(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return 'Not provided';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not provided';
  return new Date(dateStr).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Virgin',
  });
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  reef_damage: 'Reef Damage',
  pollution: 'Pollution',
  abandoned_fishing_gear: 'Abandoned Fishing Gear',
  wildlife: 'Wildlife Concern',
  safety: 'Safety Hazard',
  other: 'Other',
};

export function buildIncidentEmailHtml(incident: Record<string, unknown>): string {
  const type = ACTIVITY_TYPE_LABELS[incident.activity_type as string] ?? (incident.activity_type as string);
  const photoUrls = (incident.photo_urls as string[] | null) ?? [];
  const photosHtml = photoUrls.length > 0
    ? photoUrls.map((url, i) => `<a href="${escapeHtml(url)}">Photo ${i + 1}</a>`).join(' &nbsp; ')
    : 'None';
  const mapsLink = incident.latitude && incident.longitude
    ? `<a href="https://www.google.com/maps?q=${incident.latitude},${incident.longitude}">View on Map</a>`
    : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
      <div style="background: #0a1628; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Incident Report</h1>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 130px;">Type</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(type)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Observed</td><td style="padding: 8px 0;">${formatDate(incident.observed_at as string)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Coordinates</td><td style="padding: 8px 0;">${formatCoords(incident.latitude as number, incident.longitude as number)} ${mapsLink}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Reporter</td><td style="padding: 8px 0;">${escapeHtml(incident.contact_name as string) || 'Anonymous'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${escapeHtml(incident.contact_email as string) || 'Not provided'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Photos</td><td style="padding: 8px 0;">${photosHtml}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 6px;">
          <p style="margin: 0; color: #334155; white-space: pre-wrap;">${escapeHtml(incident.description as string)}</p>
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <a href="https://www.reportthereef.com/admin/incidents" style="display: inline-block; background: #0a1628; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">View in Admin Dashboard</a>
        </div>
      </div>
    </div>
  `.trim();
}

export function buildWildlifeEmailHtml(sighting: Record<string, unknown>): string {
  const photoUrl = sighting.photo_url as string | null;
  const photoHtml = photoUrl
    ? `<a href="${escapeHtml(photoUrl)}">View Photo</a>`
    : 'None';
  const mapsLink = sighting.latitude && sighting.longitude
    ? `<a href="https://www.google.com/maps?q=${sighting.latitude},${sighting.longitude}">View on Map</a>`
    : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
      <div style="background: #0a1628; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Wildlife Sighting</h1>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 130px;">Species</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(sighting.species as string)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Count</td><td style="padding: 8px 0;">${sighting.count ?? 'Not specified'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Sighted</td><td style="padding: 8px 0;">${formatDate(sighting.sighted_at as string)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Location</td><td style="padding: 8px 0;">${escapeHtml(sighting.location_name as string) || 'Not specified'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Coordinates</td><td style="padding: 8px 0;">${formatCoords(sighting.latitude as number, sighting.longitude as number)} ${mapsLink}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Reporter</td><td style="padding: 8px 0;">${escapeHtml(sighting.reporter_name as string) || 'Anonymous'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${escapeHtml(sighting.reporter_email as string) || 'Not provided'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Photo</td><td style="padding: 8px 0;">${photoHtml}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 6px;">
          <p style="margin: 0; color: #334155; white-space: pre-wrap;">${escapeHtml(sighting.comments as string) || 'No additional comments'}</p>
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <a href="https://www.reportthereef.com/admin/sightings" style="display: inline-block; background: #0a1628; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">View in Admin Dashboard</a>
        </div>
      </div>
    </div>
  `.trim();
}
