import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Build absolute URL for assets (images) based on env config.
// Priority: NEXT_PUBLIC_ASSET_BASE_URL → origin of NEXT_PUBLIC_API_BASE_URL → ''
export function buildImageUrl(path) {
  if (!path) return null;
  // Already absolute
  if (/^https?:\/\//i.test(path)) return path;

  const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (assetBase) {
    return joinUrl(assetBase, path);
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    try {
      const u = new URL(apiBase);
      // Use origin (protocol + host) for serving public/storage
      const origin = `${u.protocol}//${u.host}`;
      return joinUrl(origin, path);
    } catch (_) {
      // fallthrough
    }
  }

  // Fallback: return as-is
  return path.startsWith('/') ? path : `/${path}`;
}

function joinUrl(base, p) {
  if (!base) return p;
  const a = base.replace(/\/+$/, '');
  const b = String(p).replace(/^\/+/, '');
  return `${a}/${b}`;
}
