// @flow strict
import { filter, prop } from 'ramda';
import utils from 'web3-utils';

type AbiType = 'address' | 'string' | 'bytes' | 'bool' | 'uint8' | 'uint256';

type InputOutputAbi = {
  name: string,
  type: AbiType
};

export type ContractEventAbi = { type: 'event', name: string, inputs: InputOutputAbi[] };
export type ContractFunctionAbi = {
  type: 'function',
  name: string,
  inputs: InputOutputAbi[],
  outputs: InputOutputAbi[]
};

export type ContractMemberAbi =
  | { type: 'constructor', name?: void }
  | ContractFunctionAbi
  | ContractEventAbi
  | { type: 'fallback', name?: void };
export type ContractAbi = ContractMemberAbi[];

export const signatureOf = (abiEntry: ContractEventAbi | ContractFunctionAbi): string =>
  `${abiEntry.name}(${abiEntry.inputs.map(prop('type')).join(',')})`;

export const topicOf = (eventAbi: ContractEventAbi): string => utils.sha3(signatureOf(eventAbi));

export const onlyFunctions = (abi: ContractAbi): ContractFunctionAbi[] =>
  // $FlowIssue, again...
  filter(member => member.type === 'function', abi);

export const onlyEvents = (abi: ContractAbi): ContractEventAbi[] =>
  // $FlowIssue, again...
  filter(member => member.type === 'event', abi);
