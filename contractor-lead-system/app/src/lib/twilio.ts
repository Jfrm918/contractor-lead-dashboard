/**
 * Twilio client singleton and SMS helper.
 *
 * Uses the Twilio REST API directly (no SDK dependency) to keep the
 * bundle small. Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and
 * TWILIO_PHONE_NUMBER environment variables.
 */

import { env } from "./env";

// ─── Configuration ───

function getTwilioConfig() {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const phoneNumber = env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    return null;
  }

  return { accountSid, authToken, phoneNumber };
}

/** True when all Twilio env vars are present. */
export function twilioConfigured(): boolean {
  return getTwilioConfig() !== null;
}

// ─── Send SMS ───

export interface SendSmsResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Send an SMS via the Twilio Messages API.
 * Returns a result object — never throws.
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<SendSmsResult> {
  const config = getTwilioConfig();
  if (!config) {
    return { success: false, error: "Twilio is not configured" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.set("To", to);
  params.set("From", config.phoneNumber);
  params.set("Body", body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
            "base64",
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const json = await res.json();

    if (!res.ok) {
      const errMsg =
        (json as { message?: string }).message ?? `HTTP ${res.status}`;
      console.error("[Twilio SMS] Send failed:", errMsg);
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      messageSid: (json as { sid?: string }).sid,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Twilio SMS] Network error:", msg);
    return { success: false, error: msg };
  }
}

// ─── Verify credentials ───

/**
 * Ping the Twilio API to check whether the configured credentials are valid.
 * Returns true if the account is reachable, false otherwise.
 */
export async function verifyTwilioCredentials(): Promise<boolean> {
  const config = getTwilioConfig();
  if (!config) return false;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}.json`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
              "base64",
            ),
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
