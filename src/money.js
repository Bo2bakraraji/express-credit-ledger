export const LBP_INPUT_MULTIPLIER = 1000

export function inputUnitsToLbp(value, { allowZero = true } = {}) {
  const text = String(value ?? '').trim()
  if (!/^\d+$/.test(text)) throw new Error('Enter a whole number using digits only.')

  const units = Number(text)
  const amount = units * LBP_INPUT_MULTIPLIER
  if (!Number.isSafeInteger(amount) || (!allowZero && amount === 0)) {
    throw new Error(allowZero ? 'Enter a valid LBP amount.' : 'Amount must be greater than zero.')
  }

  return amount
}

export function storedLbpToInputUnits(value) {
  const amount = Number(value)
  if (!Number.isSafeInteger(amount) || amount < 0 || amount % LBP_INPUT_MULTIPLIER !== 0) {
    return ''
  }
  return String(amount / LBP_INPUT_MULTIPLIER)
}
