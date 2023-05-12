import React from 'react'
import { useTheme } from '@designable/react'

const logo = {
  light: 'http://hztxts.cn/statics/assets/images/logo.jpg',
  dark: 'http://hztxts.cn/statics/assets/images/logo.jpg',
}

export const LogoWidget: React.FC = () => {
  const url = logo[useTheme()]
  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
      <img
        src={url}
        style={{ margin: '12px 8px', height: 18, width: 'auto' }}
      />
    </div>
  )
}
