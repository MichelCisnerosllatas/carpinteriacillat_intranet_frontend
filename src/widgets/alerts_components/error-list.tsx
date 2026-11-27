
export function ErrorList({ errors }: { errors: Record<string, string[]> }) {
  const messages = Object.values(errors).flat()
  if (messages.length === 0) return null
  return (
    <ul className='mt-1 list-disc pl-4 space-y-0.5'>
      {messages.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  )
}
