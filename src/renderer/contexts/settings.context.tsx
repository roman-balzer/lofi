import Store from 'electron-store';
import React, { createContext, FunctionComponent, useContext, useEffect, useMemo, useReducer } from 'react';

import { Settings } from '../../models/settings';
import { SettingsAction, useSettingsReducer } from '../reducers/settings.reducer';

interface SettingsContext {
  state: Settings;
  dispatch: React.Dispatch<SettingsAction>;
}

const Context = createContext<SettingsContext>({ state: null, dispatch: null });

export const SettingsProvider: FunctionComponent = ({ children }) => {
  const store = useMemo(() => new Store<Settings>(), []);
  const [state, dispatch] = useReducer(useSettingsReducer, store.get('settings'));

  useEffect(() => {
    store.set('settings', state);
  }, [state, store]);

  const ctx: SettingsContext = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

export const useSettings = (): SettingsContext => useContext(Context);
