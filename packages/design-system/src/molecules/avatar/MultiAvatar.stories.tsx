import React from 'react'
import MultiAvatar from './MultiAvatar'

export default {
  title: 'Molecules/Avatar/MultiAvatar',
  component: MultiAvatar,
}

const avatars = []
for (let i = 0; i < 9; i++) {
  avatars.push(
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA3IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEwNyAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iMTcuODMwOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzgxMDNfMjEwMTApIi8+CjxwYXRoIGQ9Ik02Ny44NjYzIDg2LjgyNDZDODAuMjMwMiA4MS4xMjgzIDg4LjgxMjUgNjguNjI3IDg4LjgxMjUgNTQuMTIxMUM4OC44MTI1IDM0LjI0NTMgNzIuNyAxOC4xMzI4IDUyLjgyNDIgMTguMTMyOEMzMi45NDg0IDE4LjEzMjggMTYuODM1OSAzNC4yNDUzIDE2LjgzNTkgNTQuMTIxMUMxNi44MzU5IDY3LjIyMDkgMjMuODM1MSA3OC42ODU5IDM0LjI5NzcgODQuOTgwN1Y1My45MDgxTDM0LjI5ODkgNTMuOTA5M0MzNC40MTI0IDQzLjc3NSA0Mi42NjMgMzUuNTk0NiA1Mi44MjQyIDM1LjU5NDZDNjMuMDU2MSAzNS41OTQ2IDcxLjM1MDcgNDMuODg5MiA3MS4zNTA3IDU0LjEyMTFDNzEuMzUwNyA2NC4zNTE4IDYzLjA1ODEgNzIuNjQ1NiA1Mi44Mjc5IDcyLjY0NzZMNjcuODY2MyA4Ni44MjQ2WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl84MTAzXzIxMDEwIiB4MT0iNTMuNSIgeTE9IjAiIHgyPSI1My41IiB5Mj0iMTA3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzk0NkQwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg=='
  )
}

const Template = (args: any) => {
  return <MultiAvatar avatars={avatars} {...args} />
}

export const EmailSelectExample = Template.bind({}) as any
EmailSelectExample.args = {
  cutoff: 5,
  size: 64,
}
