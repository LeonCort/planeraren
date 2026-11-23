import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/*
 * One family = one shared fridge and planner.
 * The shared parts are kept in separate fields so that two parents editing
 * different things (a note on the fridge vs. the usual week) never overwrite each other.
 */
export default defineSchema({
  families: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    trackers: v.any(), // Kylskåpet: the countdown notes (birthdays, holidays, ...)
    items: v.any(), // Planeraren: own notes per day
    hl: v.any(), // Hämta & lämna: people, times, default, rules, family calendar
    lv: v.any(), // where each Google event shows (kyl / plan / hide), per event key
    createdBy: v.string(),
  }).index("by_code", ["inviteCode"]),

  members: defineTable({
    familyId: v.id("families"),
    userId: v.string(), // Clerk user id (identity.subject)
    name: v.string(),
    color: v.string(),
    prefs: v.any(), // per person: Google calendar choices, "this is me", auto-sync on/off
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),
});
