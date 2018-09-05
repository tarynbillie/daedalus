import LocalizableError from '../../i18n/LocalizableError';

import CachedRequest from './CachedRequest';

// eslint-disable-next-line
export default class LocalizedCachedRequest<Result> extends CachedRequest<Result, LocalizableError> {}
