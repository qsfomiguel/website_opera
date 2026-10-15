import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every public page is force-dynamic and reads straight from Postgres, so no
// incremental cache (R2/KV) is configured.
export default defineCloudflareConfig({});
