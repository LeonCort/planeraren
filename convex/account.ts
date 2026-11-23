import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { ConvexError } from "convex/values";

/*
 * Delete my account: leave the family (the last one out takes the family's data),
 * then remove the sign-in and the Google connection at Clerk.
 * Done on the server so it does not depend on a fresh sign-in in the browser.
 *
 * Convex env: CLERK_SECRET_KEY
 */
export const deleteMe = action({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) throw new ConvexError({ code: "not_signed_in" });
    const key = process.env.CLERK_SECRET_KEY;
    if (!key) throw new ConvexError({ code: "server_misconfigured", message: "CLERK_SECRET_KEY saknas i Convex" });
    try {
      await ctx.runMutation(api.families.leave, {});
    } catch (e) {
      /* not in a family any more: nothing to leave */
      if (!(e instanceof ConvexError)) throw e;
    }
    const r = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(id.subject)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok && r.status !== 404) throw new ConvexError({ code: "server_unavailable", status: r.status });
    return null;
  },
});
