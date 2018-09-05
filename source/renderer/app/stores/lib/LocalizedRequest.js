import LocalizableError from '../../i18n/LocalizableError';

import Request from './Request';

export default class LocalizedRequest<Result> extends Request<Result, LocalizableError> {}
