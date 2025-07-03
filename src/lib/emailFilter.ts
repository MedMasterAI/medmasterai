const disposableDomains = [
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'tempmail.com',
  'dispostable.com',
  'getnada.com',
  'discard.email',
]

const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com']

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? disposableDomains.includes(domain) : false
}

export const isEmailAllowed = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  if (isDisposableEmail(email)) return false
  return allowedDomains.includes(domain)
}
