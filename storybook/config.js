// @flow
import { configure } from '@storybook/react';

// $FlowIssue
const componentStories = require.context('../source/renderer', true, /story\.jsx?$/);

function loadStories() {
  require('./stories');
  componentStories.keys().forEach(componentStories);
}

configure(loadStories, module);
