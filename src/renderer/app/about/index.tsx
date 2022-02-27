import './style.scss';

import React, { FunctionComponent } from 'react';

import { version } from '../../../../version.generated';
import { ApplicationUrl } from '../../../constants';
import { TitleBar } from '../../components/title-bar';
import { AboutLink } from './about-link';

interface Props {
  onClose: () => void;
}

export const About: FunctionComponent<Props> = ({ onClose }) => (
  <div className="about-window" id="about-window">
    <TitleBar onClose={onClose} />
    <div className="about-wrapper">
      <div className="header">
        <h1>Lofi v{version}</h1>
        <div className="links">
          <AboutLink url={ApplicationUrl.Home} icon="fa-solid fa-house" />
          <AboutLink url={ApplicationUrl.GitHub} icon="fa-brands fa-github" />
          <AboutLink url={ApplicationUrl.Discord} icon="fa-brands fa-discord" />
        </div>
      </div>

      <code>
        Copyright (c) 2019-{new Date().getFullYear()} David Titarenco
        <br />
        <br />
        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
        documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without
        limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
        Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
        <br />
        <br />
        The above copyright notice and this permission notice shall be included in all copies or substantial portions of
        the Software.
        <br />
        <br />
        THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
        LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
        SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
        OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
        DEALINGS IN THE SOFTWARE.
      </code>
    </div>
  </div>
);
