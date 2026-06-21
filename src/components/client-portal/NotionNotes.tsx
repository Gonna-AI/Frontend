import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchNotionNotes } from '../../services/clientPortalService';
import type { NotionBlock, NotionRichText } from '../../types/clientPortal';

function richText(parts: NotionRichText[] | undefined): string {
    return (parts ?? []).map((p) => p.plain_text).join('');
}

function Block({ block }: { block: NotionBlock }) {
    switch (block.type) {
        case 'heading_1':
            return <h3 className="mt-4 text-base font-bold text-white">{richText(block.heading_1?.rich_text)}</h3>;
        case 'heading_2':
            return <h4 className="mt-3 text-sm font-semibold text-white">{richText(block.heading_2?.rich_text)}</h4>;
        case 'heading_3':
            return <h5 className="mt-2 text-sm font-semibold text-white/80">{richText(block.heading_3?.rich_text)}</h5>;
        case 'bulleted_list_item':
            return (
                <div className="flex items-start gap-2 text-sm leading-7 text-white/65">
                    <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF8A5B]" />
                    {richText(block.bulleted_list_item?.rich_text)}
                </div>
            );
        case 'numbered_list_item':
            return <p className="pl-4 text-sm leading-7 text-white/65">{richText(block.numbered_list_item?.rich_text)}</p>;
        case 'to_do': {
            const checked = block.to_do?.checked ?? false;
            return (
                <div className="flex items-center gap-2 text-sm text-white/65">
                    <span className={`h-4 w-4 flex-shrink-0 rounded border ${checked ? 'border-[#7BDCB5] bg-[#7BDCB5]/20' : 'border-white/20'}`} />
                    <span className={checked ? 'line-through opacity-50' : ''}>{richText(block.to_do?.rich_text)}</span>
                </div>
            );
        }
        case 'callout':
            return (
                <div className="rounded-xl border border-[#FF8A5B]/20 bg-[#FF8A5B]/5 px-4 py-3 text-sm leading-7 text-white/70">
                    {block.callout?.icon?.emoji ? <span className="mr-2">{block.callout.icon.emoji}</span> : null}
                    {richText(block.callout?.rich_text)}
                </div>
            );
        case 'divider':
            return <hr className="border-white/10" />;
        default: {
            const text = richText(block.paragraph?.rich_text);
            if (!text.trim()) return null;
            return <p className="text-sm leading-7 text-white/65">{text}</p>;
        }
    }
}

export default function NotionNotes({ notionPageId, defaultOpen = false }: { notionPageId: string | null; defaultOpen?: boolean }) {
    const [blocks, setBlocks] = useState<NotionBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [configured, setConfigured] = useState(true);
    const [open, setOpen] = useState(defaultOpen);

    useEffect(() => {
        if (!open || !notionPageId) return;

        let active = true;
        setLoading(true);
        setError(null);

        fetchNotionNotes()
            .then(({ blocks: fetched, configured: cfg }) => {
                if (!active) return;
                setBlocks(fetched);
                setConfigured(cfg);
            })
            .catch(() => {
                if (active) setError('Could not load notes right now.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [open, notionPageId]);

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 p-6 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/[0.06] p-2.5">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B]">Notion</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">Workspace notes</h2>
                    </div>
                </div>
                {open ? <ChevronUp className="h-5 w-5 text-white/40" /> : <ChevronDown className="h-5 w-5 text-white/40" />}
            </button>

            {open ? (
                <div className="border-t border-white/10 px-6 pb-6 pt-5">
                    {loading ? (
                        <p className="text-sm text-white/40">Loading notes…</p>
                    ) : error ? (
                        <p className="text-sm text-[#FFD1BF]">{error}</p>
                    ) : !configured || blocks.length === 0 ? (
                        <p className="text-sm leading-7 text-white/40">
                            {configured ? 'This workspace has no notes yet.' : 'Notion is not connected to this workspace.'}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {blocks.map((block) => <Block key={block.id} block={block} />)}
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
}
