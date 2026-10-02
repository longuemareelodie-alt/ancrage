import { supabase } from "@/integrations/supabase/client";

/** Photos personnalisées par enfant → { picto_key: signedUrl }. Bucket privé, URLs temporaires. */
export async function loadChildPhotos(profileId: string): Promise<Record<string, string>> {
  const { data } = await supabase.from("child_picto_photos").select("picto_key, storage_path").eq("profile_id", profileId);
  if (!data?.length) return {};
  const { data: signed } = await supabase.storage.from("child-photos").createSignedUrls(data.map((d) => d.storage_path), 3600);
  const out: Record<string, string> = {};
  data.forEach((d, i) => {
    const url = signed?.[i]?.signedUrl;
    if (url) out[d.picto_key] = url;
  });
  return out;
}

export async function setChildPhoto(profileId: string, pictoKey: string, file: File) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("auth");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${uid}/${profileId}/${pictoKey.replace(/[^a-z0-9-]/gi, "_")}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("child-photos").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data: old } = await supabase.from("child_picto_photos").select("storage_path").eq("profile_id", profileId).eq("picto_key", pictoKey).maybeSingle();
  const { error: e2 } = await supabase
    .from("child_picto_photos")
    .upsert({ user_id: uid, profile_id: profileId, picto_key: pictoKey, storage_path: path }, { onConflict: "profile_id,picto_key" });
  if (e2) throw e2;
  if (old?.storage_path) await supabase.storage.from("child-photos").remove([old.storage_path]);
}

export async function removeChildPhoto(profileId: string, pictoKey: string) {
  const { data: old } = await supabase.from("child_picto_photos").select("storage_path").eq("profile_id", profileId).eq("picto_key", pictoKey).maybeSingle();
  await supabase.from("child_picto_photos").delete().eq("profile_id", profileId).eq("picto_key", pictoKey);
  if (old?.storage_path) await supabase.storage.from("child-photos").remove([old.storage_path]);
}
