import './style.scss';

import React, { FunctionComponent } from 'react';

interface Props {
  onClose: () => void;
}

export const CloseButton: FunctionComponent<Props> = ({ onClose }) => (
  <button type="button" onClick={onClose} className="unstyled-button close-button">
    <i className="no-move fa-sharp fa-solid fa-circle-xmark" />
  </button>
);
