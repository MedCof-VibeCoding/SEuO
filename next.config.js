/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["better-sqlite3"],
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/inicio",
        destination: "/",
        permanent: true,
      },
      {
        source: "/posicionamento-google",
        destination: "/google-position-checker",
        permanent: true,
      },
      {
        source: "/posicionamento-google/:path*",
        destination: "/google-position-checker",
        permanent: true,
      },
      {
        source: "/optimize",
        destination: "/",
        permanent: true,
      },
      {
        source: "/optimize/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/briefing",
        destination: "/",
        permanent: true,
      },
      {
        source: "/briefing/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default config;
