// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import InstructionsDialog from '../../components/wallet/paper-wallet-certificate/InstructionsDialog';
import PrintDialog from '../../components/wallet/paper-wallet-certificate/PrintDialog';
import SecuringPasswordDialog from '../../components/wallet/paper-wallet-certificate/SecuringPasswordDialog';
import VerificationDialog from '../../components/wallet/paper-wallet-certificate/VerificationDialog';
import CompletionDialog from '../../components/wallet/paper-wallet-certificate/CompletionDialog';
import ConfirmationDialog from '../../components/wallet/paper-wallet-certificate/ConfirmationDialog';
import type { InjectedProps } from '../../types/injectedPropsType';

import CompletionDialogContainer from './dialogs/paper-wallet-certificate/CompletionDialogContainer';
import VerificationDialogContainer from './dialogs/paper-wallet-certificate/VerificationDialogContainer';
import SecuringPasswordDialogContainer from './dialogs/paper-wallet-certificate/SecuringPasswordDialogContainer';
import PrintDialogContainer from './dialogs/paper-wallet-certificate/PrintDialogContainer';
import InstructionsDialogContainer from './dialogs/paper-wallet-certificate/InstructionsDialogContainer';

type Props = InjectedProps;

type State = {
  currentStep: ?number,
  showConfirmationDialog: boolean,
};

@inject('actions', 'stores') @observer
export default class PaperWalletCreateCertificatePage extends Component<Props, State> {

  static defaultProps = { actions: null, stores: null };

  componentWillReceiveProps(nextProps: Props) {
    const stepChanged = nextProps.stores.ada.wallets.certificateStep !== this.state.currentStep;
    if (nextProps.stores.ada.wallets.certificateStep && stepChanged) {
      this.onContinue(nextProps.stores.ada.wallets.certificateStep);
    }
  }

  CREATE_CERTIFICATE_DIALOGS = [
    'instructions',
    'print',
    'securingPassword',
    'verification',
    'completion',
  ];

  state = {
    currentStep: 0,
    showConfirmationDialog: false,
  };

  render() {
    const { uiDialogs } = this.props.stores;
    const { showConfirmationDialog } = this.state;
    let activeDialog = null;

    if (uiDialogs.isOpen(InstructionsDialog)) {
      activeDialog = (
        <InstructionsDialogContainer
          onContinue={this.onContinue}
          onClose={this.onClose}
        />
      );
    }

    if (uiDialogs.isOpen(PrintDialog)) {
      activeDialog = (
        <PrintDialogContainer
          onContinue={this.onContinue}
          onClose={this.showConfirmationDialog}
        />
      );
    }

    if (uiDialogs.isOpen(SecuringPasswordDialog)) {
      activeDialog = (
        <SecuringPasswordDialogContainer
          onContinue={this.onContinue}
          onClose={this.showConfirmationDialog}
        />
      );
    }

    if (uiDialogs.isOpen(VerificationDialog)) {
      activeDialog = (
        <VerificationDialogContainer
          onContinue={this.onContinue}
          onClose={this.showConfirmationDialog}
        />
      );
    }

    if (uiDialogs.isOpen(CompletionDialog)) {
      activeDialog = (
        <CompletionDialogContainer
          onClose={this.onClose}
        />
      );
    }

    return (
      <div>
        {activeDialog}
        {showConfirmationDialog && (
          <ConfirmationDialog
            onCancel={this.hideConfirmationDialog}
            onConfirm={this.onClose}
          />
        )}
      </div>
    );
  }

  onContinue = (nextStep: number) => {
    const nextDialog = this.CREATE_CERTIFICATE_DIALOGS[nextStep];
    this.switchDialog(nextDialog);
    this.setState({ currentStep: nextStep });
  };

  getPreviousStep = (state: State) => state.currentStep ? state.currentStep - 1 : 0;

  onBack = () => {
    const prevDialog = this.CREATE_CERTIFICATE_DIALOGS[this.getPreviousStep(this.state)];
    this.setState(prevState => ({ currentStep: this.getPreviousStep(prevState) }));
    this.switchDialog(prevDialog);
    this.props.actions.ada.wallets.updateCertificateStep.trigger(true);
  };

  onClose = () => {
    this.setState({
      currentStep: 0,
      showConfirmationDialog: false,
    });
    this.props.actions.ada.wallets.closeCertificateGeneration.trigger();
  };

  showConfirmationDialog = () => {
    this.setState({ showConfirmationDialog: true });
  };

  hideConfirmationDialog = () => {
    this.setState({ showConfirmationDialog: false });
  };

  switchDialog = (dialog: string) => {
    switch (dialog) {
      case 'instructions':
        this.props.actions.dialogs.open.trigger({
          dialog: InstructionsDialog,
        });
        break;
      case 'print':
        this.props.actions.dialogs.open.trigger({
          dialog: PrintDialog,
        });
        break;
      case 'securingPassword':
        this.props.actions.dialogs.open.trigger({
          dialog: SecuringPasswordDialog,
        });
        break;
      case 'verification':
        this.props.actions.dialogs.open.trigger({
          dialog: VerificationDialog,
        });
        break;
      case 'completion':
        this.props.actions.dialogs.open.trigger({
          dialog: CompletionDialog,
        });
        break;
      default:
        this.onClose();
    }
  };
}
