import React from 'react';
import { Dashboard, Event, Settings} from '@material-ui/icons';

import InnerLayout from '../components/InnerLayout';

export default function DashboardLayout(props: React.PropsWithChildren<AuthenticatedComponentProps>) {
  return (<InnerLayout name={props.apiKey.creator.name} logoutCallback={() => props.setApiKey(null)} >
    <InnerLayout.SidebarEntry label="Dashboard" icon={Dashboard} href="/" />
    <InnerLayout.SidebarEntry label="Calendar" icon={Event} href="/calendar" />
    <InnerLayout.SidebarEntry label="Settings" icon={Settings} href="/settings" />
    <InnerLayout.Body>
      {props.children}
    </InnerLayout.Body>
  </InnerLayout>)
}
