import { createElement } from 'react'
import htm from 'htm'

// Chuyển chuỗi "background-color:red; width:10px" -> { backgroundColor:'red', width:'10px' }
function styleStringToObject(str) {
  const obj = {}
  for (const part of str.split(';')) {
    const i = part.indexOf(':')
    if (i === -1) continue
    const key = part.slice(0, i).trim()
    const val = part.slice(i + 1).trim()
    if (!key) continue
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    obj[camel] = val
  }
  return obj
}

// Bọc createElement để viết HTML tự nhiên (class, style dạng chuỗi) mà vẫn hợp lệ với React.
function h(type, props, ...children) {
  if (props) {
    if ('class' in props && !('className' in props)) {
      props.className = props.class
      delete props.class
    }
    if ('for' in props && !('htmlFor' in props)) {
      props.htmlFor = props.for
      delete props.for
    }
    if (typeof props.style === 'string') {
      props.style = styleStringToObject(props.style)
    }
  }
  return createElement(type, props, ...children)
}

// htm bound to wrapper — viết template kiểu JSX, không cần build/Babel.
export const html = htm.bind(h)
