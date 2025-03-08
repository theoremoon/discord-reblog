import type { DiscordMessage } from '../discord/message.js'
import { saveReblogEntry, type ReblogEntry } from '../firestore/index.js'
import type { User } from '../types.js'

/**
 * 選択されたメッセージからReblogエントリを作成する
 */
export async function createReblogEntry(
  messages: DiscordMessage[],
  title: string,
  description: string,
  user: User
): Promise<string> {
  // メッセージを時系列順（古い順）に並べる
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })
  
  // Reblogエントリを作成
  const reblogEntry: Omit<ReblogEntry, 'id'> = {
    title,
    description,
    createdAt: new Date(),
    createdByUserId: user.id,
    createdByUsername: user.username,
    messages: sortedMessages
  }
  
  // Firestoreに保存
  return await saveReblogEntry(reblogEntry)
}

/**
 * メッセージのHTMLを生成する
 */
export function renderMessageHtml(message: DiscordMessage, isHighlighted: boolean = false): string {
  // 添付ファイルのHTML
  const attachmentsHtml = message.attachments.length > 0 
    ? `
      <div class="message-attachments">
        ${message.attachments.map(attachment => `
          <div class="message-attachment">
            ${attachment.content_type?.startsWith('image/') 
              ? `<img src="${attachment.url}" alt="${attachment.filename}">`
              : `<a href="${attachment.url}" target="_blank">${attachment.filename}</a>`
            }
          </div>
        `).join('')}
      </div>
    ` 
    : '';
  
  // リアクションのHTML
  const reactionsHtml = message.reactions && message.reactions.length > 0
    ? `
      <div class="message-reactions">
        ${message.reactions.map(reaction => {
          // カスタム絵文字かどうかで表示を分ける
          const emojiHtml = reaction.emoji.id
            ? `<img class="emoji" src="https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png" alt="${reaction.emoji.name}">`
            : reaction.emoji.name;
          
          return `
            <div class="reaction" title="${reaction.count}人がリアクション">
              ${emojiHtml} <span class="reaction-count">${reaction.count}</span>
            </div>
          `;
        }).join('')}
      </div>
    `
    : '';
  
  // メッセージのHTML
  return `
    <div class="message ${isHighlighted ? 'highlight' : ''}" data-message-id="${message.id}">
      <div class="message-header">
        ${message.author.avatar 
          ? `<img src="https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png" alt="Avatar" class="message-avatar">` 
          : ''}
        <span class="message-author">${message.author.global_name || message.author.username}</span>
        <span class="message-timestamp">${new Date(message.timestamp).toLocaleString('ja-JP')}</span>
      </div>
      <div class="message-content">
        ${message.content ? escapeHtml(message.content) : '<em>メッセージ内容がありません</em>'}
      </div>
      ${attachmentsHtml}
      ${reactionsHtml}
    </div>
  `;
}

/**
 * HTMLエスケープ関数
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>')
}
