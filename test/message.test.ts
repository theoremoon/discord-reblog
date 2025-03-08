import { describe, it, expect } from 'vitest'
import { parseMessageLink } from '../src/discord/message.js'

describe('parseMessageLink', () => {
  it('正しいDiscordメッセージリンクを解析できる', () => {
    const link = 'https://discord.com/channels/366947523866132500/366947523866132502/1234567890123456789'
    const result = parseMessageLink(link)
    
    expect(result).toEqual({
      guildId: '366947523866132500',
      channelId: '366947523866132502',
      messageId: '1234567890123456789'
    })
  })
  
  it('不正なURLの場合はnullを返す', () => {
    const link = 'https://example.com'
    const result = parseMessageLink(link)
    
    expect(result).toBeNull()
  })
  
  it('Discordのドメインだが形式が異なる場合はnullを返す', () => {
    const link = 'https://discord.com/app'
    const result = parseMessageLink(link)
    
    expect(result).toBeNull()
  })
  
  it('形式は正しいがパスの要素数が足りない場合はnullを返す', () => {
    const link = 'https://discord.com/channels/366947523866132500'
    const result = parseMessageLink(link)
    
    expect(result).toBeNull()
  })
})
