import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listJournalEntries from "./tools/list-journal-entries";
import createJournalEntry from "./tools/create-journal-entry";
import listEmotionCheckins from "./tools/list-emotion-checkins";
import listTransformationPortraits from "./tools/list-transformation-portraits";
import getMyAmbassadorImpact from "./tools/get-my-ambassador-impact";

// The OAuth issuer MUST be the direct Supabase host, built from the project
// ref so it survives publish and stays import-safe (Vite inlines the literal
// at build time). Never derive it from SUPABASE_URL on Lovable Cloud — that
// value is the `.lovable.cloud` proxy and mcp-js rejects the mismatch.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "eclosia-mcp",
  title: "Eclosia",
  version: "0.1.0",
  instructions:
    "Tools for Eclosia (Digital Maman Libre), a wellbeing companion for women rebuilding after a storm. Each caller is a signed-in Eclosia user; all tools read and write only that user's own data (journal, emotion check-ins, monthly transformation portraits, ambassador impact). Use `create_journal_entry` when the user dictates a reflection, `list_journal_entries` / `list_emotion_checkins` / `list_transformation_portraits` to look back at their journey, and `get_my_profile` / `get_my_ambassador_impact` for account and referral information.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    listJournalEntries,
    createJournalEntry,
    listEmotionCheckins,
    listTransformationPortraits,
    getMyAmbassadorImpact,
  ],
});
