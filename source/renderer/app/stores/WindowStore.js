// @flow
import { ipcRenderer } from 'electron';

import environment from '../../../common/environment';

import Store from './lib/Store';

export default class WindowStore extends Store {

  setup() {
    this.actions.window.resizeWindow.listen(this._resizeWindow);
  }

  // PRIVATE

  _resizeWindow = ({ width, height }: { width: number, height: number }) => {
    ipcRenderer.send('resize-window', { width, height, animate: !environment.isTest() });
  };

}
