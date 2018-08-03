import React from 'react';
import { observer } from 'mobx-react';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import Button from 'react-polymorph/lib/components/Button';
import { toMaybe, reduce, show, pipe } from 'sanctuary';

import type { StoresMap } from '../../stores/index';
import BorderedBox from '../../components/widgets/BorderedBox';
import { withStore } from '../../utils/mobx';
import { formattedYesNo } from '../../utils/formatters';

const showOrElse = val => maybe => reduce(a => b => show(b))(val)(maybe);

// TODO: Figure out connect-like interface to avoid having access to all stores in a component
interface Erc20CheckerProps {
  stores: ?StoresMap;
}

interface Erc20CheckerState {
  address: string;
  txHash: string;
}

@observer
class Erc20CheckerComponent extends React.PureComponent<
  Erc20CheckerProps,
  Erc20CheckerState
> {
  state: Erc20CheckerState = {
    address: '',
    txHash: '',
  };

  render() {
    console.log(this.props);
    const erc20Checker = this.props.erc20CheckerStore;
    const result = erc20Checker.result;
    return (
      <div style={{ margin: 20 }}>
        <BorderedBox>
          <Button
            label="Deploy valid ERC20 Token"
            onClick={this._deployContract}
            skin={<SimpleButtonSkin />}
          />
          <div>Deployed contract address: <Input value={erc20Checker.deployedContractAddress || ''} skin={<SimpleInputSkin />} /></div>
        </BorderedBox>
        <div>
          <header>Check contract address by transaction hash</header>
          <input type="text" onChange={this._txHashChanged} value={this.state.txHash} />
          <div>Contract address: <input value={erc20Checker.contractAddress || ''} /></div>
        </div>
        <div>
          <header>Check contract</header>
          <input onChange={this._addressChanged} value={this.state.address} />
          {result &&
            <dl>
              <dt>Name</dt>
              <dd>{pipe([toMaybe, showOrElse('-')])(result.name)}</dd>
              <dt>Symbol</dt>
              <dd>{pipe([toMaybe, showOrElse('-')])(result.symbol)}</dd>
              <dt>Decimals</dt>
              <dd>{pipe([toMaybe, showOrElse('-')])(result.decimals)}</dd>
              <dt>is ERC-20?</dt>
              <dd>{formattedYesNo(result.isERC20)}</dd>
            </dl>
          }
        </div>
      </div>
    );
  }

  _addressChanged = e => {
    const address = e.target.value;
    this.setState({ address }, () =>
      this.props.stores.etc.erc20Checker.checkAddress(address)
    );
  };

  _txHashChanged = e => {
    const txHash = e.target.value;
    this.setState({ txHash }, () =>
      this.props.stores.etc.erc20Checker.getContractAddress(txHash)
    );
  };

  _deployContract = () => this.props.stores.etc.erc20Checker.deployContract();
}

export const Erc20Checker = withStore('tokens', 'erc20CheckerStore')(Erc20CheckerComponent);
