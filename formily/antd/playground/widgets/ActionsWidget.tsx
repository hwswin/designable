import React, { useEffect } from 'react'
import { Space, Button } from 'antd'
import { TextWidget, useDesigner } from '@designable/react'
import { GlobalRegistry } from '@designable/core'
import { observer } from '@formily/react'
import { saveSchema } from '../service'

export const ActionsWidget = observer(() => {
  const designer = useDesigner()
  const supportLocales = ['zh-cn', 'en-us', 'ko-kr']
  useEffect(() => {
    if (!supportLocales.includes(GlobalRegistry.getDesignerLanguage())) {
      GlobalRegistry.setDesignerLanguage('zh-cn')
    }
  }, [])
  return (
    <Space style={{ marginRight: 10 }}>
      {/* <Button href="https://designable-fusion.formilyjs.org">
        Alibaba Fusion
      </Button> */}
      {/* <Radio.Group
        value={GlobalRegistry.getDesignerLanguage()}
        optionType="button"
        options={[
          { label: 'English', value: 'en-us' },
          { label: '简体中文', value: 'zh-cn' },
          { label: '한국어', value: 'ko-kr' },
        ]}
        onChange={(e) => {
          GlobalRegistry.setDesignerLanguage(e.target.value)
        }}
      /> */}
      {/* <Button href="https://github.com/alibaba/designable" target="_blank">
        <GithubOutlined />
        Github
      </Button> */}
      <Button
        type="primary"
        onClick={() => {
          saveSchema(designer)
        }}
      >
        <TextWidget>发布</TextWidget>
      </Button>
      <Button
        onClick={() => {
          saveSchema(designer)
        }}
      >
        <TextWidget>保存</TextWidget>
      </Button>
      <Button
        danger
        onClick={() => {
          window.parent.postMessage({ type: 'close' }, '*')
        }}
      >
        <TextWidget>关闭</TextWidget>
      </Button>
    </Space>
  )
})
