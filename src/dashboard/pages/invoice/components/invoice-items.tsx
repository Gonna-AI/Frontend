import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Plus, Trash2 } from "lucide-react-dash";
import type { UseFormRegister } from "react-hook-form";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, formatCurrency } from "@/lib/utils";

import { getLineAmount, type InvoiceFormValues, type InvoiceLineItem } from "./data";

export function InvoiceItems() {
  const { control, register } = useFormContext<InvoiceFormValues>();
  const { append, fields, move, remove } = useFieldArray({
    control,
    name: "items",
    keyName: "fieldKey",
  });
  const items = useWatch({ control, name: "items" }) ?? [];
  const sortableItemIds = fields.map((field) => field.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const { t } = useLanguage();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    move(oldIndex, newIndex);
  }

  function handleAddItem() {
    append({ id: `item-${Date.now()}`, description: "", quantity: 1, unitPrice: 0 });
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium tracking-tight">{t('dashInvoice.items.heading')}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={handleAddItem}>
          <Plus data-icon="inline-start" />
          {t('dashInvoice.items.addItem')}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden items-center gap-2 px-1 font-medium text-muted-foreground text-xs md:grid md:grid-cols-[24px_minmax(0,1fr)_64px_112px_112px_32px]">
          <span />
          <span>{t('dashInvoice.items.description')}</span>
          <span className="px-2">{t('dashInvoice.items.units')}</span>
          <span className="px-2">{t('dashInvoice.items.unitCost')}</span>
          <span className="text-right">{t('dashInvoice.items.lineTotal')}</span>
          <span />
        </div>

        <DndContext
          id="invoice-items"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <SortableInvoiceItemRow
                  key={field.id}
                  id={field.id}
                  index={index}
                  item={items[index]}
                  register={register}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}

function SortableInvoiceItemRow({
  id,
  index,
  item,
  register,
  onRemove,
}: {
  id: string;
  index: number;
  item?: InvoiceLineItem;
  register: UseFormRegister<InvoiceFormValues>;
  onRemove: () => void;
}) {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id,
  });
  const { t } = useLanguage();

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        "grid min-w-0 grid-cols-[24px_minmax(0,0.8fr)_minmax(0,1fr)_32px] items-center gap-2 rounded-lg md:grid-cols-[24px_minmax(0,1fr)_64px_112px_112px_32px]",
        isDragging && "relative z-10 opacity-50",
      )}
    >
      <Button
        ref={setActivatorNodeRef}
        type="button"
        variant="ghost"
        size="icon-sm"
        className="-ml-2 cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={t('dashInvoice.items.reorderAria').replace('{id}', id)}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      <Input
        className="min-w-0 text-sm max-md:col-span-3"
        aria-label={t('dashInvoice.items.descriptionAria').replace('{index}', String(index + 1))}
        {...register(`items.${index}.description` as const)}
      />
      <Input
        type="number"
        step="1"
        className="text-sm max-md:col-start-2 max-md:row-start-2"
        aria-label={t('dashInvoice.items.quantityAria').replace('{index}', String(index + 1))}
        {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
      />
      <Input
        type="number"
        step="0.01"
        className="text-sm max-md:col-start-3 max-md:row-start-2"
        aria-label={t('dashInvoice.items.unitPriceAria').replace('{index}', String(index + 1))}
        {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
      />
      <div className="min-w-0 text-right font-medium text-sm max-md:col-span-3 max-md:col-start-2 max-md:row-start-3 max-md:flex max-md:items-center max-md:justify-between max-md:text-left">
        <span className="hidden text-muted-foreground max-md:inline">{t('dashInvoice.items.lineTotalMobile')}</span>
        <span>{formatInvoiceCurrency(getLineAmount(item))}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="max-md:col-start-4 max-md:row-start-2"
        aria-label={t('dashInvoice.items.removeAria').replace('{index}', String(index + 1))}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

function formatInvoiceCurrency(value: number) {
  return formatCurrency(Number.isFinite(value) ? value : 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
