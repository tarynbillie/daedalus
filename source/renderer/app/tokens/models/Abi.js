import { pipe, prop } from 'ramda';
import utils from 'web3-utils';

export const signatureOf = abiEntry => `${abiEntry.name}(${abiEntry.inputs.map(prop('type')).join(',')})`;
export const topicOf = pipe(signatureOf, utils.sha3);
