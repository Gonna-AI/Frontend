export const enDashboardInfrastructure = {
  // InfrastructureHeader
  'dashInfra.header.title': 'Live Stack',
  'dashInfra.header.description': 'Real-time health of the Kostencheck Copilot pipeline: worker, inference, and database.',
  'dashInfra.header.lastUpdated': 'Last updated: {seconds}s ago',
  'dashInfra.header.badge.services': '{count} Services',
  'dashInfra.header.badge.components': '{count} Components',
  'dashInfra.header.badge.workerNode': '{count} Worker Node',
  'dashInfra.header.badge.uptime': '{percent}% Uptime (30d)',
  'dashInfra.header.searchPlaceholder': 'Search by service or endpoint...',
  'dashInfra.header.addWorker': 'Worker',
  'dashInfra.header.addInference': 'Inference',
  'dashInfra.header.addDatabase': 'Database',
  'dashInfra.header.addQueueStage': 'Queue Stage',
  'dashInfra.header.addEnvironment': 'Environment',
  'dashInfra.header.filters': 'Filters',

  // ProjectEnvironments — group actions
  'dashInfra.group.addEnvironment': 'Add Environment',
  'dashInfra.group.activityLogs': 'Activity Logs',
  'dashInfra.group.openConsole': 'Open Console',
  'dashInfra.group.projectSettings': 'Project Settings',
  'dashInfra.group.syncStatus': 'Sync Status',
  'dashInfra.group.manageAlerts': 'Manage Alerts',
  'dashInfra.group.copyProjectId': 'Copy Project ID',

  // EnvironmentTable — column headers
  'dashInfra.table.domain': 'Domain',
  'dashInfra.table.platform': 'Platform',
  'dashInfra.table.environment': 'Environment',
  'dashInfra.table.health': 'Health',
  'dashInfra.table.latency': 'Latency',
  'dashInfra.table.uptime': 'Uptime',
  'dashInfra.table.resources': 'Resources',
  'dashInfra.table.server': 'Server',

  // EnvironmentTable — row actions
  'dashInfra.row.viewLogs': 'View Logs',
  'dashInfra.row.openConsole': 'Open Console',
  'dashInfra.row.restart': 'Restart',
  'dashInfra.row.copyUrl': 'Copy URL',

  // ResourceMeter labels
  'dashInfra.resource.cpu': 'CPU',
  'dashInfra.resource.ram': 'RAM',
  'dashInfra.resource.disk': 'Disk',

  // EmptyProjectState
  'dashInfra.empty.noEnvironments': 'No environments in this project',

  // Environment values (InfrastructureEnvironment["environment"] — used as display text)
  'dashInfra.envValue.expired': 'Expired',
  'dashInfra.envValue.production': 'Production',
  'dashInfra.envValue.staging': 'Staging',

  // Status values (InfrastructureEnvironment["status"] — used as display text)
  'dashInfra.statusValue.online': 'Online',
  'dashInfra.statusValue.unhealthy': 'Unhealthy',
  'dashInfra.statusValue.processing': 'Processing',

  // Group names (InfrastructureGroup["name"] — display text; "Job Queue" also used as a data match key, do not change the data literal)
  'dashInfra.groupName.kostencheckCopilotWorker': 'Kostencheck Copilot Worker',
  'dashInfra.groupName.inference': 'Inference',
  'dashInfra.groupName.databaseRealtime': 'Database & Realtime',
  'dashInfra.groupName.jobQueue': 'Job Queue',

  // Job queue live-summary strings (page.tsx applyLiveJobQueue)
  'dashInfra.jobQueue.pending': '{count} pending',
  'dashInfra.jobQueue.running': '{count} running',
  'dashInfra.jobQueue.queueDepth': 'Queue depth: {count}',

  // Row domains / server descriptions / plans (infrastructure-data.ts)
  'dashInfra.row.kostencheckWorker.domain': 'worker.kostencheck.internal — parse → extract → diff → generate',
  'dashInfra.row.kostencheckWorker.server': 'Oracle Cloud Free Tier (Ampere A1, CPU)',
  'dashInfra.row.kostencheckWorker.plan': 'VM.Standard.A1.Flex, Frankfurt',

  'dashInfra.row.groqApi.domain': 'api.groq.com — llama-3.3-70b-versatile',
  'dashInfra.row.groqApi.server': 'Groq LPU Inference Engine',
  'dashInfra.row.groqApi.plan': 'Pay-as-you-go, us-east',

  'dashInfra.row.supabasePostgres.domain': 'xlzwfkgurrrspcdyqele.supabase.co — Postgres',
  'dashInfra.row.supabasePostgres.server': 'Supabase Managed Postgres 15',
  'dashInfra.row.supabasePostgres.plan': 'eu-central-1, Frankfurt',

  'dashInfra.row.supabaseRealtime.domain': 'xlzwfkgurrrspcdyqele.supabase.co — Realtime',
  'dashInfra.row.supabaseRealtime.server': 'Supabase Realtime (Phoenix/Elixir)',
  'dashInfra.row.supabaseRealtime.plan': 'eu-central-1, Frankfurt',

  'dashInfra.row.pgvectorIndex.domain': 'xlzwfkgurrrspcdyqele.supabase.co — pgvector',
  'dashInfra.row.pgvectorIndex.server': 'pgvector extension on Supabase Postgres',
  'dashInfra.row.pgvectorIndex.plan': 'eu-central-1, Frankfurt',

  'dashInfra.row.stageParse.domain': 'stage: parse — Angebot/Bestellung PDF → structured text',
  'dashInfra.row.stageParse.server': 'Oracle VPS Worker (CPU)',
  'dashInfra.row.stageParse.plan': 'Queue depth: {count}',

  'dashInfra.row.stageExtract.domain': 'stage: extract — line items, quantities, prices, clauses',
  'dashInfra.row.stageExtract.server': 'Oracle VPS Worker (CPU)',

  'dashInfra.row.stageDiff.domain': 'stage: diff — Bestellung vs Angebot comparison',
  'dashInfra.row.stageDiff.server': 'Oracle VPS Worker (CPU)',

  'dashInfra.row.stageGenerate.domain': 'stage: generate — Zusammenfassung, KickOff-Brief, AB-Entwurf',
  'dashInfra.row.stageGenerate.server': 'Oracle VPS Worker (CPU)',

  // Uptime / failure strings (infrastructure-data.ts)
  'dashInfra.uptime.failedInLast7Days': '{count} failed (7d)',
};
