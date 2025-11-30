import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PermissionProtectedRoute from './PermissionProtectedRoute';

const LandingPage = lazy(() => import('../pages/Landing/LandingPage.jsx'));
const HomePage = lazy(() => import('../pages/Home/HomePage.jsx'));
const NotificationsPage = lazy(() => import('../pages/Notifcations/NotificationsPage'));
const CreateCommitteeForm = lazy(() => import('../forms/CommitteeForm'));
const UpdateCommitteeForm = lazy(() => import('../forms/CommitteeForm'));
const CreateCouncilForm = lazy(() => import('../forms/CouncilForm'));
const UpdateCouncilForm = lazy(() => import('../forms/CouncilForm'));
const CreateMeetingForm = lazy(() => import('../forms/MeetingForm'));
const UpdateMeetingForm = lazy(() => import('../forms/MeetingForm'));
const CreateAnnouncementForm = lazy(() => import('../forms/AnnouncementForm'));
const UpdateAnnouncementForm = lazy(() => import('../forms/AnnouncementForm'));
const CreateTaskForm = lazy(() => import('../forms/TaskForm'));
const UpdateTaskForm = lazy(() => import('../forms/TaskForm'));
const CreateVoteForm = lazy(() => import('../forms/VoteForm'));
const UpdateVoteForm = lazy(() => import('../forms/VoteForm'));

// Sidebar pages
const OverviewPage = lazy(() => import('../pages/Overview/OverviewPage'));
const MembersPage = lazy(() => import('../pages/Members/MembersPage'));
const MeetingsPage = lazy(() => import('../pages/Meetings/MeetingsPage'));
const DecisionsPage = lazy(() => import('../pages/Decisions/DecisionsPage'));
const VotingPage = lazy(() => import('../pages/Voting/VotingPage'));
const TasksPage = lazy(() => import('../pages/Tasks/TasksPage'));
const DocumentsPage = lazy(() => import('../pages/Documents/DocumentsPage'));
const NewsPage = lazy(() => import('../pages/News/NewsPage'));
const CalendarPage = lazy(() => import('../pages/Calendar/CalendarPage'));
const RequestsPage = lazy(() => import('../pages/Requests/RequestsPage'));
const MessagesPage = lazy(() => import('../pages/Messages/MessagesPage'));

// Details Pages
const MeetingsDetailsPage = lazy(() => import('../pages/MeetingsDetails/MeetingsDetailsPage'));
const NewsDetailsPage = lazy(() => import('../pages/News/NewsDetailsPage'));

import { PRIVATE_ROUTES } from '../constants';

const pageComponents = {
  LandingPage,
  HomePage,
  NotificationsPage,
  CreateCommitteeForm,
  UpdateCommitteeForm,
  CreateCouncilForm,
  UpdateCouncilForm,
  CreateMeetingForm,
  UpdateMeetingForm,
  CreateAnnouncementForm,
  UpdateAnnouncementForm,
  CreateTaskForm,
  UpdateTaskForm,
  CreateVoteForm,
  UpdateVoteForm,
  // Sidebar pages
  OverviewPage,
  MembersPage,
  MeetingsPage,
  DecisionsPage,
  VotingPage,
  TasksPage,
  DocumentsPage,
  NewsPage,
  CalendarPage,
  RequestsPage,
  MessagesPage,
  // Details Pages
  MeetingsDetailsPage,
  NewsDetailsPage,
};

export default PRIVATE_ROUTES?.map(route => {
  if (route?.permission) {
    return (
      <Route
        key={route?.key}
        path={route?.path}
        element={<PermissionProtectedRoute permission={route.permission}>{React.createElement(pageComponents[route?.element])}</PermissionProtectedRoute>}
      />
    );
  }

  // Otherwise, render normal route
  return <Route key={route?.key} path={route?.path} element={React.createElement(pageComponents[route?.element])} />;
});
