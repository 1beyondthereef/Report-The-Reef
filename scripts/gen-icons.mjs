/**
 * gen-icons.mjs — Regenerate all brand-derived image assets from the source logos.
 *
 * Sources (committed in public/logos/):
 *   - icon-mark.svg   : icon-only mark (Logo 05) — white art on transparent; composited
 *                       on #0a1628 here for the favicon + apple-touch-icon
 *   - app-icon.png    : square-ish icon art (padded to a square #0a1628 canvas here) —
 *                       still used for the PWA manifest icons + iOS app icon
 *   - splash-logo.png : vertical stacked logo + tagline (for iOS splash)
 *   - banner-logo.svg : horizontal logo + tagline (rasterized to PNG for email)
 *
 * Usage:
 *   node scripts/gen-icons.mjs
 *
 * Re-run this whenever the brand assets change. Requires devDeps: sharp, png-to-ico.
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...parts) => resolve(ROOT, ...parts);

const NAVY = "#0a1628";
const ICON_MARK_SRC = p("public/logos/icon-mark.svg");
const APP_ICON_SRC = p("public/logos/app-icon.png");
const SPLASH_SRC = p("public/logos/splash-logo.png");
const BANNER_SRC = p("public/logos/banner-logo.svg");

/** Rasterize an SVG (white art on transparent) onto a square #0a1628 canvas at `size`. */
async function svgToNavyPng(svgPath, size) {
  const svg = await readFile(svgPath);
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: NAVY })
    .flatten({ background: NAVY })
    .png()
    .toBuffer();
}

/** Pad the source icon onto a centered square #0a1628 canvas, return a Buffer at `size`. */
async function squareIcon(size) {
  const meta = await sharp(APP_ICON_SRC).metadata();
  const side = Math.max(meta.width, meta.height);
  const squared = await sharp(APP_ICON_SRC)
    .resize(side, side, { fit: "contain", background: NAVY })
    .flatten({ background: NAVY })
    .png()
    .toBuffer();
  return sharp(squared).resize(size, size, { fit: "cover" }).png().toBuffer();
}

async function writePng(buf, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buf);
  console.log("wrote", outPath.replace(ROOT + "/", ""));
}

async function main() {
  // --- Favicons + apple-touch-icon (from icon-mark.svg / Logo 05, on navy) ---
  await writePng(await svgToNavyPng(ICON_MARK_SRC, 16), p("public/favicon-16.png"));
  await writePng(await svgToNavyPng(ICON_MARK_SRC, 32), p("public/favicon-32.png"));
  await writePng(await svgToNavyPng(ICON_MARK_SRC, 180), p("public/apple-touch-icon.png"));
  const ico = await pngToIco([
    await svgToNavyPng(ICON_MARK_SRC, 16),
    await svgToNavyPng(ICON_MARK_SRC, 32),
    await svgToNavyPng(ICON_MARK_SRC, 48),
  ]);
  await writePng(ico, p("public/favicon.ico"));

  // --- PWA manifest icons in place (Step 5) ---
  for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
    await writePng(await squareIcon(size), p(`public/icons/icon-${size}x${size}.png`));
  }

  // --- iOS app icon 1024 (Step 7) ---
  await writePng(await squareIcon(1024), p("ios/App/App/Assets.xcassets/AppIcon.appiconset/app-icon-1024.png"));

  // --- iOS splash 2732x2732, logo centered on navy (Step 6) ---
  const SPLASH = 2732;
  const logoTarget = Math.round(SPLASH * 0.42); // splash-logo is tall; constrain by height
  const logo = await sharp(SPLASH_SRC)
    .resize({ height: logoTarget, fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();
  const splash = await sharp({
    create: { width: SPLASH, height: SPLASH, channels: 4, background: NAVY },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
  for (const name of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) {
    await writePng(splash, p("ios/App/App/Assets.xcassets/Splash.imageset", name));
  }

  // --- Email banner PNG (Step 8) ---
  const bannerSvg = await readFile(BANNER_SRC);
  const banner = await sharp(bannerSvg, { density: 300 })
    .resize({ width: 880, fit: "inside" }) // ~440px display @2x
    .png()
    .toBuffer();
  await writePng(banner, p("public/logos/banner-logo.png"));

  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
