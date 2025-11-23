import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || 'body_translator'

let clientPromise: Promise<MongoClient> | undefined

export async function getDb() {
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect()
  }
  const client = await clientPromise
  return client.db(dbName)
}