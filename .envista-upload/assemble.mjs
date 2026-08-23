import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const dir = '.envista-upload'
const parts = fs.readdirSync(dir).filter(n => /^part\d+\.txt$/.test(n)).sort()
const b64 = parts.map(n => fs.readFileSync(path.join(dir, n), 'utf8')).join('')
const raw = zlib.gunzipSync(Buffer.from(b64, 'base64'))
const files = JSON.parse(raw.toString('utf8'))

for (const [rel, encoded] of Object.entries(files)) {
  const out = path.resolve(rel)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, Buffer.from(encoded, 'base64'))
}

console.log(`Reconstructed ${Object.keys(files).length} files.`)
