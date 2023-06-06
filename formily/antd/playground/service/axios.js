import axios from 'axios'
const _axios = axios.create({
  baseURL: '/api', // api 的 base_url
  timeout: 5000, // 请求超时时间
})
_axios.interceptors.request.use(
  (config) => {
    // 从本地存储中获取 Token
    const token = localStorage.getItem('token')
    // 从本地存储中获取 CSRF Token
    const csrf_token = localStorage.getItem('csrf_token')

    // 如果 Token 存在，则将其添加到请求的 headers 中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 如果 CSRF Token 存在，并且请求不是跨域请求，则将其添加到请求的 headers 中
    if (csrf_token && !config.url.startsWith('http')) {
      config.headers['X-CSRFToken'] = csrf_token
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
_axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 如果请求返回 401 错误且没有进行过 Token 刷新尝试
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 从本地存储中获取 Refresh Token
      const refreshToken = localStorage.getItem('refreshToken')

      // 使用 Refresh Token 发起请求刷新 Token
      try {
        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken,
        })
        const newToken = response.data.access
        // const newRefreshToken = response.data.refresh;

        const newCsrfToken = response.data.csrf_token

        // 更新本地存储中的 Token 和 CSRF Token
        localStorage.setItem('token', newToken)
        localStorage.setItem('csrf_token', newCsrfToken)
        // localStorage.setItem("refreshToken", newRefreshToken);

        // 更新请求的 headers 中的 Token 和 CSRF Token
        _axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        _axios.defaults.headers.common['X-CSRFToken'] = newCsrfToken

        // 重新发起原始请求
        return _axios(originalRequest)
      } catch (error) {
        // 刷新 Token 失败，重定向到登录页面
        localStorage.removeItem('token')
        localStorage.removeItem('csrf_token')
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
export default _axios
