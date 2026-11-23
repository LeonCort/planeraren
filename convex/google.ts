import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";

/*
 * Google Kalender for the signed-in person.
 * The person connects Google through Clerk (Google sign-in with calendar scopes).
 * Clerk keeps and refreshes the Google token; here we ask Clerk for a fresh one
 * and call the Calendar API with it. The token never reaches the browser.
 *
 * The answers have the same shape the planner already understood from the
 * Google Calendar connector in Claude: {calendars:[...]}, {events:[...], nextPageToken}, {event}.
 *
 * Convex env: CLERK_SECRET_KEY
 */

const API = "https://www.googleapis.com/calendar/v3";

async function googleToken(userId: string): Promise<string> {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new ConvexError({ code: "server_misconfigured", message: "CLERK_SECRET_KEY saknas i Convex" });
  const r = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}/oauth_access_tokens/oauth_google`,
    { headers: { Authorization: `Bearer ${key}` } },
  );
  if (!r.ok) throw new ConvexError({ code: "server_unavailable", status: r.status });
  const body = await r.json();
  const list = Array.isArray(body) ? body : body?.data || [];
  const tok = list.find((t: any) => t && t.token)?.token;
  if (!tok) throw new ConvexError({ code: "needs_google" });
  return tok;
}

async function g(token: string, method: string, path: string, body?: unknown) {
  const r = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return {};
  const text = await r.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  if (!r.ok) {
    const reason = json?.error?.errors?.[0]?.reason || "";
    if (r.status === 401) throw new ConvexError({ code: "needs_google" });
    if (r.status === 403 && /insufficient|scope/i.test(reason + " " + (json?.error?.message || "")))
      throw new ConvexError({ code: "needs_google" });
    if (r.status === 429 || reason === "rateLimitExceeded" || reason === "userRateLimitExceeded")
      throw new ConvexError({ code: "rate_limited", retryable: true });
    if (r.status >= 500) throw new ConvexError({ code: "server_unavailable", retryable: true });
    throw new ConvexError({ code: "tool_error", status: r.status, message: json?.error?.message || "" });
  }
  return json;
}

const enc = encodeURIComponent;
const isStr = (x: unknown): x is string => typeof x === "string" && x.length > 0;

/* start/end in Google's format: all-day events use dates, others local time + time zone */
function when(input: any) {
  const tz = isStr(input.timeZone) ? input.timeZone : "Europe/Stockholm";
  if (input.allDay) return { start: { date: String(input.startTime).slice(0, 10) }, end: { date: String(input.endTime).slice(0, 10) } };
  return { start: { dateTime: input.startTime, timeZone: tz }, end: { dateTime: input.endTime, timeZone: tz } };
}

export const call = action({
  args: { tool: v.string(), input: v.any() },
  handler: async (ctx, { tool, input }) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) throw new ConvexError({ code: "not_signed_in" });
    const token = await googleToken(id.subject);
    const i = input || {};

    switch (tool) {
      case "list_calendars": {
        const out: any[] = [];
        let pageToken: string | undefined;
        do {
          const p = await g(token, "GET", `/users/me/calendarList?maxResults=250${pageToken ? `&pageToken=${enc(pageToken)}` : ""}`);
          for (const c of p.items || [])
            out.push({
              id: c.id,
              summary: c.summaryOverride || c.summary,
              primary: !!c.primary,
              accessRole: c.accessRole,
              backgroundColor: c.backgroundColor,
              timeZone: c.timeZone,
            });
          pageToken = p.nextPageToken;
        } while (pageToken);
        return { calendars: out };
      }

      case "list_events": {
        if (!isStr(i.calendarId)) throw new ConvexError({ code: "tool_error", message: "calendarId saknas" });
        const q = new URLSearchParams({ singleEvents: "true", orderBy: "startTime", maxResults: String(Math.min(Number(i.pageSize) || 250, 2500)) });
        if (isStr(i.timeMin)) q.set("timeMin", i.timeMin);
        if (isStr(i.timeMax)) q.set("timeMax", i.timeMax);
        if (isStr(i.timeZone)) q.set("timeZone", i.timeZone);
        if (isStr(i.pageToken)) q.set("pageToken", i.pageToken);
        const p = await g(token, "GET", `/calendars/${enc(i.calendarId)}/events?${q}`);
        return { events: p.items || [], nextPageToken: p.nextPageToken || null };
      }

      case "create_event": {
        if (!isStr(i.calendarId) || !isStr(i.startTime) || !isStr(i.endTime))
          throw new ConvexError({ code: "tool_error", message: "kalender eller tid saknas" });
        const body: any = { summary: String(i.summary || "").slice(0, 300), ...when(i) };
        if (isStr(i.description)) body.description = i.description.slice(0, 2000);
        if (Array.isArray(i.recurrenceData)) body.recurrence = i.recurrenceData.filter(isStr);
        const ev = await g(token, "POST", `/calendars/${enc(i.calendarId)}/events`, body);
        return { event: ev };
      }

      case "update_event": {
        if (!isStr(i.calendarId) || !isStr(i.eventId)) throw new ConvexError({ code: "tool_error", message: "händelse saknas" });
        const body: any = {};
        if (isStr(i.summary)) body.summary = i.summary.slice(0, 300);
        if (isStr(i.description)) body.description = i.description.slice(0, 2000);
        if (isStr(i.startTime) && isStr(i.endTime)) Object.assign(body, when(i));
        const ev = await g(token, "PATCH", `/calendars/${enc(i.calendarId)}/events/${enc(i.eventId)}`, body);
        return { event: ev };
      }

      case "delete_event": {
        if (!isStr(i.calendarId) || !isStr(i.eventId)) throw new ConvexError({ code: "tool_error", message: "händelse saknas" });
        await g(token, "DELETE", `/calendars/${enc(i.calendarId)}/events/${enc(i.eventId)}`);
        return { ok: true };
      }

      default:
        throw new ConvexError({ code: "tool_error", message: `okänt verktyg ${tool}` });
    }
  },
});
