// @flow
import { generateMnemonic } from '../../utils/crypto';

import type { AdaWalletRecoveryPhraseResponse } from './types';

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse => (
  generateMnemonic().split(' ')
);
