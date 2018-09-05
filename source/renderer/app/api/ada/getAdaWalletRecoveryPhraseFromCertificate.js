// @flow
import { unscramblePaperWalletMnemonic } from '../../utils/crypto';

import type { AdaWalletRecoveryPhraseFromCertificateResponse } from './types';

export type GetAdaWalletRecoveryPhraseFromCertificateParams = {
  passphrase: string, // 9-word mnemonic
  scrambledInput: string, // 18-word scrambled mnemonic
};

export const getAdaWalletRecoveryPhraseFromCertificate = (
  { passphrase, scrambledInput }: GetAdaWalletRecoveryPhraseFromCertificateParams
): AdaWalletRecoveryPhraseFromCertificateResponse => (
  unscramblePaperWalletMnemonic(passphrase, scrambledInput)
);
