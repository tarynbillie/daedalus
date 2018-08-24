import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import globalMessages from '../../../../i18n/global-messages';
import StoryDecorator from '../../../../../../../storybook/stories/support/StoryDecorator';
import LocalizableError from '../../../../i18n/LocalizableError';
import GeneralSettings from '../GeneralSettings';

const languages = [
  { value: 'en-US', label: globalMessages.languageEnglish },
  { value: 'ja-JP', label: globalMessages.languageJapanese },
];

const languageSelected = action('Language selected');

storiesOf('Settings/GeneralSettings', module)
  .addDecorator(story => <StoryDecorator>{story()}</StoryDecorator>)
  .add('default', () => (
    <GeneralSettings
      languages={languages}
      currentLocale="en-US"
      onSelectLanguage={languageSelected}
    />
  ))
  .add('submitting', () => (
    <GeneralSettings
      languages={languages}
      currentLocale="en-US"
      onSelectLanguage={languageSelected}
      isSubmitting
    />
  ))
  .add('With error', () => (
    <GeneralSettings
      languages={languages}
      currentLocale="en-US"
      onSelectLanguage={languageSelected}
      error={new LocalizableError(globalMessages.fieldIsRequired)}
    />
  ));
