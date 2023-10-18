export const getConnectRollupActions = (): string[] => {
  return ['connect', 'create', 'reconnect', 'groupconnect', 'groupemailconnect']
}

export const getNonConnectRollupActions = (): string[] => {
  return ['group', 'preview']
}

export const getSupportedRollupActions = (): string[] => {
  return [...getConnectRollupActions(), ...getNonConnectRollupActions()]
}

export const isSupportedRollupAction = (rollupAction: string): boolean => {
  return getSupportedRollupActions().includes(rollupAction.split('_')[0])
}

export const isConnectRollupAction = (rollupAction: string): boolean => {
  return getConnectRollupActions().includes(rollupAction.split('_')[0])
}
