import React from "react";
import { RouteProps } from "react-router";
import { Route } from "react-router-dom";
import BrandedComponentProps from '../components/BrandedComponentProps';
import Branding from '../components/Branding';

export interface BrandedRouteProps extends Omit<RouteProps, 'component'> {
  branding: Branding,
  component: React.ComponentType<BrandedComponentProps>
}

function BrandedRoute({
  branding,
  component: BrandedComponent,
  ...rest
}: BrandedRouteProps) {

  return (
    <Route {...rest} >
      <BrandedComponent branding={branding} />
    </Route>
  );
}

export default BrandedRoute;
