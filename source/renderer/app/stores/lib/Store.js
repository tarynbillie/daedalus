// @flow
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { Api } from '../../api/index';

import Reaction from './Reaction';

export interface StoreLifecycle {
  initialize(): void;
  teardown(): void;
}

export default class Store implements StoreLifecycle {

  stores: StoresMap;

  api: Api;

  actions: ActionsMap;

  _reactions: Array<Reaction> = [];

  constructor(stores: StoresMap, api: Api, actions: ActionsMap) {
    this.stores = stores;
    this.api = api;
    this.actions = actions;
  }

  registerReactions(reactions: Array<Function>) {
    reactions.forEach(reaction => this._reactions.push(new Reaction(reaction)));
  }

  setup() {}

  initialize() {
    this.setup();
    this._reactions.forEach(reaction => reaction.start());
  }

  teardown() {
    this._reactions.forEach(reaction => reaction.stop());
  }
}
