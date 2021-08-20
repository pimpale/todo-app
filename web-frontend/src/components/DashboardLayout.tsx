import React from 'react';
import { ColumnsGap, CalendarEvent, Gear, Search, Person} from 'react-bootstrap-icons';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

import InnerLayout from '../components/InnerLayout';

export default function DashboardLayout(props: React.PropsWithChildren<AuthenticatedComponentProps>) {
  return <InnerLayout apiKey={props.apiKey} logoutCallback={() => props.setApiKey(null)} >
    <InnerLayout.SidebarEntry label="Dashboard" icon={ColumnsGap} href="/dashboard" />
    <InnerLayout.SidebarEntry label="Calendar" icon={CalendarEvent} href="/calendar" />
    <InnerLayout.SidebarEntry label="Search" icon={Search} href="/search" />
    <InnerLayout.SidebarEntry label="Settings" icon={Gear} href="/settings" />
    <InnerLayout.SidebarEntry label="Account" icon={Person} href="/account" />
    <InnerLayout.Body>
      {props.children}
    </InnerLayout.Body>
  </InnerLayout>
}
