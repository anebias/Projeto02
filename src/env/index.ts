import { config } from 'dotenv'
import { z } from 'zod'

console.log(config)

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config({ path: '.env' })
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Variaveis de ambiente inválidas', _env.error.format())
  throw new Error('Variaveis de ambiente inválidas')
}

export const env = _env.data
