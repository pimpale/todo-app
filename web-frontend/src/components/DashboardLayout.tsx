import React from 'react';
import {
  ColumnsGap as DashboardIcon,
  CalendarEvent as CalendarIcon,
  Gear as SettingsIcon,
  Search as SearchIcon,
} from 'react-bootstrap-icons';
import { AuthenticatedComponentProps, InnerLayout  } from '@innexgo/auth-react-components';

export default function DashboardLayout(props: React.PropsWithChildren<AuthenticatedComponentProps & { authServerUrl: string }>) {
  return <InnerLayout apiKey={props.apiKey} logoutCallback={() => props.setApiKey(null)} authServerApiUrl={`${props.authServerUrl}/api/`}>
    <InnerLayout.SidebarEntry label="Dashboard" icon={DashboardIcon} href="/dashboard" />
    <InnerLayout.SidebarEntry label="Calendar" icon={CalendarIcon} href="/calendar" />
    <InnerLayout.SidebarEntry label="Search" icon={SearchIcon} href="/search" />
    <InnerLayout.SidebarEntry label="Settings" icon={SettingsIcon} href="/settings" />
    <InnerLayout.Body>
      {props.children}
    </InnerLayout.Body>
  </InnerLayout>
}
