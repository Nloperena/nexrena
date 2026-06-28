/** When false, copilot intake/sidebar/mobile tab are hidden. Set NEXT_PUBLIC_COPILOT_ENABLED=1 to enable. */
export function isCopilotEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COPILOT_ENABLED === '1'
}
