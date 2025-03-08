import type { FC } from 'hono/jsx'
import type { User } from '../types.js'
import type { DiscordMessage } from '../discord/message.js'
import { Layout } from './Layout.js'
import { Header } from './Header.js'
import { GlobalStyles } from './GlobalStyles.js'
import { Message } from './Message.js'

type MessagePageProps = {
  user: User
  messages: DiscordMessage[]
  channelId: string
  messageId: string
}

export const MessagePage: FC<MessagePageProps> = ({ 
  user, 
  messages, 
  channelId, 
  messageId 
}) => {
  return (
    <Layout title="Discord Reblog - メッセージ">
      <GlobalStyles />
      <Header user={user} />
      <main>
        <h2>メッセージ</h2>
        
        <div className="load-more-container top">
          <button id="loadMoreBefore" className="load-more-button">過去のメッセージをもっと読み込む</button>
          <div id="loadingBefore" className="loading-indicator" style={{ display: 'none' }}>読み込み中...</div>
        </div>
        
        <div className="actions-container" style={{ marginBottom: '1rem' }}>
          <button id="reblogButton" className="reblog-button" disabled>選択したメッセージをReblog</button>
          <span id="selectedCount" style={{ marginLeft: '1rem', color: '#666' }}>0件選択中</span>
        </div>
        
        <div className="message-container" id="messageContainer">
          {messages.map(message => (
            <Message 
              key={message.id}
              message={message}
              isHighlighted={message.id === messageId}
              showCheckbox={true}
            />
          ))}
        </div>
        
        {/* Reblogフォーム */}
        <div className="reblog-form-container" id="reblogFormContainer" style={{ display: 'none' }}>
          <div className="reblog-form">
            <h3>Reblogエントリの作成</h3>
            <form id="reblogForm" action="/create-reblog" method="post">
              <div className="form-group">
                <label htmlFor="title">タイトル</label>
                <input type="text" id="title" name="title" required />
              </div>
              <div className="form-group">
                <label htmlFor="description">説明</label>
                <textarea id="description" name="description"></textarea>
              </div>
              <div className="form-group">
                <label>選択したメッセージ</label>
                <div className="selected-messages" id="selectedMessages"></div>
                <input type="hidden" id="messageIds" name="messageIds" />
                <input type="hidden" id="channelId" name="channelId" value={channelId} />
              </div>
              <div className="form-buttons">
                <button type="button" className="cancel-button" id="cancelButton">キャンセル</button>
                <button type="submit" className="submit-button">保存</button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="load-more-container bottom">
          <button id="loadMoreAfter" className="load-more-button">新しいメッセージをもっと読み込む</button>
          <div id="loadingAfter" className="loading-indicator" style={{ display: 'none' }}>読み込み中...</div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{ __html: `
        // メッセージの継ぎ足し読み込み用のJavaScript
        document.addEventListener('DOMContentLoaded', () => {
          const messageContainer = document.getElementById('messageContainer');
          const loadMoreBefore = document.getElementById('loadMoreBefore');
          const loadMoreAfter = document.getElementById('loadMoreAfter');
          const loadingBefore = document.getElementById('loadingBefore');
          const loadingAfter = document.getElementById('loadingAfter');
          const reblogButton = document.getElementById('reblogButton');
          const selectedCount = document.getElementById('selectedCount');
          const reblogFormContainer = document.getElementById('reblogFormContainer');
          const cancelButton = document.getElementById('cancelButton');
          const reblogForm = document.getElementById('reblogForm');
          const messageIdsInput = document.getElementById('messageIds');
          const selectedMessagesContainer = document.getElementById('selectedMessages');
          
          // チャンネルIDとメッセージIDを取得
          const channelId = '${channelId}';
          const messageId = '${messageId}';
          
          // 選択されたメッセージを追跡
          const selectedMessages = new Set();
          
          // 最初と最後のメッセージIDを追跡
          let firstMessageId = '';
          let lastMessageId = '';
          
          // 初期化時に最初と最後のメッセージIDを設定
          function initializeMessageIds() {
            const messages = document.querySelectorAll('.message');
            if (messages.length > 0) {
              firstMessageId = messages[0].getAttribute('data-message-id');
              lastMessageId = messages[messages.length - 1].getAttribute('data-message-id');
            }
          }
          
          // メッセージ選択の処理
          function setupMessageSelection() {
            // 既存のチェックボックスにイベントリスナーを設定
            document.querySelectorAll('.message-checkbox').forEach(checkbox => {
              checkbox.addEventListener('change', handleCheckboxChange);
            });
            
            // メッセージクリックでもチェックボックスを切り替え
            document.querySelectorAll('.message').forEach(message => {
              message.addEventListener('click', (event) => {
                // チェックボックス自体のクリックは除外
                if (event.target.classList.contains('message-checkbox')) {
                  return;
                }
                
                // メッセージ内のリンクやボタンのクリックは除外
                if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON' || 
                    event.target.closest('a') || event.target.closest('button')) {
                  return;
                }
                
                const messageId = message.getAttribute('data-message-id');
                const checkbox = message.querySelector('.message-checkbox');
                checkbox.checked = !checkbox.checked;
                
                // チェックボックスの変更イベントを発火
                const changeEvent = new Event('change');
                checkbox.dispatchEvent(changeEvent);
              });
            });
          }
          
          // チェックボックスの変更イベントハンドラ
          function handleCheckboxChange(event) {
            const checkbox = event.target;
            const messageId = checkbox.getAttribute('data-message-id');
            const messageElement = checkbox.closest('.message');
            
            if (checkbox.checked) {
              selectedMessages.add(messageId);
              messageElement.classList.add('selected');
            } else {
              selectedMessages.delete(messageId);
              messageElement.classList.remove('selected');
            }
            
            // 選択数を更新
            selectedCount.textContent = \`\${selectedMessages.size}件選択中\`;
            
            // Reblogボタンの有効/無効を切り替え
            reblogButton.disabled = selectedMessages.size === 0;
          }
          
          // Reblogボタンのクリックイベント
          reblogButton.addEventListener('click', () => {
            if (selectedMessages.size === 0) return;
            
            // 選択されたメッセージIDをフォームに設定
            messageIdsInput.value = Array.from(selectedMessages).join(',');
            
            // 選択されたメッセージのプレビューを表示
            selectedMessagesContainer.innerHTML = '';
            document.querySelectorAll('.message').forEach(message => {
              const messageId = message.getAttribute('data-message-id');
              if (selectedMessages.has(messageId)) {
                // メッセージの簡易プレビューを作成
                const author = message.querySelector('.message-author').textContent;
                const content = message.querySelector('.message-content').textContent;
                const preview = document.createElement('div');
                preview.className = 'message-preview';
                preview.innerHTML = \`<strong>\${author}</strong>: \${content.substring(0, 50)}\${content.length > 50 ? '...' : ''}\`;
                selectedMessagesContainer.appendChild(preview);
              }
            });
            
            // フォームを表示
            reblogFormContainer.style.display = 'flex';
          });
          
          // キャンセルボタンのクリックイベント
          cancelButton.addEventListener('click', () => {
            reblogFormContainer.style.display = 'none';
          });
          
          // フォーム送信イベント
          reblogForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(reblogForm);
            
            try {
              const response = await fetch('/create-reblog', {
                method: 'POST',
                body: formData
              });
              
              if (response.ok) {
                const result = await response.json();
                window.location.href = \`/reblog/\${result.id}\`;
              } else {
                const error = await response.text();
                alert(\`Reblogの作成に失敗しました: \${error}\`);
              }
            } catch (error) {
              console.error('Reblog作成エラー:', error);
              alert('Reblogの作成に失敗しました');
            }
          });
          
          // 過去のメッセージを読み込む
          async function loadMessagesBefore() {
            if (!firstMessageId) return;
            
            loadingBefore.style.display = 'block';
            loadMoreBefore.disabled = true;
            
            try {
              const response = await fetch(\`/api/messages/\${channelId}/\${messageId}/before?before_id=\${firstMessageId}\`);
              const data = await response.json();
              
              if (data.messages && data.messages.length > 0) {
                // 新しいメッセージをHTMLに変換
                const messagesHtml = data.messages.map(message => createMessageHtml(message)).join('');
                
                // メッセージコンテナの先頭に追加
                messageContainer.insertAdjacentHTML('afterbegin', messagesHtml);
                
                // 最初のメッセージIDを更新
                firstMessageId = data.messages[0].id;
                
                // メッセージが少ない場合はボタンを非表示
                if (data.messages.length < 5) {
                  loadMoreBefore.style.display = 'none';
                }
              } else {
                // これ以上メッセージがない場合はボタンを非表示
                loadMoreBefore.style.display = 'none';
              }
            } catch (error) {
              console.error('メッセージ読み込みエラー:', error);
              alert('メッセージの読み込みに失敗しました');
            } finally {
              loadingBefore.style.display = 'none';
              loadMoreBefore.disabled = false;
            }
          }
          
          // 新しいメッセージを読み込む
          async function loadMessagesAfter() {
            if (!lastMessageId) return;
            
            loadingAfter.style.display = 'block';
            loadMoreAfter.disabled = true;
            
            try {
              const response = await fetch(\`/api/messages/\${channelId}/\${messageId}/after?after_id=\${lastMessageId}\`);
              const data = await response.json();
              
              if (data.messages && data.messages.length > 0) {
                // 新しいメッセージをHTMLに変換
                const messagesHtml = data.messages.map(message => createMessageHtml(message)).join('');
                
                // メッセージコンテナの末尾に追加
                messageContainer.insertAdjacentHTML('beforeend', messagesHtml);
                
                // 最後のメッセージIDを更新
                lastMessageId = data.messages[data.messages.length - 1].id;
                
                // メッセージが少ない場合はボタンを非表示
                if (data.messages.length < 5) {
                  loadMoreAfter.style.display = 'none';
                }
              } else {
                // これ以上メッセージがない場合はボタンを非表示
                loadMoreAfter.style.display = 'none';
              }
            } catch (error) {
              console.error('メッセージ読み込みエラー:', error);
              alert('メッセージの読み込みに失敗しました');
            } finally {
              loadingAfter.style.display = 'none';
              loadMoreAfter.disabled = false;
            }
          }
          
          // メッセージHTMLを生成する関数
          function createMessageHtml(message) {
            return \`
              <div class="message \${message.id === messageId ? 'highlight' : ''}" data-message-id="\${message.id}">
                <input type="checkbox" class="message-checkbox" data-message-id="\${message.id}">
                <div class="message-header">
                  \${message.author.avatar 
                    ? \`<img src="https://cdn.discordapp.com/avatars/\${message.author.id}/\${message.author.avatar}.png" alt="Avatar" class="message-avatar">\` 
                    : ''}
                  <span class="message-author">\${message.author.global_name || message.author.username}</span>
                  <span class="message-timestamp">\${new Date(message.timestamp).toLocaleString('ja-JP')}</span>
                </div>
                <div class="message-content">
                  \${message.content ? escapeHtml(message.content) : '<em>メッセージ内容がありません</em>'}
                  \${message.id === messageId ? \`<div style="margin-top: 10px; font-size: 0.8rem; color: #666;">メッセージID: \${message.id}</div>\` : ''}
                </div>
                \${message.attachments.length > 0 ? \`
                  <div class="message-attachments">
                    \${message.attachments.map(attachment => \`
                      <div class="message-attachment">
                        \${attachment.content_type?.startsWith('image/') 
                          ? \`<img src="\${attachment.url}" alt="\${attachment.filename}">\`
                          : \`<a href="\${attachment.url}" target="_blank">\${attachment.filename}</a>\`
                        }
                      </div>
                    \`).join('')}
                  </div>
                \` : ''}
                \${message.reactions && message.reactions.length > 0 ? \`
                  <div class="message-reactions">
                    \${message.reactions.map(reaction => {
                      const emojiHtml = reaction.emoji.id
                        ? \`<img class="emoji" src="https://cdn.discordapp.com/emojis/\${reaction.emoji.id}.png" alt="\${reaction.emoji.name}">\`
                        : reaction.emoji.name;
                      
                      return \`
                        <div class="reaction" title="\${reaction.count}人がリアクション">
                          \${emojiHtml} <span class="reaction-count">\${reaction.count}</span>
                        </div>
                      \`;
                    }).join('')}
                  </div>
                \` : ''}
              </div>
            \`;
          }
          
          // HTMLエスケープ関数（サーバー側と同じ実装）
          function escapeHtml(text) {
            return text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
              .replace(/\\n/g, '<br>');
          }
          
          // イベントリスナーを設定
          loadMoreBefore.addEventListener('click', loadMessagesBefore);
          loadMoreAfter.addEventListener('click', loadMessagesAfter);
          
          // 初期化
          initializeMessageIds();
          setupMessageSelection();
        });
      `}} />
    </Layout>
  )
}
