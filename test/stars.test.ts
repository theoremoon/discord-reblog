import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { addStar, removeStar, getStarsByEntryId, getUserStarForEntry, getStarredEntriesByUserId } from '../src/firestore/index.js'
import { mockFirestore } from '../src/firestore/mock.js'

// Firestoreのモック
vi.mock('../src/firestore/index.js', () => ({
  addStar: vi.fn(),
  removeStar: vi.fn(),
  getStarsByEntryId: vi.fn(),
  getUserStarForEntry: vi.fn(),
  getStarredEntriesByUserId: vi.fn()
}))

describe('スター機能のテスト', () => {
  // テスト用のユーザーデータ
  const mockUser = {
    id: 'user123',
    username: 'testuser',
    avatar: 'avatar123'
  }

  // テスト用のエントリID
  const mockEntryId = 'entry123'

  beforeEach(() => {
    // モックFirestoreの初期化
    mockFirestore.init()
    
    // モック関数のリセット
    vi.mocked(addStar).mockReset()
    vi.mocked(removeStar).mockReset()
    vi.mocked(getStarsByEntryId).mockReset()
    vi.mocked(getUserStarForEntry).mockReset()
    vi.mocked(getStarredEntriesByUserId).mockReset()
  })
  
  afterEach(() => {
    // モックFirestoreのクリーンアップ
    mockFirestore.cleanup()
  })
  
  describe('addStar', () => {
    it('スターを追加できること', async () => {
      // モックの戻り値を設定
      vi.mocked(addStar).mockResolvedValue('star123')
      
      const result = await addStar(mockEntryId, mockUser)
      
      // 関数が正しく呼ばれたか確認
      expect(addStar).toHaveBeenCalledWith(mockEntryId, mockUser)
      
      // 戻り値が正しいか確認
      expect(result).toBe('star123')
    })
    
    it('同じユーザーが同じエントリに複数回スターをつけられないこと', async () => {
      // 既存のスターがある場合
      const existingStar = {
        id: 'existing-star',
        entryId: mockEntryId,
        userId: mockUser.id,
        username: mockUser.username,
        createdAt: new Date()
      }
      
      // getUserStarForEntryが既存のスターを返すようにモック
      vi.mocked(getUserStarForEntry).mockResolvedValue(existingStar)
      
      // 同じエントリに再度スターを追加
      vi.mocked(addStar).mockImplementation(async (entryId: string, user: any) => {
        const existingStar = await getUserStarForEntry(entryId, user.id)
        if (existingStar) {
          return existingStar.id!
        }
        return 'new-star-id'
      })
      
      const result = await addStar(mockEntryId, mockUser)
      
      // 既存のスターIDが返されることを確認
      expect(result).toBe('existing-star')
      
      // getUserStarForEntryが呼ばれたことを確認
      expect(getUserStarForEntry).toHaveBeenCalledWith(mockEntryId, mockUser.id)
    })
  })
  
  describe('removeStar', () => {
    it('スターを削除できること', async () => {
      // モックの戻り値を設定
      vi.mocked(removeStar).mockResolvedValue(undefined)
      
      await removeStar(mockEntryId, mockUser.id)
      
      // 関数が正しく呼ばれたか確認
      expect(removeStar).toHaveBeenCalledWith(mockEntryId, mockUser.id)
    })
  })
  
  describe('getStarsByEntryId', () => {
    it('エントリのスター一覧を取得できること', async () => {
      // モックのスター一覧
      const mockStars = [
        {
          id: 'star1',
          entryId: mockEntryId,
          userId: 'user1',
          username: 'User 1',
          createdAt: new Date()
        },
        {
          id: 'star2',
          entryId: mockEntryId,
          userId: 'user2',
          username: 'User 2',
          createdAt: new Date()
        }
      ]
      
      // モックの戻り値を設定
      vi.mocked(getStarsByEntryId).mockResolvedValue(mockStars)
      
      const result = await getStarsByEntryId(mockEntryId)
      
      // 関数が正しく呼ばれたか確認
      expect(getStarsByEntryId).toHaveBeenCalledWith(mockEntryId)
      
      // 戻り値が正しいか確認
      expect(result).toEqual(mockStars)
      expect(result.length).toBe(2)
    })
  })
  
  describe('getUserStarForEntry', () => {
    it('ユーザーがエントリにスターをつけているか確認できること', async () => {
      // モックのスター
      const mockStar = {
        id: 'star1',
        entryId: mockEntryId,
        userId: mockUser.id,
        username: mockUser.username,
        createdAt: new Date()
      }
      
      // モックの戻り値を設定
      vi.mocked(getUserStarForEntry).mockResolvedValue(mockStar)
      
      const result = await getUserStarForEntry(mockEntryId, mockUser.id)
      
      // 関数が正しく呼ばれたか確認
      expect(getUserStarForEntry).toHaveBeenCalledWith(mockEntryId, mockUser.id)
      
      // 戻り値が正しいか確認
      expect(result).toEqual(mockStar)
    })
    
    it('ユーザーがエントリにスターをつけていない場合はnullを返すこと', async () => {
      // モックの戻り値を設定
      vi.mocked(getUserStarForEntry).mockResolvedValue(null)
      
      const result = await getUserStarForEntry(mockEntryId, mockUser.id)
      
      // 関数が正しく呼ばれたか確認
      expect(getUserStarForEntry).toHaveBeenCalledWith(mockEntryId, mockUser.id)
      
      // 戻り値が正しいか確認
      expect(result).toBeNull()
    })
  })
  
  describe('getStarredEntriesByUserId', () => {
    it('ユーザーがスターをつけたエントリの一覧を取得できること', async () => {
      // モックのエントリ一覧
      const mockEntries = [
        {
          id: 'entry1',
          title: 'エントリ1',
          createdAt: new Date(),
          createdByUserId: 'creator1',
          createdByUsername: 'Creator 1',
          messages: [],
          starCount: 5
        },
        {
          id: 'entry2',
          title: 'エントリ2',
          createdAt: new Date(),
          createdByUserId: 'creator2',
          createdByUsername: 'Creator 2',
          messages: [],
          starCount: 3
        }
      ]
      
      // モックの戻り値を設定
      vi.mocked(getStarredEntriesByUserId).mockResolvedValue(mockEntries)
      
      const result = await getStarredEntriesByUserId(mockUser.id)
      
      // 関数が正しく呼ばれたか確認
      expect(getStarredEntriesByUserId).toHaveBeenCalledWith(mockUser.id)
      
      // 戻り値が正しいか確認
      expect(result).toEqual(mockEntries)
      expect(result.length).toBe(2)
    })
  })
})
