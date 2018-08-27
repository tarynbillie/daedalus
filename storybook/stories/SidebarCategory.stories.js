// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import SidebarCategory from '../../source/renderer/app/components/sidebar/SidebarCategory';
import walletsIcon from '../../source/renderer/app/assets/images/sidebar/wallet-ic.inline.svg';

storiesOf('SidebarCategory', module)

  .addDecorator((story, context) => (<div>{story(context)}</div>))

  // ====== Stories ======

  .add('inactive', () => (
    <SidebarCategory
      label="Wallets"
      icon={walletsIcon}
      active={false}
      onClick={action('categoryClicked')}
      className=""
    />
  ))

  .add('active', () => (
    <SidebarCategory
      label="Wallets"
      icon={walletsIcon}
      active
      onClick={action('categoryClicked')}
      className=""
    />
  ));
