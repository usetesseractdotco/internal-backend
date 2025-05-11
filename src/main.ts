import { startServer } from './http/server'

async function main() {
  startServer()
}

main().catch((err) => {
  console.error('Error initializing Tesseract Internal API', err)
})
