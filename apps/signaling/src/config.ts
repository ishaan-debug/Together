// Runtime configuration, read once from environment variables at startup.

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${raw}": expected an integer between 1 and 65535`);
  }
  return port;
}

/** "*" allows any origin; otherwise a comma-separated list of allowed origins. */
function parseOrigins(raw: string | undefined): string | string[] {
  if (raw === undefined || raw.trim() === "" || raw.trim() === "*") return "*";
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
}

export const config = {
  port: parsePort(process.env.PORT, 5000),
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
} as const;
