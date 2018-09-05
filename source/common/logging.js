// @flow
import log from 'electron-log';
import { tap } from 'ramda';

import type { Fn } from './types';

export const Logger = {

  debug: (data: string) => {
    log.debug(data);
  },

  info: (data: string) => {
    log.info(data);
  },

  error: (data: string) => {
    log.error(data);
  },

  warn: (data: string) => {
    log.info(data);
  },

};

// ========== STRINGIFY =========

export const withLogsAsync = (name: string) => (fn: Fn) => (...args: mixed[]) => {
  Logger.debug(`${name} called with: ${stringifyData(args)}`);
  return fn(...args)
    .then(tap(result => Logger.debug(`${name} succeeded with: ${stringifyData(result)}`)))
    .catch(error => {
      Logger.debug(`${name} errored with: ${stringifyError(error)}`);
      throw error;
    });
};

export const stringifyData = (data: any) => JSON.stringify(data, null, 2);

export const stringifyError = (error: any) => (
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
);
