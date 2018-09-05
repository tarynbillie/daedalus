// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';

import Staking from '../../source/renderer/app/components/staking/Staking';
import StakingSwitch from '../../source/renderer/app/components/staking/StakingSwitch';

import StoryDecorator from './support/StoryDecorator';

storiesOf('Staking', module)

  .addDecorator((story, context) => (
    <StoryDecorator>
      {story(context)}
    </StoryDecorator>
  ))

  // ====== Stories ======

  .add('Switches', () => (
    <div>
      <StakingSwitch active={false} />
      <StakingSwitch active />
    </div>
  ))

  .add('StakingPage', () => (
    <div>
      <Staking />
    </div>
  ));
