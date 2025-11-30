import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './en/common.json';
import enHome from './en/home.json';
import enNavbar from './en/navbar.json';
import enCommitteeForm from './en/committeeForm.json';
import enSidebar from './en/sidebar.json';
import enOverview from './en/overview.json';
import enMembers from './en/members.json';
import enMeetings from './en/meetings.json';
import enMeetingDetails from './en/meetingDetails.json';
import enTasks from './en/tasks.json';
import enCouncilForm from './en/councilForm.json';
import enMeetingForm from './en/meetingForm.json';
import enNews from './en/news.json';
import enAnnouncementForm from './en/announcementForm.json';
import enTaskForm from './en/taskForm.json';
import enVoting from './en/voting.json';
import enVoteForm from './en/voteForm.json';
import enCalendar from './en/calendar.json';
import enMessages from './en/messages.json';

import arCommon from './ar/common.json';
import arHome from './ar/home.json';
import arNavbar from './ar/navbar.json';
import arCommitteeForm from './ar/committeeForm.json';
import arSidebar from './ar/sidebar.json';
import arOverview from './ar/overview.json';
import arMembers from './ar/members.json';
import arMeetings from './ar/meetings.json';
import arMeetingDetails from './ar/meetingDetails.json';
import arTasks from './ar/tasks.json';
import arCouncilForm from './ar/councilForm.json';
import arMeetingForm from './ar/meetingForm.json';
import arNews from './ar/news.json';
import arAnnouncementForm from './ar/announcementForm.json';
import arTaskForm from './ar/taskForm.json';
import arVoting from './ar/voting.json';
import arVoteForm from './ar/voteForm.json';
import arCalendar from './ar/calendar.json';
import arMessages from './ar/messages.json';

const savedLang = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        navbar: enNavbar,
        committeeForm: enCommitteeForm,
        sidebar: enSidebar,
        overview: enOverview,
        members: enMembers,
        meetings: enMeetings,
        meetingDetails: enMeetingDetails,
        tasks: enTasks,
        councilForm: enCouncilForm,
        meetingForm: enMeetingForm,
        news: enNews,
        announcementForm: enAnnouncementForm,
        taskForm: enTaskForm,
        voting: enVoting,
        voteForm: enVoteForm,
        calendar: enCalendar,
        messages: enMessages,
      },
      ar: {
        common: arCommon,
        home: arHome,
        navbar: arNavbar,
        committeeForm: arCommitteeForm,
        sidebar: arSidebar,
        overview: arOverview,
        members: arMembers,
        meetings: arMeetings,
        meetingDetails: arMeetingDetails,
        tasks: arTasks,
        councilForm: arCouncilForm,
        meetingForm: arMeetingForm,
        news: arNews,
        announcementForm: arAnnouncementForm,
        taskForm: arTaskForm,
        voting: arVoting,
        voteForm: arVoteForm,
        calendar: arCalendar,
        messages: arMessages,
      },
    },
    lng: savedLang,
    fallbackLng: 'en',
    ns: [
      'common',
      'home',
      'navbar',
      'committeeForm',
      'sidebar',
      'overview',
      'members',
      'meetings',
      'meetingDetails',
      'tasks',
      'councilForm',
      'meetingForm',
      'news',
      'announcementForm',
      'taskForm',
      'voting',
      'voteForm',
      'calendar',
      'messages',
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
