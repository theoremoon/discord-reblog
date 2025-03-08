import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { DiscordMessage } from '../discord/message.js'

// Firebaseの設定
// 環境変数から取得
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.USE_FIREBASE_EMULATOR === 'true' ? 'discord-reblog' : process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// エミュレータ使用時のプロジェクトID
const projectId = process.env.USE_FIREBASE_EMULATOR === 'true' ? 'discord-reblog' : process.env.FIREBASE_PROJECT_ID

// Firebaseの初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 開発環境の場合はエミュレータに接続
if (process.env.NODE_ENV === 'development' || process.env.USE_FIREBASE_EMULATOR === 'true') {
  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || 'localhost'
    const emulatorPort = parseInt(process.env.FIRESTORE_EMULATOR_PORT || '8080', 10)
    connectFirestoreEmulator(db, emulatorHost, emulatorPort)
    console.log(`Using Firestore emulator on ${emulatorHost}:${emulatorPort}`)
  })
}

// Reblogエントリの型定義
export interface ReblogEntry {
  id?: string
  title: string
  description: string
  createdAt: Date | Timestamp
  createdByUserId: string
  createdByUsername: string
  messages: DiscordMessage[]
}

// Firestoreのドキュメントからオブジェクトに変換するヘルパー関数
export function convertReblogDoc(doc: QueryDocumentSnapshot<DocumentData>): ReblogEntry {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    createdAt: data.createdAt.toDate(),
    createdByUserId: data.createdByUserId,
    createdByUsername: data.createdByUsername,
    messages: data.messages
  }
}

// Reblogエントリを保存する
export async function saveReblogEntry(entry: Omit<ReblogEntry, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'reblog_entries'), {
      ...entry,
      createdAt: Timestamp.fromDate(entry.createdAt instanceof Date ? entry.createdAt : new Date())
    })
    return docRef.id
  } catch (error) {
    console.error('Reblogエントリの保存に失敗しました:', error)
    throw error
  }
}

// Reblogエントリの一覧を取得する
export async function getReblogEntries(entriesLimit: number = 10): Promise<ReblogEntry[]> {
  try {
    const q = query(
      collection(db, 'reblog_entries'),
      orderBy('createdAt', 'desc'),
      limit(entriesLimit)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertReblogDoc)
  } catch (error) {
    console.error('Reblogエントリの取得に失敗しました:', error)
    throw error
  }
}
