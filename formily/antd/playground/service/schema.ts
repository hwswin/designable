import { Engine } from '@designable/core'
import {
  transformToSchema,
  transformToTreeNode,
} from '@designable/formily-transformer'
import { message } from 'antd'
import axios from 'axios'
const _axios = axios.create({
  baseURL: '/api', // api 的 base_url
  timeout: 5000, // 请求超时时间
})
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
        debugger
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
  const id = urlParams.get('id')

  if (id) {
    _axios
      .get(`/former/schema/${id}/`)
      .then((res) => {
        if (res.status >= 200) {
          localStorage.setItem(
            'formily-schema',
            JSON.stringify(res.data['body'])
          )
          designer.setCurrentTree(transformToTreeNode(res.data['body']))
        } else {
          message.error('Failed to fetch schema')
        }
      })
      .catch(() => {
        message.error('Failed to fetch schema')
      })
  } else {
    const storedSchema = localStorage.getItem('formily-schema')
    if (storedSchema) {
      designer.setCurrentTree(transformToTreeNode(JSON.parse(storedSchema)))
    }
  }
}
