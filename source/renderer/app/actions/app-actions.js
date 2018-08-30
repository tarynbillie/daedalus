// @flow strict
import Action from './lib/Action';

// ======= APP ACTIONS =======

export default class AppActions {
  openAboutDialog: Action<void> = new Action();
  closeAboutDialog: Action<void> = new Action();
  getGpuStatus: Action<void> = new Action();
}
