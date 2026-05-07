// Catalogue LSF v1 — 4 thèmes, 5–8 fiches chacun.
// Illustrations IA stockées dans src/assets/lsf/<key>.jpg, importées en ES6.

import bebeManger from "@/assets/lsf/bebe-manger.jpg";
import bebeBoire from "@/assets/lsf/bebe-boire.jpg";
import bebeDormir from "@/assets/lsf/bebe-dormir.jpg";
import bebeEncore from "@/assets/lsf/bebe-encore.jpg";
import bebeFini from "@/assets/lsf/bebe-fini.jpg";
import bebeDoudou from "@/assets/lsf/bebe-doudou.jpg";
import bebeCouche from "@/assets/lsf/bebe-couche.jpg";
import emoContent from "@/assets/lsf/emo-content.jpg";
import emoTriste from "@/assets/lsf/emo-triste.jpg";
import emoColere from "@/assets/lsf/emo-colere.jpg";
import emoPeur from "@/assets/lsf/emo-peur.jpg";
import emoCalme from "@/assets/lsf/emo-calme.jpg";
import emoAime from "@/assets/lsf/emo-aime.jpg";
import rouBonjour from "@/assets/lsf/rou-bonjour.jpg";
import rouMerci from "@/assets/lsf/rou-merci.jpg";
import rouBain from "@/assets/lsf/rou-bain.jpg";
import rouJouer from "@/assets/lsf/rou-jouer.jpg";
import rouLivre from "@/assets/lsf/rou-livre.jpg";
import rouDehors from "@/assets/lsf/rou-dehors.jpg";
import rouEcole from "@/assets/lsf/rou-ecole.jpg";
import famMaman from "@/assets/lsf/fam-maman.jpg";
import famPapa from "@/assets/lsf/fam-papa.jpg";
import famFrere from "@/assets/lsf/fam-frere.jpg";
import famSoeur from "@/assets/lsf/fam-soeur.jpg";
import famGrandParent from "@/assets/lsf/fam-grand-parent.jpg";
import famAmi from "@/assets/lsf/fam-ami.jpg";

export type LsfSign = {
  /** Clé stable utilisée comme identifiant en base (lsf_progress.sign_key) */
  key: string;
  /** Mot ou expression signée */
  label: string;
  /** Description du geste, en 1 phrase */
  gesture: string;
  /** Emoji de secours / décoration */
  emoji: string;
  /** Illustration IA importée depuis src/assets/lsf/<key>.jpg */
  image: string;
};

export type LsfTheme = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  signs: LsfSign[];
};

export const LSF_THEMES: LsfTheme[] = [
  {
    slug: "bebe-besoins",
    title: "Bébé & besoins",
    description: "Les premiers signes du quotidien pour comprendre ce dont votre enfant a besoin.",
    emoji: "🍼",
    signs: [
      { key: "bebe-manger", label: "Manger", gesture: "Main plate, doigts joints, qui se porte vers la bouche.", emoji: "🍽️", image: bebeManger },
      { key: "bebe-boire", label: "Boire", gesture: "Main en forme de C qui s'incline vers la bouche, comme un verre.", emoji: "🥤", image: bebeBoire },
      { key: "bebe-dormir", label: "Dormir", gesture: "Main posée à plat contre la joue, tête légèrement inclinée.", emoji: "😴", image: bebeDormir },
      { key: "bebe-encore", label: "Encore", gesture: "Bouts des doigts joints qui se touchent deux fois.", emoji: "🔁", image: bebeEncore },
      { key: "bebe-fini", label: "Fini", gesture: "Mains ouvertes, paumes vers le bas, qui s'écartent.", emoji: "✅", image: bebeFini },
      { key: "bebe-doudou", label: "Doudou", gesture: "Mains croisées sur la poitrine en câlin doux.", emoji: "🧸", image: bebeDoudou },
      { key: "bebe-couche", label: "Couche", gesture: "Mains en pince qui tapotent légèrement le bas du ventre.", emoji: "👶", image: bebeCouche },
    ],
  },
  {
    slug: "emotions",
    title: "Émotions",
    description: "Mettre des mots sur ce que ressent l'enfant — et ce que vous ressentez aussi.",
    emoji: "💗",
    signs: [
      { key: "emo-content", label: "Content", gesture: "Main qui remonte le long du torse en remontant le sourire.", emoji: "😊", image: emoContent },
      { key: "emo-triste", label: "Triste", gesture: "Doigts qui descendent doucement le long des joues.", emoji: "😢", image: emoTriste },
      { key: "emo-colere", label: "Colère", gesture: "Main en griffe qui se referme devant la poitrine.", emoji: "😠", image: emoColere },
      { key: "emo-peur", label: "Peur", gesture: "Mains ouvertes qui viennent se rapprocher de la poitrine.", emoji: "😨", image: emoPeur },
      { key: "emo-calme", label: "Calme", gesture: "Mains à plat qui descendent lentement devant le buste.", emoji: "🌿", image: emoCalme },
      { key: "emo-aime", label: "J'aime / amour", gesture: "Mains croisées sur le cœur.", emoji: "❤️", image: emoAime },
    ],
  },
  {
    slug: "routine",
    title: "Routine quotidienne",
    description: "Les signes pour rythmer la journée et anticiper les transitions.",
    emoji: "☀️",
    signs: [
      { key: "rou-bonjour", label: "Bonjour", gesture: "Main ouverte qui part du front vers l'avant.", emoji: "👋" },
      { key: "rou-merci", label: "Merci", gesture: "Bouts des doigts qui partent du menton vers l'avant.", emoji: "🙏" },
      { key: "rou-bain", label: "Bain", gesture: "Mains poings fermés qui frottent le torse.", emoji: "🛁" },
      { key: "rou-jouer", label: "Jouer", gesture: "Mains en Y qui s'agitent doucement.", emoji: "🧩" },
      { key: "rou-livre", label: "Livre", gesture: "Mains à plat, paumes face à face, qui s'ouvrent comme un livre.", emoji: "📖" },
      { key: "rou-dehors", label: "Dehors / promenade", gesture: "Main qui désigne l'extérieur puis fait un mouvement de marche.", emoji: "🚶" },
      { key: "rou-ecole", label: "École", gesture: "Mains à plat qui se tapent doucement comme un cahier qu'on ouvre.", emoji: "🏫" },
    ],
  },
  {
    slug: "famille",
    title: "Famille & entourage",
    description: "Nommer les personnes qui comptent dans la vie de l'enfant.",
    emoji: "👨‍👩‍👧",
    signs: [
      { key: "fam-maman", label: "Maman", gesture: "Bout des doigts qui touchent la joue, légère caresse.", emoji: "👩" },
      { key: "fam-papa", label: "Papa", gesture: "Pouce qui touche le front (variante : la tempe).", emoji: "👨" },
      { key: "fam-frere", label: "Frère", gesture: "Index pointé vers le menton puis qui se joint à l'autre index.", emoji: "🧒" },
      { key: "fam-soeur", label: "Sœur", gesture: "Index qui suit la mâchoire puis se joint à l'autre index.", emoji: "👧" },
      { key: "fam-grand-parent", label: "Grand-parent", gesture: "Main qui descend du menton en mimant une barbe ou des cheveux.", emoji: "👴" },
      { key: "fam-ami", label: "Ami", gesture: "Index crochetés l'un dans l'autre, à hauteur de poitrine.", emoji: "🤝" },
    ],
  },
];

export const ALL_LSF_SIGNS = LSF_THEMES.flatMap((t) => t.signs.map((s) => ({ ...s, themeSlug: t.slug })));

export function getThemeBySlug(slug: string) {
  return LSF_THEMES.find((t) => t.slug === slug) ?? null;
}
