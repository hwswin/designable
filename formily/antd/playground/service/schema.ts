import { Engine } from '@designable/core'
import {
  transformToSchema,
  transformToTreeNode,
} from '@designable/formily-transformer'
import { message } from 'antd'
import _axios from './axios'

export const saveSchema = (designer: Engine) => {
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
          message.success('Update Success')
          window.parent.postMessage({ type: 'save' }, '*')
        } else {
          message.error('Update Failed')
        }
      })
      .catch(() => {
        message.error('Update Failed')
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

export const loadInitialSchema = (designer: Engine) => {
  const urlParams = new URLSearchParams(window.location.search)

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

  const id = urlParams.get('id')

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
  window.parent.postMessage({ type: 'loaded' }, '*')
}
