import { CommunityAuthor, foundingChipLabel } from "@/lib/communityAuthors";

/**
 * Signature d'un message : pseudo + badge à vie s'il y en a un.
 * Le badge est une reconnaissance discrète, jamais un classement.
 */
const CommunityAuthorLine = ({
  author,
  isMine,
}: {
  author?: CommunityAuthor;
  isMine?: boolean;
}) => {
  const label = foundingChipLabel(author?.foundingTier ?? null);

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-foreground">
        {isMine ? "Vous" : author?.displayName ?? "Membre"}
      </span>
      {label && (
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-foreground">
          {label}
        </span>
      )}
    </span>
  );
};

export default CommunityAuthorLine;
