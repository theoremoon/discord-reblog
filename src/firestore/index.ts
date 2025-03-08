import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp, doc, getDoc, where, updateDoc, deleteDoc } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { DiscordMessage } from '../discord/message.js'
import type { User, Star } from '../types.js'

// Firebaseの設定
// 環境変数から取得
const firebaseConfig = {
  projectId: process.env.USE_FIREBASE_EMULATOR === 'true' ? 'discord-reblog' : process.env.FIREBASE_PROJECT_ID,
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
  createdAt: Date | Timestamp
  createdByUserId: string
  createdByUsername: string
  messages: DiscordMessage[]
  starCount?: number  // スター数
}

// Firestoreのドキュメントからオブジェクトに変換するヘルパー関数
export function convertReblogDoc(doc: QueryDocumentSnapshot<DocumentData>): ReblogEntry {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title,
    createdAt: data.createdAt.toDate(),
    createdByUserId: data.createdByUserId,
    createdByUsername: data.createdByUsername,
    messages: data.messages,
    starCount: data.starCount || 0
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
export async function getReblogEntries(entriesLimit: number = 50): Promise<ReblogEntry[]> {
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

// IDを指定してReblogエントリを取得する
export async function getReblogEntryById(id: string): Promise<ReblogEntry | null> {
  try {
    const docRef = doc(db, 'reblog_entries', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertReblogDoc(docSnap as QueryDocumentSnapshot<DocumentData>)
    } else {
      return null
    }
  } catch (error) {
    console.error('Reblogエントリの取得に失敗しました:', error)
    throw error
  }
}

// スターを追加する
export async function addStar(entryId: string, user: User): Promise<string> {
  try {
    // 既存のスターをチェック
    const existingStar = await getUserStarForEntry(entryId, user.id);
    if (existingStar) {
      return existingStar.id!;
    }

    // スターを追加
    const star: Omit<Star, 'id'> = {
      entryId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'stars'), {
      ...star,
      createdAt: Timestamp.fromDate(star.createdAt instanceof Date ? star.createdAt : new Date())
    });
    
    // エントリのスター数を更新
    await updateStarCount(entryId);
    
    return docRef.id;
  } catch (error) {
    console.error('スターの追加に失敗しました:', error);
    throw error;
  }
}

// スターを削除する
export async function removeStar(entryId: string, userId: string): Promise<void> {
  try {
    const star = await getUserStarForEntry(entryId, userId);
    if (star && star.id) {
      await deleteDoc(doc(db, 'stars', star.id));
      
      // エントリのスター数を更新
      await updateStarCount(entryId);
    }
  } catch (error) {
    console.error('スターの削除に失敗しました:', error);
    throw error;
  }
}

// エントリのスター数を更新する
async function updateStarCount(entryId: string): Promise<void> {
  try {
    const stars = await getStarsByEntryId(entryId);
    const entryRef = doc(db, 'reblog_entries', entryId);
    await updateDoc(entryRef, {
      starCount: stars.length
    });
  } catch (error) {
    console.error('スター数の更新に失敗しました:', error);
    throw error;
  }
}

// エントリのスターを取得する
export async function getStarsByEntryId(entryId: string): Promise<Star[]> {
  try {
    const q = query(
      collection(db, 'stars'),
      where('entryId', '==', entryId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Star));
  } catch (error) {
    console.error('スターの取得に失敗しました:', error);
    throw error;
  }
}

// ユーザーがエントリにつけたスターを取得する
export async function getUserStarForEntry(entryId: string, userId: string): Promise<Star | null> {
  try {
    const q = query(
      collection(db, 'stars'),
      where('entryId', '==', entryId),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Star;
  } catch (error) {
    console.error('ユーザースターの取得に失敗しました:', error);
    throw error;
  }
}

// ユーザーがスターをつけたエントリを取得する
export async function getStarredEntriesByUserId(userId: string): Promise<ReblogEntry[]> {
  try {
    // ユーザーのスターを取得
    const q = query(
      collection(db, 'stars'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const stars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Star));
    
    // スターがついているエントリを取得
    const entries: ReblogEntry[] = [];
    for (const star of stars) {
      const entry = await getReblogEntryById(star.entryId);
      if (entry) {
        entries.push(entry);
      }
    }
    
    return entries;
  } catch (error) {
    console.error('スター付きエントリの取得に失敗しました:', error);
    throw error;
  }
}
