// @flow
import { remote } from 'electron';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

import { generateFileNameWithTimestamp } from '../../../../../common/fileName';
import BugReportDialog from '../../../components/profile/bug-report/BugReportDialog';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

const shell = require('electron').shell;

@inject('stores', 'actions') @observer
export default class SupportSettingsPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  handleExternalLinkClick = (event: SyntheticMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (event.currentTarget.href) shell.openExternal(event.currentTarget.href);
  };

  handleSupportRequestClick = () => {
    this.props.actions.dialogs.open.trigger({
      dialog: BugReportDialog,
    });
  };

  handleDownloadLogs = () => {
    const fileName = generateFileNameWithTimestamp();
    const destination = remote.dialog.showSaveDialog({
      defaultPath: fileName,
    });
    if (destination) {
      this.props.actions.profile.downloadLogs.trigger({ fileName, destination, fresh: true });
    }
  };

  render() {
    return (
      <SupportSettings
        onExternalLinkClick={this.handleExternalLinkClick}
        onSupportRequestClick={this.handleSupportRequestClick}
        onDownloadLogs={this.handleDownloadLogs}
      />
    );
  }

}
