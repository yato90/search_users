import { promises as fs } from 'fs'
import path from 'path'

const usersFilePath = path.join(__dirname, 'users.json')

interface User {
  email: string
  number: string
}

export async function getUsers(): Promise<User[]> {
  const data = await fs.readFile(usersFilePath, 'utf8')
  return JSON.parse(data)
}

export function validateInput(email: string, number?: string): boolean {
  const isEmailValid = typeof email === 'string' && email.includes('@')
  const isNumberValid = typeof number === 'string' && /^\d*$/.test(number)
  return isEmailValid && (!number || isNumberValid)
}

export async function searchUsers(email: string, number?: string): Promise<User[]> {
  const users = await getUsers()
  return users.filter(user =>
    user.email.includes(email) && (!number || user.number.includes(number))
  )
}
