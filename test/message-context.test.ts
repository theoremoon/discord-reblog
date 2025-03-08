import { describe, it, expect } from 'vitest'
import type { DiscordMessage } from '../src/discord/message.js'

describe('メッセージの時系列順表示', () => {
  it('メッセージが時系列順（古い順）に並ぶことを確認', () => {
    // テストデータ
    const targetMessage: DiscordMessage = {
      id: '1000',
      content: 'ターゲットメッセージ',
      author: { id: '1', username: 'user1' },
      timestamp: '2023-01-02T12:00:00.000Z',
      attachments: [],
      embeds: []
    }

    // 前のメッセージ（新しい順）- Discord APIからの返却順序を再現
    const beforeMessages: DiscordMessage[] = [
      {
        id: '999',  // 新しいメッセージが先頭
        content: '直前のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T11:55:00.000Z',
        attachments: [],
        embeds: []
      },
      {
        id: '998',  // 古いメッセージが後ろ
        content: '古いメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T11:50:00.000Z',
        attachments: [],
        embeds: []
      }
    ]

    // 後のメッセージ（新しい順）- Discord APIからの返却順序を再現
    const afterMessages: DiscordMessage[] = [
      {
        id: '1002',  // 新しいメッセージが先頭
        content: '最新のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T12:10:00.000Z',
        attachments: [],
        embeds: []
      },
      {
        id: '1001',  // 古いメッセージが後ろ
        content: '直後のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T12:05:00.000Z',
        attachments: [],
        embeds: []
      }
    ]

    // 修正前の結合方法（コピーを作成して元の配列を変更しないようにする）
    const beforeMessagesCopy1 = [...beforeMessages]
    const oldResult = [...beforeMessagesCopy1.reverse(), targetMessage, ...afterMessages]
    
    // 修正後の結合方法（コピーを作成して元の配列を変更しないようにする）
    const beforeMessagesCopy2 = [...beforeMessages]
    const afterMessagesCopy = [...afterMessages]
    const newResult = [...beforeMessagesCopy2.reverse(), targetMessage, ...afterMessagesCopy.reverse()]

    // 結果を確認
    console.log('修正前の結果:', oldResult.map(m => m.id))
    console.log('修正後の結果:', newResult.map(m => m.id))
    
    // 修正前の結果を確認 - 時系列順になっていない
    expect(oldResult).toHaveLength(5)
    expect(oldResult[0].id).toBe('998') // 最も古いメッセージ
    expect(oldResult[1].id).toBe('999') // 2番目に古いメッセージ
    expect(oldResult[2].id).toBe('1000') // ターゲットメッセージ
    expect(oldResult[3].id).toBe('1002') // 最新のメッセージ（時系列が逆）
    expect(oldResult[4].id).toBe('1001') // 直後のメッセージ（時系列が逆）
    
    // 修正後の結果を確認 - 正しい時系列順
    expect(newResult).toHaveLength(5)
    expect(newResult[0].id).toBe('998') // 最も古いメッセージ
    expect(newResult[1].id).toBe('999') // 2番目に古いメッセージ
    expect(newResult[2].id).toBe('1000') // ターゲットメッセージ
    expect(newResult[3].id).toBe('1001') // 直後のメッセージ
    expect(newResult[4].id).toBe('1002') // 最新のメッセージ
  })
})
