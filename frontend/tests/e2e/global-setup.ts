import { test as setup, request } from '@playwright/test'
import fs from 'fs'

const API_BASE = 'http://localhost:8000'

async function loginAndSave(
  email: string,
  password: string,
  statePath: string,
) {
  const ctx = await request.newContext({ baseURL: API_BASE })
  const res = await ctx.post('/api/auth/login', { data: { email, password } })

  if (!res.ok()) {
    throw new Error(`Login failed for ${email}: ${res.status()} ${await res.text()}`)
  }

  const { token, user } = await res.json()
  await ctx.dispose()

  fs.mkdirSync('.auth', { recursive: true })
  fs.writeFileSync(statePath, JSON.stringify({
    cookies: [
      { name: 'pv_token', value: token, domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' as const },
      { name: 'pv_user', value: JSON.stringify(user), domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' as const },
    ],
    origins: [],
  }))
}

setup('authenticate employee', async () => {
  await loginAndSave('ana@payravel.com', 'password', '.auth/employee.json')
})

setup('authenticate finance', async () => {
  await loginAndSave('finance@payravel.com', 'password', '.auth/finance.json')
})
