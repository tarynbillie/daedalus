// @flow
import { LOAD_ASSET_CHANNEL } from '../../../common/ipc-api/load-asset';
import type { LoadAssetRequest, LoadAssetResponse } from '../../../common/ipc-api/load-asset';

import { IpcChannel } from './lib/IpcChannel';

export const loadAssetChannel: IpcChannel<LoadAssetRequest, LoadAssetResponse> = (
  new IpcChannel(LOAD_ASSET_CHANNEL)
);
