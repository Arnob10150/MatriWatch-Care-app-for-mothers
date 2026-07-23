// The Vercel entrypoint loads the built Express app after `pnpm run build`.
// TypeScript checks this source file before that generated .mjs has types.
// @ts-expect-error generated build artifact
import app from "../dist/app.mjs";

/**
 * Vercel serverless entrypoint.
 *
 * Vercel invokes an exported handler per request rather than running a
 * long-lived process, so this exports the Express app directly instead of
 * calling app.listen(). An Express app is itself a (req, res) function, so
 * it satisfies the Node handler signature Vercel expects.
 *
 * src/index.ts remains the entrypoint for local dev and for any
 * container-based deployment, where app.listen() is correct.
 */
export default app;
