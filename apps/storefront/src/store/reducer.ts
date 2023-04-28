import { setupStore } from '@b3/store'

import global from './slices/global'
import theme from './slices/theme'

export const middlewareOptions = {
  serializableCheck: {
    ignoredActions: ['theme/setThemeFrame', 'global/setGlabolCommonState'],
    ignoredPaths: ['theme.themeFrame', 'global.globalMessage'],
  },
}

export const store = setupStore<{}>({
  reducers: {
    global,
    theme,
  },
  middlewareOptions,
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
