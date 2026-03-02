import * as React from 'react'

interface ToastState {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  open: boolean
}

let count = 0
const listeners: Array<(state: ToastState[]) => void> = []
let memoryState: ToastState[] = []

function dispatch(state: ToastState[]) {
  memoryState = state
  listeners.forEach((listener) => listener(state))
}

export function toast(props: Omit<ToastState, 'id' | 'open'>) {
  const id = String(++count)
  dispatch([...memoryState, { ...props, id, open: true }])
  setTimeout(() => {
    dispatch(memoryState.map((t) => (t.id === id ? { ...t, open: false } : t)))
    setTimeout(() => {
      dispatch(memoryState.filter((t) => t.id !== id))
    }, 300)
  }, 4000)
}

export function useToast() {
  const [state, setState] = React.useState<ToastState[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts: state, toast }
}
