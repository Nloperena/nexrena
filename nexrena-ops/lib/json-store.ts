import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')

export function readData<T>(file: string): T[] {
  const path = join(DATA_DIR, file)
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return []
  }
}

export function writeData<T>(file: string, data: T[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8')
}
