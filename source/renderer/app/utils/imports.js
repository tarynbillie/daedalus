// @flow
import environment from '../../../common/environment';

// resolver loads files relative to '/app/' directory
const resolver = (path: string) => {
  const envPathSubdir = environment.API || '';
  const envPathSegments = path.split('/');
  envPathSegments.splice(-1, 0, envPathSubdir);
  const envPath = envPathSegments.join('/');
  let file;
  try {
    file = require(`../${envPath}`); // eslint-disable-line
  } catch (e) {
    console.error(e);
    file = require(`../${path}`); // eslint-disable-line
  }
  return file.default || file;
};

export default resolver;
