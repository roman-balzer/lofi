import './style.scss';

import React, { FunctionComponent } from 'react';

import { VisualizationType } from '../../../models/settings';
import { LoginButton } from '../../components/login-button';
import Menu from '../cover/menu';

export const Welcome: FunctionComponent = () => {
  return (
    <div className="welcome full">
      <Menu isWelcome visualizationType={VisualizationType.None} />
      <div className="centered welcome-pane">
        <div style={{ margin: 'auto' }}>
          <h2 className="brand">
            lo
            <span className="brand-highlight">fi</span>
          </h2>
          <div className="brand-tagline">a tiny player</div>
        </div>
      </div>
      <div className="centered controls">
        <div className="centered controls">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};
