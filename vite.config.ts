import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getLocalHttpsConfig(): { key: Buffer; cert: Buffer } | undefined {
  if (process.env.VITEST || process.env.CI) {
    return undefined
  }
  const certDir = path.resolve(process.cwd(), '.cert')
  const keyPath = path.join(certDir, 'localhost-key.pem')
  const certPath = path.join(certDir, 'localhost-cert.pem')

  try {
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      fs.mkdirSync(certDir, { recursive: true })
      execFileSync(
        'openssl',
        [
          'req',
          '-x509',
          '-newkey',
          'rsa:2048',
          '-nodes',
          '-sha256',
          '-days',
          '365',
          '-subj',
          '/CN=localhost',
          '-addext',
          'subjectAltName=DNS:localhost,IP:127.0.0.1',
          '-keyout',
          keyPath,
          '-out',
          certPath,
        ],
        { stdio: 'ignore' }
      )
    }
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  } catch {
    return undefined
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
    https: getLocalHttpsConfig(),
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    poolOptions: {
      threads: {
        maxThreads: 4,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})