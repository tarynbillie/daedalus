// @flow strict
import AdaApi from './ada/index';
import EtcApi from './etc/index';
import LocalStorageApi from './localStorage/index';
import { EtcERC20TokenApi } from '../tokens/services/EtcERC20TokenApi';

export type Api = {
  ada: AdaApi,
  etc: EtcApi,
  etcContract: EtcERC20TokenApi,
  localStorage: LocalStorageApi,
};

export const setupApi = (): Api => ({
  ada: new AdaApi(),
  etc: new EtcApi(),
  etcContract: new EtcERC20TokenApi(),
  localStorage: new LocalStorageApi(),
});
