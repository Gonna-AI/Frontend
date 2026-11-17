import { AI, MODELS } from './screens/ai';
import { api } from './screens/api';
import { CONNECTIVITY } from './screens/connectivity';
import { CONTROL } from './screens/control';
import { MONITOR } from './screens/monitor';
import { KNOWLEDGE, ORG } from './screens/org';
import { WORK } from './screens/work';
import type { Screen } from './types';

/** Every workspace screen by its address. The navigation, routing and the command search read this. */
export const SCREENS: Record<string, Screen> = Object.fromEntries([...WORK, ...MONITOR, ...CONTROL, ...KNOWLEDGE, ...AI, ...MODELS, ...CONNECTIVITY, ...ORG, api].map((s) => [s.id, s]));
