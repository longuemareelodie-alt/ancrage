import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SupportItem } from "@/data/supportTemplates";
import { softHaptic } from "@/lib/supportPersonalisation";

export type SupportRow = SupportItem & { __k?: string };

export const rowKey = () => Math.random().toString(36).slice(2, 10);

/** Ajoute une clé stable à chaque ligne : nécessaire pour le glisser-déposer. */
export const withRowKeys = (items: SupportRow[]): SupportRow[] =>
  items.map((it) => (it.__k ? it : { ...it, __k: rowKey() }));

/** Retire les clés techniques avant enregistrement ou impression. */
export const stripRowKeys = (items: SupportRow[]): SupportItem[] =>
  items.map(({ __k, ...rest }) => rest);

type RowProps = {
  item: SupportRow;
  index: number;
  itemLabel: string;
  withTime: boolean;
  onChange: (patch: Partial<SupportItem>) => void;
  onRemove: () => void;
};

const Row = ({ item, index, itemLabel, withTime, onChange, onRemove }: RowProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-start gap-2 rounded-[20px] border border-border/70 bg-card px-3 py-3"
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px -18px hsl(var(--foreground) / 0.35)" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          softHaptic();
          controls.start(e);
        }}
        aria-label="Déplacer cette ligne"
        className="mt-2 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={itemLabel + " " + (index + 1)}
          className="h-9 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
        />
        {withTime && (
          <Input
            type="time"
            value={item.time ?? ""}
            onChange={(e) => onChange({ time: e.target.value })}
            className="h-8 w-28 text-xs"
          />
        )}
      </div>
      <button onClick={onRemove} aria-label="Supprimer" className="mt-2 text-muted-foreground">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </Reorder.Item>
  );
};

/**
 * Liste réordonnable au doigt ou à la souris.
 * Pensée pour l'emploi du temps visuel : on attrape une case et on la pose.
 */
const SupportItemsReorder = ({
  items,
  setItems,
  itemLabel,
  withTime,
}: {
  items: SupportRow[];
  setItems: (next: SupportRow[]) => void;
  itemLabel: string;
  withTime: boolean;
}) => (
  <>
    <p className="pt-2 text-[11px] font-medium text-muted-foreground">
      Attrape la poignée pour réorganiser l'ordre.
    </p>
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2 pt-1">
      {items.map((item, i) => (
        <Row
          key={item.__k ?? i}
          item={item}
          index={i}
          itemLabel={itemLabel}
          withTime={withTime}
          onChange={(patch) =>
            setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
          }
          onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
        />
      ))}
    </Reorder.Group>
    <button
      onClick={() => setItems([...items, { label: "", __k: rowKey() }])}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-border bg-card/50 py-3 text-sm font-medium text-muted-foreground"
    >
      <Plus className="h-4 w-4" strokeWidth={2} /> Ajouter {itemLabel.toLowerCase()}
    </button>
  </>
);

export default SupportItemsReorder;
