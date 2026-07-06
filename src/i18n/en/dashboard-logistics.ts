export const enDashboardLogistics = {
  // ShipmentList (logistics.tsx / shipment-list.tsx)
  'dashLogistics.list.title': 'Deliveries',
  'dashLogistics.list.tabs.all': 'All ({count})',
  'dashLogistics.list.tabs.inTransit': 'In Transit ({count})',
  'dashLogistics.list.tabs.delivered': 'Delivered ({count})',
  'dashLogistics.list.tabs.delayed': 'Delayed ({count})',
  'dashLogistics.list.searchAria': 'Search deliveries',
  'dashLogistics.list.searchPlaceholder': 'Search deliveries...',
  'dashLogistics.list.cargoLabel': 'Cargo',
  'dashLogistics.list.etaLabel': 'ETA',

  // Sheet (mobile shipment details overlay) — logistics.tsx
  'dashLogistics.sheet.titleWithId': 'Shipment {id}',
  'dashLogistics.sheet.titleFallback': 'Shipment details',
  'dashLogistics.sheet.description': 'Selected shipment details and route map.',

  // ShipmentDetails — contact / transport labels
  'dashLogistics.contact.callDriver': 'Call Driver',
  'dashLogistics.contact.callAirlineSupport': 'Call Airline Support',
  'dashLogistics.contact.callCaptain': 'Call Captain',
  'dashLogistics.transportNumber.vehicle': 'Vehicle number',
  'dashLogistics.transportNumber.flight': 'Flight number',
  'dashLogistics.transportNumber.vessel': 'Vessel number',

  // ShipmentDetails — empty state
  'dashLogistics.empty.selectShipment': 'Select a shipment to view details.',

  // ShipmentDetails — overview
  'dashLogistics.overview.copyIdAria': 'Copy shipment ID',
  'dashLogistics.overview.percentComplete': '{percent}% complete',
  'dashLogistics.overview.etaWithMeta': 'ETA: {eta} {etaMeta}',
  'dashLogistics.overview.cargoDetails': 'Cargo details',
  'dashLogistics.overview.cargo': 'Cargo',
  'dashLogistics.overview.totalWeight': 'Total weight',
  'dashLogistics.overview.transportMode': 'Transport mode',
  'dashLogistics.overview.status': 'Status',

  // ShipmentDetails — tabs
  'dashLogistics.tabs.overview': 'Overview',
  'dashLogistics.tabs.route': 'Route',
  'dashLogistics.tabs.cargo': 'Cargo',
  'dashLogistics.tabs.documents': 'Documents',
  'dashLogistics.tabs.activity': 'Activity',
  'dashLogistics.tabs.routeComingSoon': 'Route view coming soon.',
  'dashLogistics.tabs.cargoComingSoon': 'Cargo view coming soon.',
  'dashLogistics.tabs.documentsComingSoon': 'Documents view coming soon.',
  'dashLogistics.tabs.activityComingSoon': 'Activity view coming soon.',

  // Route map
  'dashLogistics.map.regionAria': 'Germany delivery region map',
  'dashLogistics.map.origin': 'Origin',
  'dashLogistics.map.destination': 'Destination',

  // Shipment status values (ShipmentStatus type — used as display text)
  'dashLogistics.status.scheduled': 'Scheduled',
  'dashLogistics.status.inTransit': 'In Transit',
  'dashLogistics.status.outForDelivery': 'Out for Delivery',
  'dashLogistics.status.delivered': 'Delivered',
  'dashLogistics.status.delayed': 'Delayed',
  'dashLogistics.status.onHold': 'On Hold',
  'dashLogistics.status.customsHold': 'Customs Hold',

  // Customer tier values (CustomerTier type — used as display text)
  'dashLogistics.tier.priority': 'Priority',
  'dashLogistics.tier.standard': 'Standard',
  'dashLogistics.tier.nonPriority': 'Non-priority',

  // Customer tier descriptions (tierLabel)
  'dashLogistics.tierLabel.flagshipProjectAccount': 'Flagship project account',
  'dashLogistics.tierLabel.top1PercentByOrderVolume': 'Top 1% by order volume',
  'dashLogistics.tierLabel.internalStockReplenishment': 'Internal stock replenishment',
  'dashLogistics.tierLabel.recurringOrderAccount': 'Recurring order account',
  'dashLogistics.tierLabel.occasionalOrderAccount': 'Occasional order account',
  'dashLogistics.tierLabel.managedOrderAccount': 'Managed order account',

  // Handling category labels
  'dashLogistics.handling.longLeadSpecialOrder': 'Long-lead special order',
  'dashLogistics.handling.substitutedPart': 'Substituted part',
  'dashLogistics.handling.precisionTooling': 'Precision tooling',
  'dashLogistics.handling.heavyMachinery': 'Heavy machinery',
  'dashLogistics.handling.standardFreight': 'Standard freight',
  'dashLogistics.handling.heavyBulkCargo': 'Heavy bulk cargo',
  'dashLogistics.handling.sensitivePrecisionTooling': 'Sensitive precision tooling',
  'dashLogistics.handling.industrialParts': 'Industrial parts',
  'dashLogistics.handling.highValuePrecisionCargo': 'High-value precision cargo',
  'dashLogistics.handling.fragilePrecisionCargo': 'Fragile precision cargo',

  // Handling tag labels
  'dashLogistics.tag.doNotStack': 'Do not stack',
  'dashLogistics.tag.keepUpright': 'Keep upright',
  'dashLogistics.tag.signatureRequired': 'Signature required',
  'dashLogistics.tag.forkliftOnly': 'Forklift only',
  'dashLogistics.tag.secureLoad': 'Secure load',
  'dashLogistics.tag.doNotTip': 'Do not tip',
  'dashLogistics.tag.keepDry': 'Keep dry',
  'dashLogistics.tag.sealIntact': 'Seal intact',
  'dashLogistics.tag.standardHandoff': 'Standard handoff',
  'dashLogistics.tag.heavyLift': 'Heavy lift',
  'dashLogistics.tag.doNotCrush': 'Do not crush',
  'dashLogistics.tag.callBeforeDelivery': 'Call before delivery',
  'dashLogistics.tag.countOnArrival': 'Count on arrival',
  'dashLogistics.tag.twoPersonLift': 'Two-person lift',

  // Transport mode values (TransportMode type — used as display text)
  'dashLogistics.mode.land': 'Land',
  'dashLogistics.mode.air': 'Air',
  'dashLogistics.mode.sea': 'Sea',

  // Route type values (RouteType type — used as display text)
  'dashLogistics.routeType.road': 'Road',
  'dashLogistics.routeType.flight': 'Flight',
  'dashLogistics.routeType.ship': 'Ship',

  // ETA meta (relative day/time words)
  'dashLogistics.etaMeta.today': 'Today',
  'dashLogistics.etaMeta.tomorrow': 'Tomorrow',
  'dashLogistics.etaMeta.deliveredYesterday': 'Delivered Yesterday',
  'dashLogistics.etaMeta.departingToday': 'Departing Today',
  'dashLogistics.etaMeta.friday': 'Friday',
  'dashLogistics.etaMeta.wednesday': 'Wednesday',
  'dashLogistics.etaMeta.movedUpFromKw38': 'Moved up from KW 38',
  'dashLogistics.etaMeta.goodsReceipt': 'Goods Receipt',

  // Static demo shipment data (shipment-data.ts) — locations, cargo, handling notes
  'dashLogistics.shipmentData.loc.customMotorSupplierNuremberg': 'Custom Motor Supplier, Nuremberg',
  'dashLogistics.shipmentData.loc.thdStraubing': 'THD GmbH, Straubing',
  'dashLogistics.shipmentData.loc.bergmannAugsburg': 'Bergmann Maschinenbau GmbH, Augsburg',
  'dashLogistics.shipmentData.loc.weberStuttgart': 'Weber Präzisionstechnik GmbH, Stuttgart',
  'dashLogistics.shipmentData.loc.rotaryTableManufacturingVillingen': 'Rotary Index Table Manufacturing, Villingen-Schwenningen',
  'dashLogistics.shipmentData.loc.mkAnlagenbauMannheim': 'MK Anlagenbau GmbH, Mannheim',
  'dashLogistics.shipmentData.loc.controlWiringSupplierRegensburg': 'Control Wiring Supplier, Regensburg',
  'dashLogistics.shipmentData.loc.rheinmetallKassel': 'Rheinmetall Fertigungstechnik GmbH, Kassel',
  'dashLogistics.shipmentData.loc.vossSolingen': 'Voss Werkzeugbau GmbH, Solingen',
  'dashLogistics.shipmentData.loc.baumannUlm': 'Baumann Antriebstechnik GmbH, Ulm',
  'dashLogistics.shipmentData.loc.precisionCastingSupplierChemnitz': 'Precision Casting Supplier, Chemnitz',
  'dashLogistics.shipmentData.loc.schusterDresden': 'Schuster Zerspanungstechnik GmbH, Dresden',
  'dashLogistics.shipmentData.loc.hartmannNuremberg': 'Hartmann Sondermaschinenbau GmbH, Nuremberg',
  'dashLogistics.shipmentData.loc.lindnerMunich': 'Lindner CNC-Technik GmbH, Munich',
  'dashLogistics.shipmentData.loc.achatzPassau': 'Achatz Präzisionsguss GmbH, Passau',

  'dashLogistics.shipmentData.cargo.tm75BergmannPackage': 'Custom Motor TM-75 (Bergmann CNC Package 2026)',
  'dashLogistics.shipmentData.cargo.rs90Substituted': 'RS-90 Tailstock (substituted, flagged by Kostencheck)',
  'dashLogistics.shipmentData.cargo.sp200': 'SP-200 Clamping System',
  'dashLogistics.shipmentData.cargo.rt450': 'RT-450 Rotary Index Table',
  'dashLogistics.shipmentData.cargo.controlWiringStockReplenishment': 'Control Wiring, Stock Replenishment',
  'dashLogistics.shipmentData.cargo.rt350': 'RT-350 Rotary Index Table',
  'dashLogistics.shipmentData.cargo.sp150': 'SP-150 Clamping System',
  'dashLogistics.shipmentData.cargo.tm75': 'TM-75 Custom Motor',
  'dashLogistics.shipmentData.cargo.precisionPartsRawCastings': 'Precision Parts, Raw Castings',
  'dashLogistics.shipmentData.cargo.rt450Rs100': 'RT-450 Rotary Index Table, RS-100 Tailstock',
  'dashLogistics.shipmentData.cargo.sp200ControlWiring': 'SP-200 Clamping System, Control Wiring',
  'dashLogistics.shipmentData.cargo.rs90': 'RS-90 Tailstock',

  'dashLogistics.shipmentData.note.tm75ScheduleChange': 'Delivery moved up from KW 38 to KW 36 — Kostencheck detected the schedule change.',
  'dashLogistics.shipmentData.note.rs90Approval': 'RS-90 delivered instead of RS-100 — PTL approval required before shipment.',
  'dashLogistics.shipmentData.note.sp200Protective': 'Keep the clamping system in protective packaging until handover.',
  'dashLogistics.shipmentData.note.rt450Secure': 'Secure the rotary index table to the pallet before road transport.',
  'dashLogistics.shipmentData.note.keepDrySunlight': 'Keep cartons dry and protect from direct sunlight.',
  'dashLogistics.shipmentData.note.liftingEquipment': 'Load with lifting equipment and secure against shifting.',
  'dashLogistics.shipmentData.note.sealedCustoms': 'Keep sealed until customs inspection or goods receipt check.',
  'dashLogistics.shipmentData.note.keepDryCallRecipient': 'Keep cartons dry and call the recipient before delivery.',
  'dashLogistics.shipmentData.note.securePalletsMoisture': 'Secure pallets and protect machined surfaces from moisture.',
  'dashLogistics.shipmentData.note.sealedSignedHandover': 'Keep freight sealed until signed handover.',
  'dashLogistics.shipmentData.note.dryPalletCount': 'Keep freight dry and verify pallet count at handover.',
  'dashLogistics.shipmentData.note.blanketWrap': 'Use blanket wrap and do not stack on machined surfaces.',
};
