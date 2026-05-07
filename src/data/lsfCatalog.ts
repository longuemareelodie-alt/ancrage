// Catalogue LSF v2 — 4 thèmes, ~26 fiches chacun (existants + 20 nouveaux par thème).
// Illustrations IA stockées dans src/assets/lsf/<key>.jpg, importées en ES6.
// La progression utilisateur (lsf_progress.sign_key) est préservée : les clés existantes sont inchangées.

import bebeManger from "@/assets/lsf/bebe-manger.jpg";
import bebeBoire from "@/assets/lsf/bebe-boire.jpg";
import bebeDormir from "@/assets/lsf/bebe-dormir.jpg";
import bebeEncore from "@/assets/lsf/bebe-encore.jpg";
import bebeFini from "@/assets/lsf/bebe-fini.jpg";
import bebeDoudou from "@/assets/lsf/bebe-doudou.jpg";
import bebeCouche from "@/assets/lsf/bebe-couche.jpg";
import bebeFaim from "@/assets/lsf/bebe-faim.jpg";
import bebeSoif from "@/assets/lsf/bebe-soif.jpg";
import bebeNon from "@/assets/lsf/bebe-non.jpg";
import bebeOui from "@/assets/lsf/bebe-oui.jpg";
import bebeAide from "@/assets/lsf/bebe-aide.jpg";
import bebeAttendre from "@/assets/lsf/bebe-attendre.jpg";
import bebeBras from "@/assets/lsf/bebe-bras.jpg";
import bebeFroid from "@/assets/lsf/bebe-froid.jpg";
import bebeChaud from "@/assets/lsf/bebe-chaud.jpg";
import bebeMal from "@/assets/lsf/bebe-mal.jpg";
import bebeTetine from "@/assets/lsf/bebe-tetine.jpg";
import bebeBiberon from "@/assets/lsf/bebe-biberon.jpg";
import bebeChanger from "@/assets/lsf/bebe-changer.jpg";
import bebePleurer from "@/assets/lsf/bebe-pleurer.jpg";
import bebeBisou from "@/assets/lsf/bebe-bisou.jpg";
import bebeCacher from "@/assets/lsf/bebe-cacher.jpg";
import bebeRegarder from "@/assets/lsf/bebe-regarder.jpg";
import bebeEcouter from "@/assets/lsf/bebe-ecouter.jpg";
import bebeToucher from "@/assets/lsf/bebe-toucher.jpg";
import bebePropre from "@/assets/lsf/bebe-propre.jpg";
import emoContent from "@/assets/lsf/emo-content.jpg";
import emoTriste from "@/assets/lsf/emo-triste.jpg";
import emoColere from "@/assets/lsf/emo-colere.jpg";
import emoPeur from "@/assets/lsf/emo-peur.jpg";
import emoCalme from "@/assets/lsf/emo-calme.jpg";
import emoAime from "@/assets/lsf/emo-aime.jpg";
import emoSurpris from "@/assets/lsf/emo-surpris.jpg";
import emoFatigue from "@/assets/lsf/emo-fatigue.jpg";
import emoFier from "@/assets/lsf/emo-fier.jpg";
import emoHonte from "@/assets/lsf/emo-honte.jpg";
import emoJaloux from "@/assets/lsf/emo-jaloux.jpg";
import emoGentil from "@/assets/lsf/emo-gentil.jpg";
import emoMechant from "@/assets/lsf/emo-mechant.jpg";
import emoSeul from "@/assets/lsf/emo-seul.jpg";
import emoEnnuyer from "@/assets/lsf/emo-ennuyer.jpg";
import emoRire from "@/assets/lsf/emo-rire.jpg";
import emoStress from "@/assets/lsf/emo-stress.jpg";
import emoConfiance from "@/assets/lsf/emo-confiance.jpg";
import emoCourage from "@/assets/lsf/emo-courage.jpg";
import emoDoux from "@/assets/lsf/emo-doux.jpg";
import emoFrustre from "@/assets/lsf/emo-frustre.jpg";
import emoDecu from "@/assets/lsf/emo-decu.jpg";
import emoExcite from "@/assets/lsf/emo-excite.jpg";
import emoTimide from "@/assets/lsf/emo-timide.jpg";
import emoRassure from "@/assets/lsf/emo-rassure.jpg";
import emoFache from "@/assets/lsf/emo-fache.jpg";
import rouBonjour from "@/assets/lsf/rou-bonjour.jpg";
import rouMerci from "@/assets/lsf/rou-merci.jpg";
import rouBain from "@/assets/lsf/rou-bain.jpg";
import rouJouer from "@/assets/lsf/rou-jouer.jpg";
import rouLivre from "@/assets/lsf/rou-livre.jpg";
import rouDehors from "@/assets/lsf/rou-dehors.jpg";
import rouEcole from "@/assets/lsf/rou-ecole.jpg";
import rouAurevoir from "@/assets/lsf/rou-aurevoir.jpg";
import rouPardon from "@/assets/lsf/rou-pardon.jpg";
import rouSvp from "@/assets/lsf/rou-svp.jpg";
import rouBonneNuit from "@/assets/lsf/rou-bonne-nuit.jpg";
import rouReveiller from "@/assets/lsf/rou-reveiller.jpg";
import rouBrossage from "@/assets/lsf/rou-brossage.jpg";
import rouHabiller from "@/assets/lsf/rou-habiller.jpg";
import rouLaver from "@/assets/lsf/rou-laver.jpg";
import rouCuisiner from "@/assets/lsf/rou-cuisiner.jpg";
import rouDanser from "@/assets/lsf/rou-danser.jpg";
import rouChanter from "@/assets/lsf/rou-chanter.jpg";
import rouMusique from "@/assets/lsf/rou-musique.jpg";
import rouTelevision from "@/assets/lsf/rou-television.jpg";
import rouVoiture from "@/assets/lsf/rou-voiture.jpg";
import rouTrain from "@/assets/lsf/rou-train.jpg";
import rouParc from "@/assets/lsf/rou-parc.jpg";
import rouMagasin from "@/assets/lsf/rou-magasin.jpg";
import rouPluie from "@/assets/lsf/rou-pluie.jpg";
import rouSoleil from "@/assets/lsf/rou-soleil.jpg";
import rouNeige from "@/assets/lsf/rou-neige.jpg";
import famMaman from "@/assets/lsf/fam-maman.jpg";
import famPapa from "@/assets/lsf/fam-papa.jpg";
import famFrere from "@/assets/lsf/fam-frere.jpg";
import famSoeur from "@/assets/lsf/fam-soeur.jpg";
import famGrandParent from "@/assets/lsf/fam-grand-parent.jpg";
import famAmi from "@/assets/lsf/fam-ami.jpg";
import famBebe from "@/assets/lsf/fam-bebe.jpg";
import famEnfant from "@/assets/lsf/fam-enfant.jpg";
import famFille from "@/assets/lsf/fam-fille.jpg";
import famGarcon from "@/assets/lsf/fam-garcon.jpg";
import famTata from "@/assets/lsf/fam-tata.jpg";
import famTonton from "@/assets/lsf/fam-tonton.jpg";
import famCousin from "@/assets/lsf/fam-cousin.jpg";
import famCousine from "@/assets/lsf/fam-cousine.jpg";
import famMamie from "@/assets/lsf/fam-mamie.jpg";
import famPapi from "@/assets/lsf/fam-papi.jpg";
import famFamille from "@/assets/lsf/fam-famille.jpg";
import famVoisin from "@/assets/lsf/fam-voisin.jpg";
import famMaitresse from "@/assets/lsf/fam-maitresse.jpg";
import famDocteur from "@/assets/lsf/fam-docteur.jpg";
import famNounou from "@/assets/lsf/fam-nounou.jpg";
import famCopain from "@/assets/lsf/fam-copain.jpg";
import famCopine from "@/assets/lsf/fam-copine.jpg";
import famAdulte from "@/assets/lsf/fam-adulte.jpg";
import famEquipe from "@/assets/lsf/fam-equipe.jpg";
import famVoisine from "@/assets/lsf/fam-voisine.jpg";

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
      { key: "bebe-faim", label: "Faim", gesture: "Main qui frotte le ventre en cercle.", emoji: "🍼", image: bebeFaim },
      { key: "bebe-soif", label: "Soif", gesture: "Index qui descend le long de la gorge.", emoji: "💧", image: bebeSoif },
      { key: "bebe-non", label: "Non", gesture: "Index et majeur qui se referment sur le pouce, comme une bouche qui dit non.", emoji: "🚫", image: bebeNon },
      { key: "bebe-oui", label: "Oui", gesture: "Poing fermé qui hoche doucement de haut en bas.", emoji: "👍", image: bebeOui },
      { key: "bebe-aide", label: "Aide", gesture: "Main posée à plat sur l'autre poing fermé, qui se soulèvent ensemble.", emoji: "🙋", image: bebeAide },
      { key: "bebe-attendre", label: "Attendre", gesture: "Mains paumes vers le haut, doigts qui s'agitent doucement.", emoji: "⏳", image: bebeAttendre },
      { key: "bebe-bras", label: "Dans les bras", gesture: "Bras croisés en berceau qui se balancent.", emoji: "🤱", image: bebeBras },
      { key: "bebe-froid", label: "Froid", gesture: "Mains poings fermés qui tremblent près des épaules.", emoji: "🥶", image: bebeFroid },
      { key: "bebe-chaud", label: "Chaud", gesture: "Main en griffe devant la bouche qui s'éloigne en s'ouvrant.", emoji: "🥵", image: bebeChaud },
      { key: "bebe-mal", label: "Mal / douleur", gesture: "Index pointés l'un vers l'autre qui se touchent à l'endroit qui fait mal.", emoji: "🤕", image: bebeMal },
      { key: "bebe-tetine", label: "Tétine", gesture: "Pouce qui touche les lèvres, comme tenir une tétine.", emoji: "🍭", image: bebeTetine },
      { key: "bebe-biberon", label: "Biberon", gesture: "Main en C inversé qui s'incline vers la bouche.", emoji: "🍼", image: bebeBiberon },
      { key: "bebe-changer", label: "Changer la couche", gesture: "Mains à plat qui mime un retournement devant le bas-ventre.", emoji: "🧷", image: bebeChanger },
      { key: "bebe-pleurer", label: "Pleurer", gesture: "Index qui descendent doucement des yeux le long des joues.", emoji: "😭", image: bebePleurer },
      { key: "bebe-bisou", label: "Bisou", gesture: "Bouts des doigts qui touchent les lèvres puis s'envolent.", emoji: "😘", image: bebeBisou },
      { key: "bebe-cacher", label: "Cacher / coucou", gesture: "Mains à plat devant le visage qui s'écartent vivement.", emoji: "🙈", image: bebeCacher },
      { key: "bebe-regarder", label: "Regarder", gesture: "Index et majeur en V qui partent des yeux vers l'avant.", emoji: "👀", image: bebeRegarder },
      { key: "bebe-ecouter", label: "Écouter", gesture: "Main en coupe portée près de l'oreille.", emoji: "👂", image: bebeEcouter },
      { key: "bebe-toucher", label: "Toucher", gesture: "Index qui vient effleurer doucement le dos de l'autre main.", emoji: "✋", image: bebeToucher },
      { key: "bebe-propre", label: "Propre", gesture: "Main à plat qui balaye la paume de l'autre main.", emoji: "🧼", image: bebePropre },
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
      { key: "emo-surpris", label: "Surpris", gesture: "Mains ouvertes qui s'écartent vivement devant la poitrine, sourcils levés.", emoji: "😮", image: emoSurpris },
      { key: "emo-fatigue", label: "Fatigué", gesture: "Mains à plat qui glissent vers le bas le long du buste.", emoji: "😪", image: emoFatigue },
      { key: "emo-fier", label: "Fier", gesture: "Pouce qui remonte le long du torse, menton relevé.", emoji: "😌", image: emoFier },
      { key: "emo-honte", label: "Honte", gesture: "Dos de la main qui frotte la joue vers le bas.", emoji: "😳", image: emoHonte },
      { key: "emo-jaloux", label: "Jaloux", gesture: "Petit doigt crochu qui tire doucement le coin de la bouche.", emoji: "😒", image: emoJaloux },
      { key: "emo-gentil", label: "Gentil", gesture: "Main à plat qui caresse doucement l'autre main.", emoji: "🤗", image: emoGentil },
      { key: "emo-mechant", label: "Méchant", gesture: "Main en griffe qui s'agite devant le visage avec air contrarié.", emoji: "😤", image: emoMechant },
      { key: "emo-seul", label: "Seul", gesture: "Index dressé qui se déplace lentement devant le buste.", emoji: "🧍", image: emoSeul },
      { key: "emo-ennuyer", label: "S'ennuyer", gesture: "Index qui tourne lentement près de la tempe.", emoji: "🥱", image: emoEnnuyer },
      { key: "emo-rire", label: "Rire", gesture: "Mains ouvertes qui s'agitent près des joues, large sourire.", emoji: "😄", image: emoRire },
      { key: "emo-stress", label: "Stress", gesture: "Mains en griffe qui se tendent devant la poitrine.", emoji: "😰", image: emoStress },
      { key: "emo-confiance", label: "Confiance", gesture: "Mains qui s'emboîtent paume contre paume devant le cœur.", emoji: "🤝", image: emoConfiance },
      { key: "emo-courage", label: "Courage", gesture: "Poing fermé qui frappe doucement la poitrine.", emoji: "💪", image: emoCourage },
      { key: "emo-doux", label: "Doux", gesture: "Bouts des doigts qui caressent lentement le dos de l'autre main.", emoji: "🪶", image: emoDoux },
      { key: "emo-frustre", label: "Frustré", gesture: "Mains poings fermés qui descendent le long du corps.", emoji: "😣", image: emoFrustre },
      { key: "emo-decu", label: "Déçu", gesture: "Index qui glisse du nez vers le bas.", emoji: "😞", image: emoDecu },
      { key: "emo-excite", label: "Excité", gesture: "Mains ouvertes qui s'agitent vivement de chaque côté du buste.", emoji: "🤩", image: emoExcite },
      { key: "emo-timide", label: "Timide", gesture: "Main qui cache à moitié le visage, regard baissé.", emoji: "😊", image: emoTimide },
      { key: "emo-rassure", label: "Rassuré", gesture: "Main à plat qui descend lentement sur la poitrine, en respirant.", emoji: "😌", image: emoRassure },
      { key: "emo-fache", label: "Fâché", gesture: "Sourcils froncés, main en griffe devant le front qui se referme.", emoji: "😡", image: emoFache },
    ],
  },
  {
    slug: "routine",
    title: "Routine quotidienne",
    description: "Les signes pour rythmer la journée et anticiper les transitions.",
    emoji: "☀️",
    signs: [
      { key: "rou-bonjour", label: "Bonjour", gesture: "Main ouverte qui part du front vers l'avant.", emoji: "👋", image: rouBonjour },
      { key: "rou-merci", label: "Merci", gesture: "Bouts des doigts qui partent du menton vers l'avant.", emoji: "🙏", image: rouMerci },
      { key: "rou-bain", label: "Bain", gesture: "Mains poings fermés qui frottent le torse.", emoji: "🛁", image: rouBain },
      { key: "rou-jouer", label: "Jouer", gesture: "Mains en Y qui s'agitent doucement.", emoji: "🧩", image: rouJouer },
      { key: "rou-livre", label: "Livre", gesture: "Mains à plat, paumes face à face, qui s'ouvrent comme un livre.", emoji: "📖", image: rouLivre },
      { key: "rou-dehors", label: "Dehors / promenade", gesture: "Main qui désigne l'extérieur puis fait un mouvement de marche.", emoji: "🚶", image: rouDehors },
      { key: "rou-ecole", label: "École", gesture: "Mains à plat qui se tapent doucement comme un cahier qu'on ouvre.", emoji: "🏫", image: rouEcole },
      { key: "rou-aurevoir", label: "Au revoir", gesture: "Main ouverte qui s'agite sur le côté.", emoji: "👋", image: rouAurevoir },
      { key: "rou-pardon", label: "Pardon", gesture: "Poing fermé qui tourne en cercle sur la poitrine.", emoji: "🙏", image: rouPardon },
      { key: "rou-svp", label: "S'il te plaît", gesture: "Main à plat qui tourne en cercle sur la poitrine.", emoji: "🤲", image: rouSvp },
      { key: "rou-bonne-nuit", label: "Bonne nuit", gesture: "Main à plat qui descend devant le visage comme un voile.", emoji: "🌙", image: rouBonneNuit },
      { key: "rou-reveiller", label: "Se réveiller", gesture: "Index et pouce écartés près des yeux qui s'ouvrent vivement.", emoji: "⏰", image: rouReveiller },
      { key: "rou-brossage", label: "Brosser les dents", gesture: "Index qui frotte horizontalement devant les dents.", emoji: "🪥", image: rouBrossage },
      { key: "rou-habiller", label: "S'habiller", gesture: "Mains à plat qui descendent le long du buste.", emoji: "👕", image: rouHabiller },
      { key: "rou-laver", label: "Se laver les mains", gesture: "Mains qui se frottent l'une contre l'autre.", emoji: "🧼", image: rouLaver },
      { key: "rou-cuisiner", label: "Cuisiner", gesture: "Main qui mime une cuillère qui tourne dans une casserole.", emoji: "🍳", image: rouCuisiner },
      { key: "rou-danser", label: "Danser", gesture: "Index et majeur de la main qui dansent sur la paume de l'autre.", emoji: "💃", image: rouDanser },
      { key: "rou-chanter", label: "Chanter", gesture: "Main qui s'agite doucement devant la bouche, paume vers soi.", emoji: "🎤", image: rouChanter },
      { key: "rou-musique", label: "Musique", gesture: "Main qui ondule devant l'avant-bras tendu.", emoji: "🎵", image: rouMusique },
      { key: "rou-television", label: "Télévision", gesture: "Index qui dessinent un rectangle dans l'air.", emoji: "📺", image: rouTelevision },
      { key: "rou-voiture", label: "Voiture", gesture: "Mains qui tiennent un volant imaginaire et tournent.", emoji: "🚗", image: rouVoiture },
      { key: "rou-train", label: "Train", gesture: "Index et majeur d'une main qui frottent ceux de l'autre, en avant.", emoji: "🚆", image: rouTrain },
      { key: "rou-parc", label: "Parc", gesture: "Mains qui dessinent des arbres ronds devant soi.", emoji: "🌳", image: rouParc },
      { key: "rou-magasin", label: "Magasin", gesture: "Mains qui mime des billets passant d'une paume à l'autre.", emoji: "🛒", image: rouMagasin },
      { key: "rou-pluie", label: "Pluie", gesture: "Doigts qui descendent en pianotant comme des gouttes.", emoji: "🌧️", image: rouPluie },
      { key: "rou-soleil", label: "Soleil", gesture: "Main qui s'ouvre en éventail devant le visage.", emoji: "☀️", image: rouSoleil },
      { key: "rou-neige", label: "Neige", gesture: "Doigts qui tombent lentement en flocons.", emoji: "❄️", image: rouNeige },
    ],
  },
  {
    slug: "famille",
    title: "Famille & entourage",
    description: "Nommer les personnes qui comptent dans la vie de l'enfant.",
    emoji: "👨‍👩‍👧",
    signs: [
      { key: "fam-maman", label: "Maman", gesture: "Bout des doigts qui touchent la joue, légère caresse.", emoji: "👩", image: famMaman },
      { key: "fam-papa", label: "Papa", gesture: "Pouce qui touche le front (variante : la tempe).", emoji: "👨", image: famPapa },
      { key: "fam-frere", label: "Frère", gesture: "Index pointé vers le menton puis qui se joint à l'autre index.", emoji: "🧒", image: famFrere },
      { key: "fam-soeur", label: "Sœur", gesture: "Index qui suit la mâchoire puis se joint à l'autre index.", emoji: "👧", image: famSoeur },
      { key: "fam-grand-parent", label: "Grand-parent", gesture: "Main qui descend du menton en mimant une barbe ou des cheveux.", emoji: "👴", image: famGrandParent },
      { key: "fam-ami", label: "Ami", gesture: "Index crochetés l'un dans l'autre, à hauteur de poitrine.", emoji: "🤝", image: famAmi },
      { key: "fam-bebe", label: "Bébé", gesture: "Bras croisés en berceau qui se balancent doucement.", emoji: "👶", image: famBebe },
      { key: "fam-enfant", label: "Enfant", gesture: "Main à plat à hauteur d'un enfant qui descend doucement.", emoji: "🧒", image: famEnfant },
      { key: "fam-fille", label: "Fille", gesture: "Pouce qui suit la mâchoire vers le menton.", emoji: "👧", image: famFille },
      { key: "fam-garcon", label: "Garçon", gesture: "Pouce qui touche le front, légère pression.", emoji: "👦", image: famGarcon },
      { key: "fam-tata", label: "Tata / tante", gesture: "Index courbé qui tapote la joue.", emoji: "👩", image: famTata },
      { key: "fam-tonton", label: "Tonton / oncle", gesture: "Index courbé qui tapote la tempe.", emoji: "👨", image: famTonton },
      { key: "fam-cousin", label: "Cousin", gesture: "Index pointé qui tourne près de la tempe.", emoji: "🧑", image: famCousin },
      { key: "fam-cousine", label: "Cousine", gesture: "Index pointé qui tourne près de la joue.", emoji: "👩", image: famCousine },
      { key: "fam-mamie", label: "Mamie", gesture: "Main qui mime des cheveux courts ondulés près de la tête.", emoji: "👵", image: famMamie },
      { key: "fam-papi", label: "Papi", gesture: "Main qui descend du menton en mimant une barbe.", emoji: "👴", image: famPapi },
      { key: "fam-famille", label: "Famille", gesture: "Mains en F qui dessinent un cercle devant le buste.", emoji: "👨‍👩‍👧", image: famFamille },
      { key: "fam-voisin", label: "Voisin", gesture: "Index pointés côte à côte qui se touchent.", emoji: "🏘️", image: famVoisin },
      { key: "fam-maitresse", label: "Maîtresse", gesture: "Main à plat qui tape doucement l'autre paume comme un livre.", emoji: "👩‍🏫", image: famMaitresse },
      { key: "fam-docteur", label: "Docteur", gesture: "Index et majeur qui tapotent l'intérieur du poignet.", emoji: "🩺", image: famDocteur },
      { key: "fam-nounou", label: "Nounou", gesture: "Bras en berceau qui se balancent avec un sourire.", emoji: "🤱", image: famNounou },
      { key: "fam-copain", label: "Copain", gesture: "Index crochetés qui se serrent près de l'épaule.", emoji: "👬", image: famCopain },
      { key: "fam-copine", label: "Copine", gesture: "Index crochetés qui se serrent près de la joue.", emoji: "👭", image: famCopine },
      { key: "fam-adulte", label: "Adulte", gesture: "Main à plat à hauteur d'épaule qui désigne un grand.", emoji: "🧑", image: famAdulte },
      { key: "fam-equipe", label: "Équipe", gesture: "Mains en E qui se rejoignent devant le buste.", emoji: "👥", image: famEquipe },
      { key: "fam-voisine", label: "Voisine", gesture: "Index pointés côte à côte près de la joue.", emoji: "🏘️", image: famVoisine },
    ],
  },
];

export const ALL_LSF_SIGNS = LSF_THEMES.flatMap((t) => t.signs.map((s) => ({ ...s, themeSlug: t.slug })));

export function getThemeBySlug(slug: string) {
  return LSF_THEMES.find((t) => t.slug === slug) ?? null;
}
