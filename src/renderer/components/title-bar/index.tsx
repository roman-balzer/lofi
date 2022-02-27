import './style.scss';

import React, { FunctionComponent } from 'react';

import { CloseButton } from '../close-button';

interface Props {
  onClose: () => void;
}

export const TitleBar: FunctionComponent<Props> = ({ onClose }) => (
  <div className="titlebar">
    <div className="full draggable">&nbsp;</div>
    <div className="close-wrapper">
      <CloseButton onClose={onClose} />
    </div>
  </div>
);
