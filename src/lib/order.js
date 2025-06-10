function orderGenerator() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()

  return `OD-${date}-${random}`
}

export { orderGenerator }
