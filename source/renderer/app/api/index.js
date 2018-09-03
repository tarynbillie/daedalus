// @flow strict
import { remote } from 'electron';

import { EtcERC20TokenApi } from '../tokens/services/EtcERC20TokenApi';

import AdaApi from './ada/index';
import { EthRpc } from './etc/EthRpc';
import { EtcApi } from './etc/index';
import { request } from './etc/lib/request';
import LocalStorageApi from './localStorage/index';

const ca = remote.getGlobal('ca');

// export const ETC_API_HOST = 'ec2-52-30-28-57.eu-west-1.compute.amazonaws.com';
export const ETC_API_HOST = 'localhost';
export const ETC_API_PORT = 8546;

export type Api = {
  ada: AdaApi,
  etc: EtcApi,
  etcContract: EtcERC20TokenApi,
  localStorage: LocalStorageApi,
  ethRpc: EthRpc,
};

export const setupApi = (): Api => {
  const ethRpc = new EthRpc(request, ca, ETC_API_HOST, ETC_API_PORT);
  return ({
    ada: new AdaApi(),
    etc: new EtcApi(ethRpc),
    etcContract: new EtcERC20TokenApi(ethRpc),
    localStorage: new LocalStorageApi(),
    ethRpc,
  });
};
