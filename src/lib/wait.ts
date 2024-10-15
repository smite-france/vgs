export const wait = (ms: number = 5000): Promise<void> => new Promise((_, reject) =>
  setTimeout(
    () => reject(new Error('Timeout')),
    ms
  )
)