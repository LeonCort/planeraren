import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc } from "./_generated/dataModel";

const COLORS = ["c3", "c6", "c4", "c2", "c5", "c1"];

/* the days every family starts with; personal days (birthdays, school) are added by the family itself */
const SEED_TRACKERS = [
  { id: "julafton", type: "yearly", name: "Julafton", date: "2000-12-24", color: "c1" },
  { id: "nyar", type: "yearly", name: "Nyårsafton", date: "2000-12-31", color: "c5" },
  { id: "halloween", type: "yearly", name: "Halloween", date: "2000-10-31", color: "c1" },
  { id: "pask", type: "yearly", movable: "pask", name: "Påskafton", color: "c2" },
  { id: "midsommar", type: "yearly", movable: "midsommar", name: "Midsommarafton", color: "c4" },
  { id: "lordag", type: "weekly", name: "Lördag", weekday: 6, color: "c2" },
  { id: "fredag", type: "weekly", name: "Fredagsmys", weekday: 5, color: "c4" },
];

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

async function userId(ctx: QueryCtx | MutationCtx) {
  const id = await ctx.auth.getUserIdentity();
  if (!id) throw new ConvexError({ code: "not_signed_in" });
  return id.subject;
}

async function myMember(ctx: QueryCtx | MutationCtx) {
  const uid = await userId(ctx);
  return await ctx.db
    .query("members")
    .withIndex("by_user", (q) => q.eq("userId", uid))
    .first();
}

async function requireMember(ctx: QueryCtx | MutationCtx) {
  const m = await myMember(ctx);
  if (!m) throw new ConvexError({ code: "no_family" });
  return m;
}

const clean = (s: string, max = 40) => s.replace(/\s+/g, " ").trim().slice(0, max);

/** Everything the app needs at start: me, my family and its members. Null when not in a family yet. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) return null;
    const m = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", id.subject))
      .first();
    if (!m) return { member: null, family: null, members: [] };
    const family = await ctx.db.get(m.familyId);
    if (!family) return { member: null, family: null, members: [] };
    const members = await ctx.db
      .query("members")
      .withIndex("by_family", (q) => q.eq("familyId", family._id))
      .collect();
    return {
      member: m,
      family,
      members: members.map((x) => ({ _id: x._id, name: x.name, color: x.color, isMe: x._id === m._id })),
    };
  },
});

/** Look up a family by invite code, so the join screen can show its name before joining. */
export const peek = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const f = await ctx.db
      .query("families")
      .withIndex("by_code", (q) => q.eq("inviteCode", code.trim().toUpperCase()))
      .first();
    return f ? { name: f.name } : null;
  },
});

export const create = mutation({
  args: { familyName: v.string(), myName: v.string() },
  handler: async (ctx, { familyName, myName }) => {
    const uid = await userId(ctx);
    if (await myMember(ctx)) throw new ConvexError({ code: "already_in_family" });
    const name = clean(myName) || "Jag";
    const color = COLORS[0];
    const familyId = await ctx.db.insert("families", {
      name: clean(familyName) || `Familjen ${name}`,
      inviteCode: newCode(),
      trackers: SEED_TRACKERS,
      items: [],
      hl: { people: [{ n: name, a: [], c: color }], dflt: "" },
      lv: {},
      createdBy: uid,
    });
    await ctx.db.insert("members", { familyId, userId: uid, name, color, prefs: { me: name, sync: true } });
    return familyId;
  },
});

export const join = mutation({
  args: { code: v.string(), myName: v.string() },
  handler: async (ctx, { code, myName }) => {
    const uid = await userId(ctx);
    if (await myMember(ctx)) throw new ConvexError({ code: "already_in_family" });
    const family = await ctx.db
      .query("families")
      .withIndex("by_code", (q) => q.eq("inviteCode", code.trim().toUpperCase()))
      .first();
    if (!family) throw new ConvexError({ code: "bad_code" });
    const others = await ctx.db
      .query("members")
      .withIndex("by_family", (q) => q.eq("familyId", family._id))
      .collect();
    const used = new Set(others.map((o) => o.color));
    const color = COLORS.find((c) => !used.has(c)) || COLORS[others.length % COLORS.length];
    const name = clean(myName) || "Jag";
    await ctx.db.insert("members", { familyId: family._id, userId: uid, name, color, prefs: { me: name, sync: true } });
    /* the new parent becomes someone who can drop off and pick up */
    const hl = { ...(family.hl || {}) };
    const people: { n: string; a: string[]; c: string }[] = Array.isArray(hl.people) ? [...hl.people] : [];
    if (!people.some((p) => p.n.toLowerCase() === name.toLowerCase())) people.push({ n: name, a: [], c: color });
    hl.people = people;
    await ctx.db.patch(family._id, { hl });
    return family._id;
  },
});

/** Save shared family data. Only the fields sent are changed. */
export const setShared = mutation({
  args: {
    trackers: v.optional(v.any()),
    items: v.optional(v.any()),
    hl: v.optional(v.any()),
    lv: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const m = await requireMember(ctx);
    const patch: Partial<Doc<"families">> = {};
    if (args.trackers !== undefined) {
      if (!Array.isArray(args.trackers)) throw new ConvexError({ code: "bad_input" });
      patch.trackers = args.trackers.filter((t: any) => t && t.src !== "gcal").slice(0, 300);
    }
    if (args.items !== undefined) {
      if (!Array.isArray(args.items)) throw new ConvexError({ code: "bad_input" });
      patch.items = args.items.slice(-3000);
    }
    if (args.hl !== undefined) patch.hl = args.hl;
    if (args.lv !== undefined) patch.lv = args.lv;
    await ctx.db.patch(m.familyId, patch);
  },
});

/** Save my own settings (Google calendars, who I am in Hämta & lämna, auto-sync). */
export const setPrefs = mutation({
  args: { prefs: v.any() },
  handler: async (ctx, { prefs }) => {
    const m = await requireMember(ctx);
    await ctx.db.patch(m._id, { prefs: { ...(m.prefs || {}), ...(prefs || {}) } });
  },
});

export const rename = mutation({
  args: { familyName: v.optional(v.string()), myName: v.optional(v.string()) },
  handler: async (ctx, { familyName, myName }) => {
    const m = await requireMember(ctx);
    if (familyName !== undefined && clean(familyName)) await ctx.db.patch(m.familyId, { name: clean(familyName) });
    if (myName !== undefined && clean(myName)) await ctx.db.patch(m._id, { name: clean(myName) });
  },
});

export const newInviteCode = mutation({
  args: {},
  handler: async (ctx) => {
    const m = await requireMember(ctx);
    const inviteCode = newCode();
    await ctx.db.patch(m.familyId, { inviteCode });
    return inviteCode;
  },
});

/** Leave the family. The last one to leave takes the family's data with them. */
export const leave = mutation({
  args: {},
  handler: async (ctx) => {
    const m = await requireMember(ctx);
    await ctx.db.delete(m._id);
    const rest = await ctx.db
      .query("members")
      .withIndex("by_family", (q) => q.eq("familyId", m.familyId))
      .first();
    if (!rest) await ctx.db.delete(m.familyId);
  },
});
