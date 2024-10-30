import type { Action } from 'svelte/action'

  // scrollX by ctrl
const moveExcelTableByX: Action = (node: HTMLElement) => {
  let ctrl: boolean = false
  let click: boolean = false
  let userSelect: boolean = true
  let x = 0

  const keydown = (e: KeyboardEvent) => {
    if(e.key === 'Control')
      ctrl = true
  }
  
  const keyup = (e: KeyboardEvent) => {
    if(e.key === 'Control')
    ctrl = false
  }

  const mousedown = (e: MouseEvent) => {
    click = true
    x = e.clientX - node.getBoundingClientRect().left
  }
  
  const mouseup = (e: Event) => click = false

  const mousemove = (e: MouseEvent) => {
    if(ctrl && click) {
      if(userSelect) {
        document.body.style.userSelect = 'none'
        userSelect = false
      }
      const dx = e.clientX - node.getBoundingClientRect().left
      node.scrollLeft += (dx - x) * -1
      x = dx
    } else {
      if(!userSelect) {
        userSelect = true
        document.body.style.userSelect = ''
      }
    }
  }
  
  const mouseout = (e: Event) => {
    userSelect = true
    document.body.style.userSelect = ''
  }
  
  document.body.addEventListener('keydown', keydown)
  document.body.addEventListener('keyup', keyup)
  node.addEventListener('mousedown', mousedown)
  node.addEventListener('mouseup', mouseup)
  node.addEventListener('mousemove', mousemove)
  node.addEventListener('mouseout', mouseout)

  return {
    destroy() {
      document.body.style.userSelect = ''
      document.body.removeEventListener('keydown', keydown)
      document.body.removeEventListener('keyup', keyup)
      node.removeEventListener('mousedown', mousedown)
      node.removeEventListener('mouseup', mouseup)
      node.removeEventListener('mousemove', mousemove)
      node.removeEventListener('mouseout', mouseout)
    }
  }
}

export default moveExcelTableByX