export function formatMessageDayLabel(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const msgDay = new Date(date)
  msgDay.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatThreadTime(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const msgDay = new Date(date)
  msgDay.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86400000)
  if (diffDays === 0) return formatMessageTime(dateStr)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function groupMessagesByDay<T extends { createdAt: string }>(messages: T[]) {
  const groups: { label: string; messages: T[] }[] = []
  let currentLabel = ''
  for (const msg of messages) {
    const label = formatMessageDayLabel(msg.createdAt)
    if (label !== currentLabel) {
      groups.push({ label, messages: [msg] })
      currentLabel = label
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }
  return groups
}

export const MESSAGE_ATTACHMENT_ACCEPT = 'image/*,video/mp4,video/quicktime'
