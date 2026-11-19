import type { Row } from '../../api/resource';
import type { View } from '../types';
import { PRESENT } from './map';
import { RecordBoard, RecordCards, RecordGrouped, RecordMeters, RecordPeople, RecordRules, RecordShifts, RecordTiles, RecordTimeline } from './kinds';
import type { Present } from './types';

export type { Present } from './types';

/** The presenter for a view: the one named in the map, or cards built from its columns. */
export function presentFor(screenId: string, viewId: string): Present {
  return PRESENT[`${screenId}/${viewId}`] ?? { kind: 'cards' };
}

export function PresentBody({ view, rows, present, open, searching }: { view: View<Row>; rows: Row[]; present: Present; open: (id: string) => void; searching?: boolean }) {
  const common = { view, rows, open, searching };
  switch (present.kind) {
    case 'board':
      return <RecordBoard {...common} p={present} />;
    case 'timeline':
      return <RecordTimeline {...common} p={present} />;
    case 'tiles':
      return <RecordTiles {...common} p={present} />;
    case 'meters':
      return <RecordMeters {...common} p={present} />;
    case 'rules':
      return <RecordRules {...common} p={present} />;
    case 'people':
      return <RecordPeople {...common} p={present} />;
    case 'shifts':
      return <RecordShifts {...common} p={present} />;
    case 'grouped':
      return <RecordGrouped {...common} p={present} />;
    default:
      return <RecordCards {...common} p={present} />;
  }
}
