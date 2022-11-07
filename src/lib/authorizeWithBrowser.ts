/* eslint-disable no-console */

import open from "open";

import { AuthConfig, AuthorizationProof } from "../types";
import { createServer } from "http";
import { getAuthorizationUrl } from "./getAuthorizationUrl";

/**
 * Get an authorization code using the browser.
 */
export const authorizeWithBrowser = async (
  config: AuthConfig
): Promise<AuthorizationProof> => {
  const { authorizationUrl, verifier } = await getAuthorizationUrl(config);
  /**
   * Open the page and get the callback URL.
   */
  const code = await new Promise<string>(async (resolve) => {
    const server = createServer((req, res) => {
      res.end("<html><body><script>window.close()</script></body></html>");
      req.socket.destroy();
      server.close();

      if (!req.url) {
        return;
      }

      const searchParams = new URLSearchParams(req.url.replace(/^\//, ""));
      const code = searchParams.get("code");

      if (code) {
        server.close(() => resolve(code));
      }
    });

    process.on("exit", () => server.close());
    server.listen(42069);

    console.group();
    console.log();
    console.log("Opening browser for login. Manually visit the link below if it doesn't open:");
    console.log();
    console.log(authorizationUrl);
    console.log();
    console.groupEnd();

    await open(authorizationUrl);
  });

  return { code, verifier };
};