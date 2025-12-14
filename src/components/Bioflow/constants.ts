import { NodeStatus, AppNode, AppEdge } from '../../types/bioflow';

// ========== DOCTOR APPOINTMENT WORKFLOW ==========
// Pattern: Clean horizontal flow with parallel middle section
export const DOCTOR_NODES: AppNode[] = [
    {
        id: 'start',
        type: 'glass',
        position: { x: 50, y: 280 },
        data: {
            label: 'Receive Request',
            subline: 'Patient submits appointment',
            icon: 'Database',
            category: 'trigger',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '< 1s' },
            inputType: 'Email / Call',
            outputType: 'Patient Info',
            inputs: {},
            outputs: { patientName: 'John Doe', preferredDate: 'Tomorrow' }
        },
    },
    {
        id: 'analyze',
        type: 'glass',
        position: { x: 480, y: 280 },
        data: {
            label: 'Understand Request',
            subline: 'AI extracts key details',
            icon: 'Brain',
            category: 'agent',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { model: 'Gemini AI', confidence: 0.97 },
            inputType: 'Patient Info',
            outputType: 'Structured Data',
            inputs: { request: 'I need an appointment for checkup' }
        },
    },
    {
        id: 'check-calendar',
        type: 'glass',
        position: { x: 910, y: 80 },
        data: {
            label: 'Check Availability',
            subline: 'Query doctor calendar',
            icon: 'Search',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.5s' },
            inputType: 'Date Request',
            outputType: 'Available Slots',
            outputs: { slots: ['9:00 AM', '2:30 PM', '4:00 PM'] }
        },
    },
    {
        id: 'check-patient',
        type: 'glass',
        position: { x: 910, y: 480 },
        data: {
            label: 'Verify Patient',
            subline: 'Check patient records',
            icon: 'Stethoscope',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.3s' },
            inputType: 'Patient Name',
            outputType: 'Patient Profile',
            outputs: { isExisting: true, lastVisit: '3 months ago' }
        },
    },
    {
        id: 'schedule',
        type: 'glass',
        position: { x: 1340, y: 280 },
        data: {
            label: 'Create Appointment',
            subline: 'AI schedules optimal time',
            icon: 'GitMerge',
            category: 'agent',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { model: 'Gemini AI', confidence: 0.99 },
            inputType: 'Slots + Patient',
            outputType: 'Confirmed Slot',
        },
    },
    {
        id: 'notify',
        type: 'glass',
        position: { x: 1770, y: 280 },
        data: {
            label: 'Send Confirmation',
            subline: 'Email & SMS notification',
            icon: 'Zap',
            category: 'action',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '1s' },
            inputType: 'Appointment',
            outputType: 'Notification Sent',
        },
    },
];

export const DOCTOR_EDGES: AppEdge[] = [
    { id: 'e1', source: 'start', target: 'analyze', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    { id: 'e2', source: 'analyze', target: 'check-calendar', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    { id: 'e3', source: 'analyze', target: 'check-patient', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    { id: 'e4', source: 'check-calendar', target: 'schedule', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    { id: 'e5', source: 'check-patient', target: 'schedule', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    { id: 'e6', source: 'schedule', target: 'notify', type: 'smoothstep', animated: true, label: 'Confirmed', style: { stroke: '#6366f1', strokeWidth: 1.5 } },
];

export const DOCTOR_LOGS: Record<string, string[]> = {
    'start': ['New appointment request received', 'Extracting patient information', 'Request parsed successfully'],
    'analyze': ['Analyzing request with AI', 'Preferred time: Tomorrow morning', 'Type: General checkup'],
    'check-calendar': ['Checking Dr. Smith\'s calendar', 'Finding available slots', 'Found 3 available times'],
    'check-patient': ['Looking up patient records', 'Previous visit history found', 'Patient verified'],
    'schedule': ['Selecting optimal time slot', 'Creating appointment entry', 'Scheduled for 9:00 AM'],
    'notify': ['Sending confirmation email', 'Sending SMS reminder', 'Patient notified'],
};

export const DOCTOR_TRACE = [
    ['start'],
    ['analyze'],
    ['check-calendar', 'check-patient'],
    ['schedule'],
    ['notify'],
];

// ========== RESTAURANT BOOKING WORKFLOW ==========
// Pattern: Wide diamond with 3 parallel branches
export const RESTAURANT_NODES: AppNode[] = [
    {
        id: 'start',
        type: 'glass',
        position: { x: 580, y: 30 },
        data: {
            label: 'Receive Booking',
            subline: 'Customer requests table',
            icon: 'Database',
            category: 'trigger',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '< 1s' },
            inputType: 'Website / Call',
            outputType: 'Booking Request',
            inputs: {},
            outputs: { guests: 4, date: 'Friday 7 PM' }
        },
    },
    {
        id: 'check-tables',
        type: 'glass',
        position: { x: 80, y: 230 },
        data: {
            label: 'Check Tables',
            subline: 'Query reservation system',
            icon: 'Search',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.4s' },
            inputType: 'Date & Party Size',
            outputType: 'Available Tables',
            outputs: { tables: ['Patio #3', 'Garden #1'] }
        },
    },
    {
        id: 'check-vip',
        type: 'glass',
        position: { x: 580, y: 230 },
        data: {
            label: 'Check VIP Status',
            subline: 'Loyalty program lookup',
            icon: 'Stethoscope',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.2s' },
            inputType: 'Customer Info',
            outputType: 'VIP Level',
            outputs: { level: 'Gold', visits: 12 }
        },
    },
    {
        id: 'check-special',
        type: 'glass',
        position: { x: 1080, y: 230 },
        data: {
            label: 'Check Events',
            subline: 'Today\'s specials & events',
            icon: 'FileText',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.2s' },
            inputType: 'Date',
            outputType: 'Events Info',
            outputs: { event: 'Live Jazz Night', special: 'Seafood Platter' }
        },
    },
    {
        id: 'recommend',
        type: 'glass',
        position: { x: 580, y: 450 },
        data: {
            label: 'AI Recommendation',
            subline: 'Best table & experience',
            icon: 'Brain',
            category: 'agent',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { model: 'Gemini AI', confidence: 0.98 },
            inputType: 'All Options',
            outputType: 'Best Match',
        },
    },
    {
        id: 'confirm',
        type: 'glass',
        position: { x: 330, y: 670 },
        data: {
            label: 'Confirm & Notify',
            subline: 'Email with details',
            icon: 'Zap',
            category: 'action',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '1s' },
            inputType: 'Reservation',
            outputType: 'Confirmed',
        },
    },
    {
        id: 'add-note',
        type: 'glass',
        position: { x: 830, y: 670 },
        data: {
            label: 'Prep Kitchen',
            subline: 'VIP prep notes',
            icon: 'Terminal',
            category: 'action',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.3s' },
            inputType: 'VIP Preferences',
            outputType: 'Kitchen Alert',
        },
    },
];

export const RESTAURANT_EDGES: AppEdge[] = [
    { id: 'e1', source: 'start', target: 'check-tables', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e2', source: 'start', target: 'check-vip', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e3', source: 'start', target: 'check-special', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e4', source: 'check-tables', target: 'recommend', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e5', source: 'check-vip', target: 'recommend', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e6', source: 'check-special', target: 'recommend', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e7', source: 'recommend', target: 'confirm', type: 'smoothstep', animated: true, label: 'Booked', style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
    { id: 'e8', source: 'recommend', target: 'add-note', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
];

export const RESTAURANT_LOGS: Record<string, string[]> = {
    'start': ['New reservation request', 'Party of 4 on Friday', 'Request received'],
    'check-tables': ['Checking available tables', 'Filtering for 4+ seating', '2 outdoor options found'],
    'check-vip': ['Checking loyalty status', 'Gold member detected', 'VIP perks unlocked'],
    'check-special': ['Checking Friday specials', 'Live Jazz Night confirmed', 'Seafood special available'],
    'recommend': ['Analyzing all options', 'Patio #3 is perfect for VIP', 'Premium experience ready'],
    'confirm': ['Sending VIP confirmation', 'Including special welcome', 'Guest notified'],
    'add-note': ['Alerting kitchen', 'VIP treatment flagged', 'Chef acknowledged'],
};

export const RESTAURANT_TRACE = [
    ['start'],
    ['check-tables', 'check-vip', 'check-special'],
    ['recommend'],
    ['confirm', 'add-note'],
];

// ========== LEGAL CONSULTATION WORKFLOW ==========
// Pattern: Staggered cascade flowing down-right with loop
export const LEGAL_NODES: AppNode[] = [
    {
        id: 'start',
        type: 'glass',
        position: { x: 50, y: 50 },
        data: {
            label: 'New Inquiry',
            subline: 'Client submits question',
            icon: 'Database',
            category: 'trigger',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '< 1s' },
            inputType: 'Web Form',
            outputType: 'Case Details',
            inputs: {},
            outputs: { type: 'Contract Review', urgency: 'Standard' }
        },
    },
    {
        id: 'classify',
        type: 'glass',
        position: { x: 450, y: 50 },
        data: {
            label: 'Classify Case',
            subline: 'AI determines case type',
            icon: 'Brain',
            category: 'agent',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { model: 'Gemini AI', confidence: 0.94 },
            inputType: 'Case Details',
            outputType: 'Classification',
            inputs: { query: 'Need help reviewing employment contract' }
        },
    },
    {
        id: 'research',
        type: 'glass',
        position: { x: 850, y: 50 },
        data: {
            label: 'Legal Research',
            subline: 'Search relevant precedents',
            icon: 'Search',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '2s' },
            inputType: 'Case Type',
            outputType: 'Precedents',
            outputs: { cases: 5, relevance: 'High' }
        },
    },
    {
        id: 'match-lawyer',
        type: 'glass',
        position: { x: 850, y: 250 },
        data: {
            label: 'Match Expert',
            subline: 'Find specialist lawyer',
            icon: 'Stethoscope',
            category: 'tool',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.5s' },
            inputType: 'Specialization',
            outputType: 'Lawyer Match',
            outputs: { matched: 'Ms. Sarah Chen', specialty: 'Employment Law' }
        },
    },
    {
        id: 'review',
        type: 'glass',
        position: { x: 850, y: 450 },
        data: {
            label: 'Lawyer Review',
            subline: 'Human approval step',
            icon: 'CheckCircle2',
            category: 'trigger',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: 'Manual' },
            inputType: 'Case Brief',
            outputType: 'Approval',
        },
    },
    {
        id: 'schedule-call',
        type: 'glass',
        position: { x: 1300, y: 350 },
        data: {
            label: 'Schedule Call',
            subline: 'Book consultation',
            icon: 'Zap',
            category: 'action',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '1s' },
            inputType: 'Approval',
            outputType: 'Meeting Set',
        },
    },
    {
        id: 'send-docs',
        type: 'glass',
        position: { x: 1300, y: 550 },
        data: {
            label: 'Send Documents',
            subline: 'Share case materials',
            icon: 'FileText',
            category: 'action',
            status: NodeStatus.IDLE,
            logs: [],
            metadata: { executionTime: '0.5s' },
            inputType: 'Case Brief',
            outputType: 'Docs Shared',
        },
    },
];

export const LEGAL_EDGES: AppEdge[] = [
    { id: 'e1', source: 'start', target: 'classify', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
    { id: 'e2', source: 'classify', target: 'research', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
    { id: 'e3', source: 'research', target: 'match-lawyer', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
    { id: 'e4', source: 'match-lawyer', target: 'review', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
    { id: 'e5-loop', source: 'review', target: 'research', type: 'smoothstep', animated: false, label: 'More info', style: { stroke: '#64748b', strokeWidth: 1, strokeDasharray: '5,5' } },
    { id: 'e6', source: 'review', target: 'schedule-call', type: 'smoothstep', animated: true, label: 'Approved', style: { stroke: '#10b981', strokeWidth: 1.5 } },
    { id: 'e7', source: 'review', target: 'send-docs', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 1.5 } },
];

export const LEGAL_LOGS: Record<string, string[]> = {
    'start': ['New legal inquiry received', 'Contract review request', 'Case details captured'],
    'classify': ['Analyzing case type', 'Category: Employment Law', 'Urgency: Standard'],
    'research': ['Searching legal database', 'Finding relevant precedents', '5 relevant cases found'],
    'match-lawyer': ['Matching with specialists', 'Found: Ms. Sarah Chen', '10+ years experience'],
    'review': ['Lawyer reviewing case', 'Checking availability', 'Case accepted'],
    'schedule-call': ['Checking calendar', 'Booking consultation', 'Call set for Thursday 2PM'],
    'send-docs': ['Preparing documents', 'Secure file sharing', 'Client & lawyer notified'],
};

export const LEGAL_TRACE = [
    ['start'],
    ['classify'],
    ['research'],
    ['match-lawyer'],
    ['review'],
    ['schedule-call', 'send-docs'],
];

// Use case configurations
export const USE_CASES = {
    doctor: {
        id: 'doctor',
        name: 'Doctor',
        description: 'AI handles patient scheduling',
        icon: 'Stethoscope',
        color: 'indigo',
        nodes: DOCTOR_NODES,
        edges: DOCTOR_EDGES,
        logs: DOCTOR_LOGS,
        trace: DOCTOR_TRACE,
    },
    restaurant: {
        id: 'restaurant',
        name: 'Restaurant',
        description: 'Smart table reservations',
        icon: 'Layout',
        color: 'amber',
        nodes: RESTAURANT_NODES,
        edges: RESTAURANT_EDGES,
        logs: RESTAURANT_LOGS,
        trace: RESTAURANT_TRACE,
    },
    legal: {
        id: 'legal',
        name: 'Legal',
        description: 'Case intake & matching',
        icon: 'FileText',
        color: 'emerald',
        nodes: LEGAL_NODES,
        edges: LEGAL_EDGES,
        logs: LEGAL_LOGS,
        trace: LEGAL_TRACE,
    },
};

export type UseCaseId = keyof typeof USE_CASES;
