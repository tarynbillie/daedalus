// @flow strict
import { BigNumber } from 'bignumber.js';

import type { EtcTransaction } from './EtcTransaction';

export type EtcAccountPassphrase = string;
export type EtcWalletId = string;
export type EtcWalletBalance = BigNumber;
export type EtcBlockNumber = number;
export type EtcGas = string;
export type EtcGasPrice = BigNumber;
export type EtcTxHash = string;

export type EtcRecoveryPassphrase = Array<string>;

export type EtcAccounts = EtcWalletId[];

export type EtcBlockResponse = ?{
  number: BigNumber,
  hash: ?string,
  parentHash: string,
  nonce: ?string,
  sha3Uncles: string,
  logsBloom: string,
  transactionsRoot: string,
  stateRoot: string,
  receiptsRoot: string,
  miner: ?string,
  difficulty: BigNumber,
  totalDifficulty: ?BigNumber,
  extraData: string,
  size: BigNumber,
  gasLimit: BigNumber,
  gasUsed: BigNumber,
  timestamp: string,
  transactions: Array<string> | Array<EtcTransaction>,
  uncles: Array<string>
}

export type EtcBlock = {
  timestamp: string,
};

export type EtcSyncProgress = ?{
  startingBlock: BigNumber, // number in hex
  currentBlock: BigNumber,
  highestBlock: BigNumber,
};
