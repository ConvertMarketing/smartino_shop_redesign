import { execSync } from 'node:child_process';

/**
 * Versiune de build pentru cache-busting la CSS/JS (?v=…). GitHub Pages trimite
 * max-age=600, deci fără asta clientul vede stiluri vechi până la 10 minute
 * după deploy. Hash-ul de commit e stabil între build-uri identice.
 */
let version = String(Date.now());
try {
  version = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || version;
} catch {}

export default { version };
