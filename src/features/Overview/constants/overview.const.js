// Mock data for Committee Overview Page

export const MOCK_COMMITTEE_INFO = {
  id: 1,
  englishName: 'Executive Committee',
  arabicName: 'اللجنة التنفيذية',
  status: 'active', // active, archived, expired
  formationDate: '2024-01-15',
  chairperson: {
    id: 1,
    englishName: 'ALJAWHARY Fadi',
    arabicName: 'ALJAWHARY Fadi',
    email: 'john.smith@example.com',
  },
  viceChairperson: {
    id: 2,
    englishName: 'QUBLAN Anas',
    arabicName: 'QUBLAN Anas',
    email: 'sarah.johnson@example.com',
  },
  totalMembers: 12,
  totalMeetings: 24,
  description: 'The Executive Committee is responsible for overseeing the strategic direction and day-to-day operations of the organization.',
  arabicDescription: 'اللجنة التنفيذية مسؤولة عن الإشراف على الاتجاه الاستراتيجي والعمليات اليومية للمنظمة.',
};

export const MOCK_KPIS = {
  meetingsThisMonth: 3,
  decisionsPending: 5,
  activeVotes: 2,
  tasksInProgress: 8,
  tasksOverdue: 2,
  nextMeetingCountdown: '2 days, 5 hours',
};

export const MOCK_UPCOMING_MEETING = {
  id: 1,
  englishName: 'Monthly Review Meeting',
  arabicName: 'اجتماع المراجعة الشهرية',
  date: '2024-12-20',
  startTime: '10:00',
  endTime: '12:00',
  status: 'online', // online, onsite
  link: 'https://meet.example.com/abc123',
  location: null,
  agenda: [
    { id: 1, title: 'Review Q4 Performance', arabicTitle: 'مراجعة أداء الربع الرابع' },
    { id: 2, title: 'Budget Discussion', arabicTitle: 'مناقشة الميزانية' },
    { id: 3, title: 'Strategic Planning', arabicTitle: 'التخطيط الاستراتيجي' },
  ],
};

export const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'task',
    title: 'New task created: "Review Q4 Report"',
    arabicTitle: 'تم إنشاء مهمة جديدة: "مراجعة تقرير الربع الرابع"',
    user: 'Ahmed Ali',
    timestamp: '2024-12-18T14:30:00',
    icon: 'CheckSquare',
  },
  {
    id: 2,
    type: 'decision',
    title: 'Decision approved: "Budget Allocation"',
    arabicTitle: 'تم الموافقة على القرار: "تخصيص الميزانية"',
    user: 'QUBLAN Anas',
    timestamp: '2024-12-18T10:15:00',
    icon: 'FileCheck',
  },
  {
    id: 3,
    type: 'vote',
    title: 'Vote opened: "New Policy Proposal"',
    arabicTitle: 'تم فتح التصويت: "اقتراح سياسة جديدة"',
    user: 'ABUARQOB Mujahed',
    timestamp: '2024-12-17T16:45:00',
    icon: 'Target',
  },
  {
    id: 4,
    type: 'member',
    title: 'New member added: "Mohammed Hassan"',
    arabicTitle: 'تم إضافة عضو جديد: "محمد حسن"',
    user: 'Admin',
    timestamp: '2024-12-17T09:20:00',
    icon: 'UserPlus',
  },
  {
    id: 5,
    type: 'document',
    title: 'Document uploaded: "Meeting Minutes - Dec 2024"',
    arabicTitle: 'تم رفع المستند: "محضر الاجتماع - ديسمبر 2024"',
    user: 'Ahmed Ali',
    timestamp: '2024-12-16T15:30:00',
    icon: 'FileText',
  },
  {
    id: 6,
    type: 'task',
    title: 'Task completed: "Prepare Annual Report"',
    arabicTitle: 'تم إكمال المهمة: "إعداد التقرير السنوي"',
    user: 'Fatima Ahmed',
    timestamp: '2024-12-16T11:00:00',
    icon: 'CheckCircle',
  },
];

export const MOCK_QUICK_ACTIONS = [
  {
    id: 1,
    label: 'Create Meeting',
    arabicLabel: 'إنشاء اجتماع',
    icon: 'Calendar',
    route: '/meetings/create',
  },
  {
    id: 2,
    label: 'Add Member',
    arabicLabel: 'إضافة عضو',
    icon: 'UserPlus',
    route: '/members/add',
  },
  {
    id: 3,
    label: 'Add Document',
    arabicLabel: 'إضافة مستند',
    icon: 'FileText',
    route: '/documents/upload',
  },
  {
    id: 4,
    label: 'Create Decision',
    arabicLabel: 'إنشاء قرار',
    icon: 'FileCheck',
    route: '/decisions/create',
  },
  {
    id: 5,
    label: 'Create Task',
    arabicLabel: 'إنشاء مهمة',
    icon: 'CheckSquare',
    route: '/tasks/create',
  },
];
