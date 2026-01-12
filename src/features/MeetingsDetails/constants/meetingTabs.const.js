import { FileText, List, Users, Paperclip, FileCheck, Gavel, CheckSquare, Vote, Video } from 'lucide-react';

export const MEETING_TABS = [
  {
    id: 'details',
    label: 'tabs.details',
    icon: FileText,
  },
  {
    id: 'agenda',
    label: 'tabs.agenda',
    icon: List,
  },
  {
    id: 'participants',
    label: 'tabs.participants',
    icon: Users,
  },
  {
    id: 'attachments',
    label: 'tabs.attachments',
    icon: Paperclip,
  },
  // {
  //   id: 'decisions',
  //   label: 'tabs.decisions',
  //   icon: Gavel,
  // },
  {
    id: 'tasks',
    label: 'tabs.tasks',
    icon: CheckSquare,
  },
  {
    id: 'votes',
    label: 'tabs.votes',
    icon: Vote,
  },
  {
    id: 'minutes',
    label: 'tabs.minutes',
    icon: FileCheck,
  },
];
