const colors = {
  bg: '#f8fafc',
  surface: '#eef3f8',
  white: '#ffffff',
  textMuted: '#3a4658',
  brandText: '#0047b3',
  brandAction: '#0047b3',
  brandInk: '#ffffff',
  borderControl: '#818d9c',
  success: '#107c5b',
  warning: '#9a620f',
  danger: '#b42318',
  navy: '#0a1120',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
}

function channel(value) {
  const normalized = value / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const value = hex.replace('#', '')
  const red = channel(Number.parseInt(value.slice(0, 2), 16))
  const green = channel(Number.parseInt(value.slice(2, 4), 16))
  const blue = channel(Number.parseInt(value.slice(4, 6), 16))
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(foreground, background) {
  const first = luminance(foreground)
  const second = luminance(background)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

const checks = [
  ['Muted text on page background', colors.textMuted, colors.bg, 7],
  ['Muted text on surface', colors.textMuted, colors.surface, 7],
  ['Muted text on white', colors.textMuted, colors.white, 7],
  ['Brand text on page background', colors.brandText, colors.bg, 7],
  ['Brand text on surface', colors.brandText, colors.surface, 7],
  ['Brand text on white', colors.brandText, colors.white, 7],
  ['Filled action text', colors.brandInk, colors.brandAction, 7],
  ['Success text on surface', colors.success, colors.surface, 4.5],
  ['Warning text on surface', colors.warning, colors.surface, 4.5],
  ['Danger text on surface', colors.danger, colors.surface, 4.5],
  ['Footer primary secondary text', colors.slate300, colors.navy, 7],
  ['Footer fine print', colors.slate400, colors.navy, 7],
  ['Form/control boundary on white', colors.borderControl, colors.white, 3],
  ['Form/control boundary on surface', colors.borderControl, colors.surface, 3],
]

let failed = false
for (const [name, foreground, background, minimum] of checks) {
  const ratio = contrast(foreground, background)
  const pass = ratio >= minimum
  console.log(
    `${pass ? 'PASS' : 'FAIL'} ${name}: ${ratio.toFixed(2)}:1 (minimum ${minimum}:1)`,
  )
  if (!pass) failed = true
}

if (failed) {
  process.exitCode = 1
}
