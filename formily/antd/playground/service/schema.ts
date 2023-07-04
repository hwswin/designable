import { Engine } from '@designable/core'
import {
  transformToSchema,
  transformToTreeNode,
} from '@designable/formily-transformer'
import { message } from 'antd'
import _axios from './axios'
// import { de, fi } from 'element-plus/es/locale'
let id = 0
let engine: Engine
export const handleMessage = (event) => {
  const { type, data } = event.data
  switch (type) {
    case 'save':
      if (engine) saveSchema()
      break
    case 'changeTheme':
      if (engine) changeTheme(data.theme)
      break
    default:
      break
  }
}

export const saveSchema = () => {
  const schema = transformToSchema(designer.getCurrentTree())
  const name = schema.form.name
  const schema_str = JSON.stringify(schema)
  localStorage.setItem('formily-schema', schema_str)

  const requestData = {
    id: schema.form.id || schema.schema['x-designable-id'],
    name,
    body: schema,
  }

  // 检查是否存在 ID 属性
  if (schema.form.id) {
    // 执行更新请求
    _axios
      .put(`/former/schema/${schema.form.id}/`, requestData)
      .then((res) => {
        if (res.status >= 200) {
          message.success('保存成功')
          window.parent.postMessage({ type: 'save' }, '*')
        } else {
          message.error('保存失败')
        }
      })
      .catch(() => {
        message.error('保存失败')
      })
  } else {
    // 执行创建请求
    _axios
      .post('/former/schema/', requestData)
      .then((res) => {
        if (res.status >= 200) {
          schema.form.id = res.data.id
          localStorage.setItem(
            'formily-schema',
            JSON.stringify(res.data['body'])
          )
          designer.setCurrentTree(transformToTreeNode(res.data['body']))
          message.success('Save Success')
        } else {
          message.error('Save Failed')
        }
      })
      .catch(() => {
        message.error('Save Failed')
      })
  }
}

export const changeTheme = (theme) => {
  localStorage.setItem('theme', theme)
  document.documentElement.setAttribute('theme', theme)
}

export const loadInitialSchema = (designer: Engine) => {
  engine = designer
  try {
    _loadInitialSchema(designer)
    window.parent.postMessage({ type: 'loaded' }, '*')
  } catch (e) {
    message.error(e.message)
    window.parent.postMessage({ type: 'loaded', message: e.message }, '*')
  }
}
export const _loadInitialSchema = (designer: Engine) => {
  const urlParams = new URLSearchParams(window.location.search)

  let theme = urlParams.get('theme')

  if (!theme) {
    theme = localStorage.getItem('theme')
  }

  if (theme) {
    changeTheme(theme)
  }

  //从地址中获取jwt和csrf_token
  const csrf_token = urlParams.get('csrf_token')
  const token = urlParams.get('token')
  const refreshToken = urlParams.get('refreshToken')
  if (!csrf_token || !token || !refreshToken) {
    message.error('!csrf_token||!token||!refreshToken')
    return
  }
  localStorage.setItem('token', token)
  localStorage.setItem('csrf_token', csrf_token)
  localStorage.setItem('refreshToken', refreshToken)

  id = urlParams.get('id')
  const consumer = urlParams.get('consumer')
  if (consumer) {
    localStorage.setItem('consumer', consumer)
  }

  if (id) {
    _axios.get(`/former/schema/${id}/`).then((res) => {
      if (res.status >= 200) {
        localStorage.setItem('formily-schema', JSON.stringify(res.data['body']))
        designer.setCurrentTree(transformToTreeNode(res.data['body']))
      } else {
        message.error('Failed to fetch schema')
      }
    })
  } else {
    const storedSchema = localStorage.getItem('formily-schema')
    let json = JSON.parse(storedSchema || '{}')
    delete json.form.id

    designer.setCurrentTree(transformToTreeNode(json))
  }
}
