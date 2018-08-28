// @flow
import * as React from 'react';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';
import { IntlProvider } from 'react-intl';
import { observer } from 'mobx-react';
import { daedalusTheme } from '../../../source/renderer/app/themes/daedalus';
import translations from '../../../source/renderer/app/i18n/translations';
import ThemeManager from '../../../source/renderer/app/ThemeManager';
import { THEMES } from '../../../source/renderer/app/themes';

type Props = {
  children: React.Node,
  propsForChildren?: any,
};

@observer
export default class StoryDecorator extends React.Component<Props> {

  render() {
    const { children, propsForChildren } = this.props;
    const theme = require(`../../../source/renderer/app/themes/daedalus/${THEMES.LIGHT_BLUE}.js`);
    return (
      <div>
        <ThemeManager variables={theme} />
        <IntlProvider {...{ locale: 'en-US', key: 'en-US', messages: translations['en-US'] }}>
          <ThemeProvider theme={daedalusTheme}>
            <div>
              {React.Children.map(children, (child) => {
                const childProps = child.type === 'div' ? {} : { propsForChildren };
                return React.cloneElement(child, childProps);
              })}
            </div>
          </ThemeProvider>
        </IntlProvider>
      </div>
    );
  }

}
