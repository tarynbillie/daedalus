// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, date, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import StoryLayout from '../_support/StoryLayout';
import StoryProvider from '../_support/StoryProvider';
import StoryDecorator from '../_support/StoryDecorator';

import { CATEGORIES_BY_NAME } from '../../../source/renderer/app/config/sidebarConfig';

import StakingWithNavigation from '../../../source/renderer/app/components/staking/layouts/StakingWithNavigation';
import StakingCountdown from '../../../source/renderer/app/components/staking/countdown/StakingCountdown';
import StakingInfo from '../../../source/renderer/app/components/staking/info/StakingInfo';
import DelegationCenterNoWallets from '../../../source/renderer/app/components/staking/delegation-center/DelegationCenterNoWallets';

import { StakePoolsStory } from './StakePools.stories';
import { StakingRewardsStory } from './Rewards.stories';
import { StakingDelegationCenterStory } from './DelegationCenter.stories';
import { StakingEpochsStory } from './Epochs.stories';
import { StakingDelegationSteps } from './DelegationSteps.stories';

const defaultPercentage = 10;
const defaultStartDateTime = new Date('2019-09-26');
const startDateTimeKnob = (name, defaultValue) => {
  const stringTimestamp = date(name, defaultValue);

  return new Date(stringTimestamp).toISOString();
};

const pageNames = {
  countdown: 'Decentralization Countdown',
  'delegation-center': 'Delegation Center',
  'stake-pools': 'Pools Index',
  'stake-pools-tooltip': 'Tooltip',
  rewards: 'Rewards',
  epochs: 'Epochs',
  info: 'Info',
};

const decorator = (story, context) => {
  const storyWithKnobs = withKnobs(story, context);
  const getItemFromContext = () => context.parameters.id;
  let activeSidebarCategory = null;

  if (context.parameters.id === 'countdown') {
    activeSidebarCategory =
      CATEGORIES_BY_NAME.STAKING_DELEGATION_COUNTDOWN.route;
  } else {
    activeSidebarCategory = CATEGORIES_BY_NAME.STAKING.route;
  }

  return (
    <StoryDecorator>
      <StoryProvider>
        <StoryLayout
          activeSidebarCategory={activeSidebarCategory}
          storyName={context.story}
        >
          {context.parameters.id === 'countdown' ||
          context.parameters.id === 'wizard' ? (
            storyWithKnobs
          ) : (
            <StakingWithNavigation
              isActiveNavItem={item => item === getItemFromContext()}
              activeItem={getItemFromContext()}
              onNavItemClick={() => {}}
            >
              {storyWithKnobs}
            </StakingWithNavigation>
          )}
        </StoryLayout>
      </StoryProvider>
    </StoryDecorator>
  );
};

storiesOf('Decentralization | Countdown', module)
  .addDecorator(decorator)
  .add(
    pageNames.countdown,
    () => (
      <div>
        <StakingCountdown
          startDateTime={startDateTimeKnob(
            'Decentralization Start DateTime',
            defaultStartDateTime
          )}
          onLearnMoreClick={action('onLearnMoreClick')}
        />
      </div>
    ),
    { id: 'countdown' }
  );

storiesOf('Decentralization | Staking', module)
  .addDecorator(decorator)
  // ====== Stories ======

  .add(pageNames['delegation-center'], StakingDelegationCenterStory, {
    id: 'delegation-center',
  })

  .add('Delegation Center - No Wallets', () => (
    <DelegationCenterNoWallets
      onGoToCreateWalletClick={action('onGoToCreateWalletClick')}
    />
  ))

  .add(pageNames['stake-pools'], StakePoolsStory, { id: 'stake-pools' })

  .add(pageNames.rewards, StakingRewardsStory, { id: 'rewards' })

  .add(pageNames.epochs, StakingEpochsStory, { id: 'epochs' })

  .add(
    pageNames.info,
    () => (
      <StakingInfo
        percentage={number('Percentage', defaultPercentage, {
          min: 0,
          max: 100,
          step: 1,
          range: true,
        })}
        onLearnMoreClick={action('onLearnMoreClick')}
      />
    ),
    {
      id: 'info',
    }
  );

storiesOf('Decentralization | Wizard', module)
  .addDecorator(decorator)
  .add('Delegation Wizard', () => <StakingDelegationSteps />, { id: 'wizard' });
