// @flow strict
import { concat, Observable, of, throwError } from 'rxjs';
import { Logger } from '../../../common/logging';

export const restoreWith = <T>(val: T) => (err: Error, src$: Observable<T>): Observable<T> =>
  concat(of(val), src$);

export const logError = (logger: typeof Logger) => <T>(
  err: Error,
  src$: Observable<T>,
): Observable<T> => {
  logger.error(err.stack);
  return concat(throwError(err), src$);
};
