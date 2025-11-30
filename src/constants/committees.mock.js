// Mock data for committees
export const MOCK_COMMITTEES = [
  {
    id: 1,
    name: 'Strategic Planning Committee',
    status: 'active',
    memberCount: 12,
    createdDate: '2024-01-15T10:00:00Z',
    totalMeetings: 24,
    upcomingMeetings: 3,
    completedMeetings: 21,
    nextMeetingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    isMeetingActive: false,
  },
  {
    id: 2,
    name: 'Budget Review Committee',
    status: 'active',
    memberCount: 8,
    createdDate: '2024-02-10T09:00:00Z',
    totalMeetings: 18,
    upcomingMeetings: 2,
    completedMeetings: 16,
    nextMeetingDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    isMeetingActive: true,
  },
  {
    id: 3,
    name: 'Risk Management Committee',
    status: 'active',
    memberCount: 15,
    createdDate: '2024-03-05T11:00:00Z',
    totalMeetings: 30,
    upcomingMeetings: 4,
    completedMeetings: 26,
    nextMeetingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    isMeetingActive: false,
  },
  {
    id: 4,
    name: 'Quality Assurance Committee',
    status: 'archived',
    memberCount: 10,
    createdDate: '2023-11-20T08:00:00Z',
    totalMeetings: 45,
    upcomingMeetings: 0,
    completedMeetings: 45,
    nextMeetingDate: null,
    isMeetingActive: false,
  },
  {
    id: 5,
    name: 'Innovation Committee',
    status: 'active',
    memberCount: 6,
    createdDate: '2024-04-12T13:00:00Z',
    totalMeetings: 12,
    upcomingMeetings: 1,
    completedMeetings: 11,
    nextMeetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    isMeetingActive: false,
  },
];

// Helper function to count meetings for today
const getMeetingsForToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return MOCK_COMMITTEES.filter(committee => {
    if (!committee.nextMeetingDate) return false;
    const meetingDate = new Date(committee.nextMeetingDate);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today && meetingDate < tomorrow;
  }).length;
};

// Mock KPIs
export const MOCK_KPIS = {
  totalCommittees: MOCK_COMMITTEES.length,
  totalMeetings: MOCK_COMMITTEES.reduce((sum, committee) => sum + committee.totalMeetings, 0),
  myTasksCount: 8,
  meetingsToday: getMeetingsForToday(),
};

// Mock user permissions
export const MOCK_USER_PERMISSIONS = ['can_manage_committees', 'can_view_committees', 'can_create_meetings'];
