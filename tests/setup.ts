import path from 'path'
import dotenv from 'dotenv'

// Vitest does not read .env.local the way Next does. Loaded here so tests that touch
// the database get DATABASE_URI and PAYLOAD_SECRET.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })
