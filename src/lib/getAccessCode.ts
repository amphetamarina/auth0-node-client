import fetch from "node-fetch";

import { AuthConfig } from "../types";
import { TokenResponse } from "auth0";
import { authorizeWithBrowser } from "./authorizeWithBrowser";
import { cacheToken, checkCache } from "./cacheToken";
import { createDebugLogger, log } from "debug-logging";

/**
 * Get a new access code from Auth0.
 */
export const getAccessCode = async (
  config: AuthConfig
): Promise<TokenResponse> => {
  const DEBUG = createDebugLogger(getAccessCode);

  /**
   * First, try the cache.
   */
  const cached = await checkCache();
  if (cached) {
    DEBUG.log("Returning cached token response.");
    return cached.tokenData;
  }

  DEBUG.log("No cached token response found. Creating new session.");

  const { domain, clientId, redirectUri } = config;
  const { code, verifier } = await authorizeWithBrowser(config);

  /**
   * Create the access token request payload.
   *
   * @see https://auth0.com/docs/get-started/authentication-and-authorization-flow/call-your-api-using-the-authorization-code-flow-with-pkce#request-tokens
   */
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code_verifier: verifier,
    code: code,
    redirect_uri: redirectUri,
  });

  /**
   * Make the access token request.
   */
  const tokenResponse =
      await fetch(
        `https://${domain}/oauth/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        }
      ).then(
        (req) => req.json()
      ) as TokenResponse;

  if (tokenResponse && tokenResponse.access_token) {
    log("Logged in successfully.");
    await cacheToken(tokenResponse);
    return tokenResponse;
  } else {
    throw new Error("Auth0 TokenResponse was not valid.");
  }
};