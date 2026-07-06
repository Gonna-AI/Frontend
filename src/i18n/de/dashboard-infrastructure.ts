export const deDashboardInfrastructure = {
  // InfrastructureHeader
  'dashInfra.header.title': 'Live Stack',
  'dashInfra.header.description': 'Echtzeit-Zustand der Kostencheck-Copilot-Pipeline: Worker, Inferenz und Datenbank.',
  'dashInfra.header.lastUpdated': 'Zuletzt aktualisiert: vor {seconds}s',
  'dashInfra.header.badge.services': '{count} Dienste',
  'dashInfra.header.badge.components': '{count} Komponenten',
  'dashInfra.header.badge.workerNode': '{count} Worker-Knoten',
  'dashInfra.header.badge.uptime': '{percent}% Verfügbarkeit (30 T.)',
  'dashInfra.header.searchPlaceholder': 'Nach Dienst oder Endpunkt suchen...',
  'dashInfra.header.addWorker': 'Worker',
  'dashInfra.header.addInference': 'Inferenz',
  'dashInfra.header.addDatabase': 'Datenbank',
  'dashInfra.header.addQueueStage': 'Warteschlangenstufe',
  'dashInfra.header.addEnvironment': 'Umgebung',
  'dashInfra.header.filters': 'Filter',

  // ProjectEnvironments — group actions
  'dashInfra.group.addEnvironment': 'Umgebung hinzufügen',
  'dashInfra.group.activityLogs': 'Aktivitätsprotokolle',
  'dashInfra.group.openConsole': 'Konsole öffnen',
  'dashInfra.group.projectSettings': 'Projekteinstellungen',
  'dashInfra.group.syncStatus': 'Sync-Status',
  'dashInfra.group.manageAlerts': 'Warnungen verwalten',
  'dashInfra.group.copyProjectId': 'Projekt-ID kopieren',

  // EnvironmentTable — column headers
  'dashInfra.table.domain': 'Domain',
  'dashInfra.table.platform': 'Plattform',
  'dashInfra.table.environment': 'Umgebung',
  'dashInfra.table.health': 'Zustand',
  'dashInfra.table.latency': 'Latenz',
  'dashInfra.table.uptime': 'Verfügbarkeit',
  'dashInfra.table.resources': 'Ressourcen',
  'dashInfra.table.server': 'Server',

  // EnvironmentTable — row actions
  'dashInfra.row.viewLogs': 'Protokolle anzeigen',
  'dashInfra.row.openConsole': 'Konsole öffnen',
  'dashInfra.row.restart': 'Neu starten',
  'dashInfra.row.copyUrl': 'URL kopieren',

  // ResourceMeter labels
  'dashInfra.resource.cpu': 'CPU',
  'dashInfra.resource.ram': 'RAM',
  'dashInfra.resource.disk': 'Speicher',

  // EmptyProjectState
  'dashInfra.empty.noEnvironments': 'Keine Umgebungen in diesem Projekt',

  // Environment values (InfrastructureEnvironment["environment"] — used as display text)
  'dashInfra.envValue.expired': 'Abgelaufen',
  'dashInfra.envValue.production': 'Produktion',
  'dashInfra.envValue.staging': 'Staging',

  // Status values (InfrastructureEnvironment["status"] — used as display text)
  'dashInfra.statusValue.online': 'Online',
  'dashInfra.statusValue.unhealthy': 'Gestört',
  'dashInfra.statusValue.processing': 'In Verarbeitung',

  // Group names (InfrastructureGroup["name"] — display text; "Job Queue" also used as a data match key, do not change the data literal)
  'dashInfra.groupName.kostencheckCopilotWorker': 'Kostencheck Copilot Worker',
  'dashInfra.groupName.inference': 'Inferenz',
  'dashInfra.groupName.databaseRealtime': 'Datenbank & Realtime',
  'dashInfra.groupName.jobQueue': 'Warteschlange',

  // Job queue live-summary strings (page.tsx applyLiveJobQueue)
  'dashInfra.jobQueue.pending': '{count} ausstehend',
  'dashInfra.jobQueue.running': '{count} laufend',
  'dashInfra.jobQueue.queueDepth': 'Warteschlangentiefe: {count}',

  // Row domains / server descriptions / plans (infrastructure-data.ts)
  'dashInfra.row.kostencheckWorker.domain': 'worker.kostencheck.internal — parse → extract → diff → generate',
  'dashInfra.row.kostencheckWorker.server': 'Oracle Cloud Free Tier (Ampere A1, CPU)',
  'dashInfra.row.kostencheckWorker.plan': 'VM.Standard.A1.Flex, Frankfurt',

  'dashInfra.row.groqApi.domain': 'api.groq.com — llama-3.3-70b-versatile',
  'dashInfra.row.groqApi.server': 'Groq LPU Inference Engine',
  'dashInfra.row.groqApi.plan': 'Nutzungsbasiert, us-east',

  'dashInfra.row.supabasePostgres.domain': 'xlzwfkgurrrspcdyqele.supabase.co — Postgres',
  'dashInfra.row.supabasePostgres.server': 'Supabase Managed Postgres 15',
  'dashInfra.row.supabasePostgres.plan': 'eu-central-1, Frankfurt',

  'dashInfra.row.supabaseRealtime.domain': 'xlzwfkgurrrspcdyqele.supabase.co — Realtime',
  'dashInfra.row.supabaseRealtime.server': 'Supabase Realtime (Phoenix/Elixir)',
  'dashInfra.row.supabaseRealtime.plan': 'eu-central-1, Frankfurt',

  'dashInfra.row.pgvectorIndex.domain': 'xlzwfkgurrrspcdyqele.supabase.co — pgvector',
  'dashInfra.row.pgvectorIndex.server': 'pgvector-Erweiterung auf Supabase Postgres',
  'dashInfra.row.pgvectorIndex.plan': 'eu-central-1, Frankfurt',

  'dashInfra.row.stageParse.domain': 'Stufe: parse — Angebot/Bestellung PDF → strukturierter Text',
  'dashInfra.row.stageParse.server': 'Oracle VPS Worker (CPU)',
  'dashInfra.row.stageParse.plan': 'Warteschlangentiefe: {count}',

  'dashInfra.row.stageExtract.domain': 'Stufe: extract — Positionen, Mengen, Preise, Klauseln',
  'dashInfra.row.stageExtract.server': 'Oracle VPS Worker (CPU)',

  'dashInfra.row.stageDiff.domain': 'Stufe: diff — Abgleich Bestellung vs. Angebot',
  'dashInfra.row.stageDiff.server': 'Oracle VPS Worker (CPU)',

  'dashInfra.row.stageGenerate.domain': 'Stufe: generate — Zusammenfassung, KickOff-Brief, AB-Entwurf',
  'dashInfra.row.stageGenerate.server': 'Oracle VPS Worker (CPU)',

  // Uptime / failure strings (infrastructure-data.ts)
  'dashInfra.uptime.failedInLast7Days': '{count} fehlgeschlagen (7 T.)',
};
