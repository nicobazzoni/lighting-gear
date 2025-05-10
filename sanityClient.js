import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'icqq0z47', // 🔁 Replace with your ID
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
  token: import.meta.env.VITE_SANITY_WRITE_TOKEN // if needed
  
})