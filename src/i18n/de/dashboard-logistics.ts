export const deDashboardLogistics = {
  // ShipmentList (logistics.tsx / shipment-list.tsx)
  'dashLogistics.list.title': 'Lieferungen',
  'dashLogistics.list.tabs.all': 'Alle ({count})',
  'dashLogistics.list.tabs.inTransit': 'Unterwegs ({count})',
  'dashLogistics.list.tabs.delivered': 'Zugestellt ({count})',
  'dashLogistics.list.tabs.delayed': 'Verzögert ({count})',
  'dashLogistics.list.searchAria': 'Lieferungen durchsuchen',
  'dashLogistics.list.searchPlaceholder': 'Lieferungen durchsuchen...',
  'dashLogistics.list.cargoLabel': 'Fracht',
  'dashLogistics.list.etaLabel': 'Ankunft',

  // Sheet (mobile shipment details overlay) — logistics.tsx
  'dashLogistics.sheet.titleWithId': 'Lieferung {id}',
  'dashLogistics.sheet.titleFallback': 'Lieferdetails',
  'dashLogistics.sheet.description': 'Details und Streckenkarte der ausgewählten Lieferung.',

  // ShipmentDetails — contact / transport labels
  'dashLogistics.contact.callDriver': 'Fahrer anrufen',
  'dashLogistics.contact.callAirlineSupport': 'Airline-Support anrufen',
  'dashLogistics.contact.callCaptain': 'Kapitän anrufen',
  'dashLogistics.transportNumber.vehicle': 'Fahrzeugnummer',
  'dashLogistics.transportNumber.flight': 'Flugnummer',
  'dashLogistics.transportNumber.vessel': 'Schiffsnummer',

  // ShipmentDetails — empty state
  'dashLogistics.empty.selectShipment': 'Lieferung auswählen, um Details anzuzeigen.',

  // ShipmentDetails — overview
  'dashLogistics.overview.copyIdAria': 'Sendungsnummer kopieren',
  'dashLogistics.overview.percentComplete': '{percent}% abgeschlossen',
  'dashLogistics.overview.etaWithMeta': 'Ankunft: {eta} {etaMeta}',
  'dashLogistics.overview.cargoDetails': 'Frachtdetails',
  'dashLogistics.overview.cargo': 'Fracht',
  'dashLogistics.overview.totalWeight': 'Gesamtgewicht',
  'dashLogistics.overview.transportMode': 'Transportart',
  'dashLogistics.overview.status': 'Status',

  // ShipmentDetails — tabs
  'dashLogistics.tabs.overview': 'Übersicht',
  'dashLogistics.tabs.route': 'Strecke',
  'dashLogistics.tabs.cargo': 'Fracht',
  'dashLogistics.tabs.documents': 'Dokumente',
  'dashLogistics.tabs.activity': 'Aktivität',
  'dashLogistics.tabs.routeComingSoon': 'Streckenansicht folgt in Kürze.',
  'dashLogistics.tabs.cargoComingSoon': 'Frachtansicht folgt in Kürze.',
  'dashLogistics.tabs.documentsComingSoon': 'Dokumentenansicht folgt in Kürze.',
  'dashLogistics.tabs.activityComingSoon': 'Aktivitätsansicht folgt in Kürze.',

  // Route map
  'dashLogistics.map.regionAria': 'Karte des Lieferregions Deutschland',
  'dashLogistics.map.origin': 'Herkunft',
  'dashLogistics.map.destination': 'Ziel',

  // Shipment status values (ShipmentStatus type — used as display text)
  'dashLogistics.status.scheduled': 'Geplant',
  'dashLogistics.status.inTransit': 'Unterwegs',
  'dashLogistics.status.outForDelivery': 'In Zustellung',
  'dashLogistics.status.delivered': 'Zugestellt',
  'dashLogistics.status.delayed': 'Verzögert',
  'dashLogistics.status.onHold': 'Pausiert',
  'dashLogistics.status.customsHold': 'Zollstopp',

  // Customer tier values (CustomerTier type — used as display text)
  'dashLogistics.tier.priority': 'Priorität',
  'dashLogistics.tier.standard': 'Standard',
  'dashLogistics.tier.nonPriority': 'Nicht priorisiert',

  // Customer tier descriptions (tierLabel)
  'dashLogistics.tierLabel.flagshipProjectAccount': 'Vorzeigeprojekt-Konto',
  'dashLogistics.tierLabel.top1PercentByOrderVolume': 'Top 1% nach Auftragsvolumen',
  'dashLogistics.tierLabel.internalStockReplenishment': 'Interne Lagerauffüllung',
  'dashLogistics.tierLabel.recurringOrderAccount': 'Konto mit wiederkehrenden Aufträgen',
  'dashLogistics.tierLabel.occasionalOrderAccount': 'Konto mit gelegentlichen Aufträgen',
  'dashLogistics.tierLabel.managedOrderAccount': 'Betreutes Konto',

  // Handling category labels
  'dashLogistics.handling.longLeadSpecialOrder': 'Sonderanfertigung mit langer Vorlaufzeit',
  'dashLogistics.handling.substitutedPart': 'Ersatzteil',
  'dashLogistics.handling.precisionTooling': 'Präzisionswerkzeug',
  'dashLogistics.handling.heavyMachinery': 'Schwermaschine',
  'dashLogistics.handling.standardFreight': 'Standardfracht',
  'dashLogistics.handling.heavyBulkCargo': 'Schwere Sammelfracht',
  'dashLogistics.handling.sensitivePrecisionTooling': 'Empfindliches Präzisionswerkzeug',
  'dashLogistics.handling.industrialParts': 'Industrieteile',
  'dashLogistics.handling.highValuePrecisionCargo': 'Hochwertige Präzisionsfracht',
  'dashLogistics.handling.fragilePrecisionCargo': 'Zerbrechliche Präzisionsfracht',

  // Handling tag labels
  'dashLogistics.tag.doNotStack': 'Nicht stapeln',
  'dashLogistics.tag.keepUpright': 'Aufrecht halten',
  'dashLogistics.tag.signatureRequired': 'Unterschrift erforderlich',
  'dashLogistics.tag.forkliftOnly': 'Nur mit Gabelstapler',
  'dashLogistics.tag.secureLoad': 'Ladung sichern',
  'dashLogistics.tag.doNotTip': 'Nicht kippen',
  'dashLogistics.tag.keepDry': 'Trocken halten',
  'dashLogistics.tag.sealIntact': 'Versiegelung intakt lassen',
  'dashLogistics.tag.standardHandoff': 'Standardübergabe',
  'dashLogistics.tag.heavyLift': 'Schwerlast',
  'dashLogistics.tag.doNotCrush': 'Nicht quetschen',
  'dashLogistics.tag.callBeforeDelivery': 'Vor Zustellung anrufen',
  'dashLogistics.tag.countOnArrival': 'Bei Ankunft zählen',
  'dashLogistics.tag.twoPersonLift': 'Von zwei Personen tragen',

  // Transport mode values (TransportMode type — used as display text)
  'dashLogistics.mode.land': 'Land',
  'dashLogistics.mode.air': 'Luft',
  'dashLogistics.mode.sea': 'See',

  // Route type values (RouteType type — used as display text)
  'dashLogistics.routeType.road': 'Straße',
  'dashLogistics.routeType.flight': 'Flug',
  'dashLogistics.routeType.ship': 'Schiff',

  // ETA meta (relative day/time words)
  'dashLogistics.etaMeta.today': 'Heute',
  'dashLogistics.etaMeta.tomorrow': 'Morgen',
  'dashLogistics.etaMeta.deliveredYesterday': 'Gestern zugestellt',
  'dashLogistics.etaMeta.departingToday': 'Abfahrt heute',
  'dashLogistics.etaMeta.friday': 'Freitag',
  'dashLogistics.etaMeta.wednesday': 'Mittwoch',
};
