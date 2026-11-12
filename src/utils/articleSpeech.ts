/**
 * An article as it is spoken: the one place that decides what a listener hears.
 *
 * Both the audio generator (scripts/audio) and the player in the browser build their text from
 * this, so the pre-generated MP3 and the browser-voice fallback always read the same thing, and the
 * player can tell when an MP3 no longer matches the article (see fingerprint()).
 */

export type SpeechSegment = {
  kind: 'title' | 'heading' | 'text' | 'note';
  text: string;
  /** Set for a turn in an interview ("**Name:** …"); the speaker's name is not read aloud. */
  speaker?: string;
  /** Id of the matching "##" heading on the page (the same slug the table of contents uses). */
  id?: string;
};

export const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

/** Markdown formatting and symbols become plain words a voice can read. */
function plain(source: string): string {
  return source
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/\*([^*\s][^*]*?)\*/g, '$1')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:!?)]|$)/g, '$1$2')
    .replace(/<[^>]+>/g, '')
    .replace(/\be\.g\./gi, 'for example')
    .replace(/\bi\.e\./gi, 'that is')
    .replace(/\bvs\.?(?=\s)/gi, 'versus')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s*→\s*/g, ' to ')
    .replace(/\s*×\s*/g, ' times ')
    .replace(/\s*≈\s*/g, ' about ')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPEAKER = /^\*\*([^*:\n]{2,40}):\*\*\s*/;
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/;

export function articleToSegments(markdown: string, meta: { title: string; authors?: string[] }): SpeechSegment[] {
  const segments: SpeechSegment[] = [];
  const names = meta.authors?.filter(Boolean) ?? [];
  // Only the article's own authors can be speakers: other bold labels ("Likely cause:") are just text.
  const firstNames = new Set(names.map((name) => name.split(' ')[0]));
  const by = names.length ? ` By ${names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]}.` : '';
  segments.push({ kind: 'title', text: `${plain(meta.title).replace(/[.:]$/, '')}.${by}` });

  let paragraph: string[] = [];
  let fence = false;
  let table = false;

  const flush = () => {
    if (!paragraph.length) return;
    let raw = paragraph.join(' ');
    paragraph = [];
    let speaker: string | undefined;
    const turn = SPEAKER.exec(raw);
    if (turn && firstNames.has(turn[1].trim())) { speaker = turn[1].trim(); raw = raw.slice(turn[0].length); }
    const text = plain(raw);
    if (text) segments.push(speaker ? { kind: 'text', text, speaker } : { kind: 'text', text });
  };

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      flush();
      if (!fence) segments.push({ kind: 'note', text: 'A code example appears here in the article.' });
      fence = !fence;
      continue;
    }
    if (fence) continue;

    if (/^\s*\|/.test(line)) {
      flush();
      if (!table) segments.push({ kind: 'note', text: 'A table appears here in the article.' });
      table = true;
      continue;
    }
    table = false;

    const image = /^\s*!\[([^\]]*)\]\([^)]*\)\s*$/.exec(line);
    if (image) {
      flush();
      const alt = plain(image[1]);
      segments.push({ kind: 'note', text: alt ? `A figure appears here: ${alt.replace(/[.!?]$/, '')}.` : 'A figure appears here in the article.' });
      continue;
    }

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      flush();
      const text = plain(heading[2]);
      // The id must equal the one on the rendered <h2>, which is built from the heading's visible text.
      const visible = heading[2].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
      if (text) segments.push(heading[1].length === 2 ? { kind: 'heading', text, id: slugify(visible) } : { kind: 'heading', text });
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flush(); continue; }

    if (!line.trim()) { flush(); continue; }

    if (LIST_ITEM.test(line)) { flush(); paragraph.push(line.replace(LIST_ITEM, '')); continue; }
    paragraph.push(line.replace(/^\s*>\s?/, '').trim());
  }
  flush();

  segments.push({ kind: 'note', text: 'That was the end of this article from the ClerkTree journal. Thanks for listening.' });
  return segments;
}

/** Short stable identifier of what is spoken, so audio generated for older text is never played for newer text. */
export async function fingerprint(segments: SpeechSegment[]): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(segments.map((s) => [s.kind, s.speaker ?? '', s.text])));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Sentences no longer than `max` characters: speech engines in browsers stall on very long utterances. */
export function splitSentences(text: string, max = 200): string[] {
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+["')\]]*|$)\s*/g) ?? [text];
  const out: string[] = [];
  let current = '';
  const push = () => { if (current.trim()) out.push(current.trim()); current = ''; };
  for (const sentence of sentences) {
    if ((current + sentence).length > max) push();
    if (sentence.length > max) {
      // A very long sentence: break it at commas, then at spaces.
      for (const piece of sentence.split(/(?<=[,;:])\s+/)) {
        if ((current + piece).length > max) push();
        if (piece.length > max) {
          for (const word of piece.split(' ')) { if ((current + ' ' + word).length > max) push(); current += (current ? ' ' : '') + word; }
        } else current += (current ? ' ' : '') + piece;
      }
    } else current += sentence;
  }
  push();
  return out;
}

export const hasSpeech = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
