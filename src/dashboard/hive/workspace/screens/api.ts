import { Braces } from 'lucide-react-dash';

import { fetchOpenApi, hiveRequest } from '../../api/client';
import type { Row } from '../../api/resource';
import { col, count, is } from '../def';
import type { Screen } from '../types';

const METHOD_TONES = { GET: 'green', POST: 'orange', PATCH: 'amber', PUT: 'amber', DELETE: 'red' } as const;

async function operations(): Promise<Row[]> {
  const doc = (await fetchOpenApi()) as { paths?: Record<string, Record<string, Record<string, unknown>>> } | null;
  const rows: Row[] = [];
  for (const [path, item] of Object.entries(doc?.paths ?? {})) {
    for (const [m, op] of Object.entries(item)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(m)) continue;
      const perm = String(op['x-hive-permission'] ?? '');
      rows.push({
        id: String(op.operationId),
        method: m.toUpperCase(),
        path,
        summary: String(op.summary ?? ''),
        resource: (path.split('/')[2] ?? '').replace(/\.json$/, '').replace(/-/g, ' '),
        permission: perm === 'none' ? 'public' : perm,
        idempotency: String(op['x-hive-idempotency'] ?? 'none'),
        stability: String(op['x-hive-stability'] ?? 'stable'),
        errors: (op['x-hive-errors'] as string[] | undefined) ?? [],
      });
    }
  }
  return rows.sort((a, b) => String(a.path).localeCompare(String(b.path)));
}

async function eventTypes(signal: AbortSignal): Promise<Row[]> {
  const doc = await hiveRequest<{ channels?: Record<string, { address?: string; description?: string }> }>('/v1/asyncapi.json', { public: true, signal });
  return Object.entries(doc.channels ?? {}).map(([name, ch]) => ({
    id: name,
    type: ch.address ?? name,
    resource: name.split('.')[0],
    verb: name.split('.').slice(1).join('.'),
    description: (ch.description ?? '').replace(/\s*\([A-Z]+-[A-Z0-9-]+\)/g, ''),
  }));
}

/** The API as it is deployed: read live from the published OpenAPI and AsyncAPI documents. */
export const api: Screen = {
  id: 'api',
  title: 'API',
  about: 'The HIVE API as it runs right now: every operation and event type, read live from the published contract.',
  icon: Braces,
  keywords: 'api openapi asyncapi endpoints operations events contract reference',
  spec: 'API-GOV · API-CAT · DX-DOCS',
  views: [
    {
      id: 'operations',
      title: 'Operations',
      statusKey: 'method',
      note: 'Read live from GET /v1/openapi.json. Each operation is documented with examples at docs.hive.clerktree.com/reference.',
      resource: {
        object: 'openapi_document',
        path: '/v1/openapi.json',
        owner: 'API-GOV',
        list: 'openapi_document_retrieve',
        loadPublic: () => operations(),
        fixture: [{ id: 'api_health_read', method: 'GET', path: '/v1/health', summary: 'API health', resource: 'health', permission: 'public', idempotency: 'none', stability: 'stable', errors: [] }],
      },
      columns: [
        { key: 'method', label: 'Method', kind: 'status', tones: METHOD_TONES },
        col.id('path', 'Path'),
        col.title('summary', 'Summary'),
        col.text('resource', 'Resource'),
        col.id('permission', 'Permission'),
        col.status('stability', 'Stability'),
      ],
      titleKey: 'summary',
      detail: [{ key: 'idempotency', label: 'Idempotency' }, { key: 'errors', label: 'Errors', kind: 'tags' }],
      kpis: [count('Operations', undefined, 'In the current version'), count('Public', is('permission', 'public'), 'No credentials needed'), count('Writes', is('method', 'POST', 'PATCH', 'PUT', 'DELETE'))],
      breakdown: { title: 'Operations by resource', by: 'resource' },
    },
    {
      id: 'events',
      title: 'Event types',
      statusKey: 'resource',
      note: 'Read live from GET /v1/asyncapi.json. Subscribe with a webhook or the event stream.',
      resource: {
        object: 'asyncapi_document',
        path: '/v1/asyncapi.json',
        owner: 'API-GOV',
        list: 'asyncapi_document_retrieve',
        loadPublic: eventTypes,
        fixture: [{ id: 'asset.created', type: 'com.clerktree.hive.asset.created.v1', resource: 'asset', verb: 'created', description: 'An asset was created.' }],
      },
      columns: [col.id('type', 'Event type'), col.text('resource', 'Resource'), col.text('verb', 'Change'), col.muted('description', 'Meaning')],
      titleKey: 'type',
      kpis: [count('Event types', undefined, 'Published now')],
    },
  ],
};
