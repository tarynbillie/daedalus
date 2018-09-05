// @flow
import { scramblePaperWalletMnemonic } from '../../utils/crypto';

import type { AdaWalletCertificateRecoveryPhraseResponse } from './types';

export type GetAdaWalletCertificateRecoveryPhraseParams = {
  passphrase: string,
  scrambledInput: string,
};

export const getAdaWalletCertificateRecoveryPhrase = (
  { passphrase, scrambledInput }: GetAdaWalletCertificateRecoveryPhraseParams
): AdaWalletCertificateRecoveryPhraseResponse => (
  scramblePaperWalletMnemonic(passphrase, scrambledInput)
);
