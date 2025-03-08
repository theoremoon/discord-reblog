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
        
        <div className="actions-container" style={{ marginBottom: '1rem' }}>
          <button id="reblogButton" className="reblog-button" disabled>
            <i className="action-icon">📋</i> 選択したメッセージをReblog
          </button>
          <span id="selectedCount" style={{ marginLeft: '1rem', color: '#666' }}>0件選択中</span>
        </div>
        
        <div className="load-more-container top">
          <button id="loadMoreBefore" className="load-more-button">
            <i className="action-icon">⬆️</i> 過去のメッセージをもっと読み込む
          </button>
          <div id="loadingBefore" className="loading-indicator" style={{ display: 'none' }}>読み込み中...</div>
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
        
        <div className="load-more-container bottom">
          <button id="loadMoreAfter" className="load-more-button">
            <i className="action-icon">⬇️</i> 新しいメッセージをもっと読み込む
          </button>
          <div id="loadingAfter" className="loading-indicator" style={{ display: 'none' }}>読み込み中...</div>
        </div>
        
        {/* Reblogフォーム */}
        <div className="reblog-form-container" id="reblogFormContainer">
          <div className="reblog-form">
            <h3><i className="form-icon">📝</i> Reblogエントリの作成</h3>
            <form id="reblogForm" action="/create-reblog" method="post">
              <div className="form-group">
                <label htmlFor="title">
                  <i className="form-icon">✏️</i> タイトル <span className="required-mark">*</span>
                </label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  required 
                  placeholder="Reblogのタイトルを入力してください" 
                  className="title-input"
                />
                <div className="form-hint">わかりやすいタイトルをつけましょう</div>
              </div>
              <div className="form-group">
                <label htmlFor="description">
                  <i className="form-icon">📄</i> 説明
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  placeholder="このReblogの内容や目的について説明してください（任意）"
                  className="description-input"
                ></textarea>
                <div className="form-hint">Reblogの内容や目的を簡潔に説明しましょう</div>
              </div>
              <div className="form-group">
                <label>
                  <i className="form-icon">💬</i> 選択したメッセージ
                </label>
                <div className="selected-messages-container">
                  <div className="selected-messages" id="selectedMessages"></div>
                  <div className="message-count" id="messageCount"></div>
                </div>
                <input type="hidden" id="messageIds" name="messageIds" />
                <input type="hidden" id="channelId" name="channelId" value={channelId} />
              </div>
              <div className="form-buttons">
                <button type="button" className="cancel-button" id="cancelButton">
                  <i className="action-icon">✖️</i> キャンセル
                </button>
                <button type="submit" className="submit-button">
                  <i className="action-icon">💾</i> 保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        .action-icon, .form-icon {
          font-style: normal;
          margin-right: 0.3rem;
        }
        .message-count {
          text-align: right;
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.5rem;
        }
        .form-hint {
          font-size: 0.85rem;
          color: #888;
          margin-top: 0.4rem;
          font-style: italic;
        }
        .required-mark {
          color: #f44336;
          margin-left: 0.2rem;
        }
        .title-input, .description-input {
          font-family: 'Arial', sans-serif;
          width: 100%;
          padding: 1.5rem;
          border: 3px solid #5865F2;
          border-radius: 12px;
          font-size: 1.3rem;
          transition: all 0.3s ease;
          background: linear-gradient(to bottom, #ffffff, #f5f7ff);
          letter-spacing: 0.02em;
          margin-bottom: 0.5rem;
        }
        .title-input:hover, .description-input:hover {
          border-color: #4752C4;
        }
        .title-input:focus, .description-input:focus {
          border-color: #4752C4;
          outline: none;
        }
        .description-input {
          min-height: 180px;
          font-size: 1.2rem;
          line-height: 1.6;
          resize: vertical;
        }
        .selected-messages-container {
          border: 3px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          background-color: #f9f9f9;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .selected-messages-container:hover {
          border-color: #ccc;
        }
        .selected-messages {
          max-height: 250px;
          overflow-y: auto;
          padding: 1.2rem;
          border-radius: 0;
          border: none;
          margin-bottom: 0;
        }
        .preview-message-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .preview-author {
          font-weight: bold;
          margin-left: 0.5rem;
        }
        .preview-content {
          padding-left: 2.5rem;
          color: #333;
          line-height: 1.5;
        }
      `}</style>

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
          const messageCountDisplay = document.getElementById('messageCount');
          
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
            let selectedMessageElements = [];
            
            document.querySelectorAll('.message').forEach(message => {
              const messageId = message.getAttribute('data-message-id');
              if (selectedMessages.has(messageId)) {
                // メッセージの簡易プレビューを作成
                const author = message.querySelector('.message-author').textContent;
                const content = message.querySelector('.message-content').textContent;
                const avatar = message.querySelector('.message-avatar');
                const avatarSrc = avatar ? avatar.getAttribute('src') : '';
                
                const preview = document.createElement('div');
                preview.className = 'message-preview';
                
                let previewHtml = '<div class="preview-message-header">';
                if (avatarSrc) {
                  previewHtml += \`<img src="\${avatarSrc}" alt="Avatar" class="message-avatar">\`;
                }
                previewHtml += \`<strong class="preview-author">\${author}</strong></div>\`;
                previewHtml += \`<div class="preview-content">\${content.substring(0, 100)}\${content.length > 100 ? '...' : ''}</div>\`;
                
                preview.innerHTML = previewHtml;
                selectedMessageElements.push(preview);
              }
            });
            
            // メッセージを時系列順にソート
            selectedMessageElements.forEach(element => {
              selectedMessagesContainer.appendChild(element);
            });
            
            // メッセージ数を表示
            messageCountDisplay.textContent = \`選択されたメッセージ: \${selectedMessages.size}件\`;
            
            // フォームを表示
            reblogFormContainer.classList.add('visible');
            
            // タイトル入力欄にフォーカス
            document.getElementById('title').focus();
          });
          
          // キャンセルボタンのクリックイベント
          cancelButton.addEventListener('click', () => {
            reblogFormContainer.classList.remove('visible');
          });
          
          // フォーム外クリックでも閉じる
          reblogFormContainer.addEventListener('click', (event) => {
            if (event.target === reblogFormContainer) {
              reblogFormContainer.classList.remove('visible');
            }
          });
          
          // フォーム送信イベント
          reblogForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(reblogForm);
            const submitButton = reblogForm.querySelector('.submit-button');
            
            // 送信中は保存ボタンを無効化
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="action-icon">⏳</i> 保存中...';
            
            try {
              const response = await fetch('/create-reblog', {
                method: 'POST',
                body: formData
              });
              
              if (response.ok) {
                const result = await response.json();
                window.location.href = \`/reblog/\${result.id}\`;
              } else {
                const errorData = await response.json();
                alert(\`Reblogの作成に失敗しました: \${errorData.error || '不明なエラー'}\`);
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="action-icon">💾</i> 保存';
              }
            } catch (error) {
              console.error('Reblog作成エラー:', error);
              alert('Reblogの作成に失敗しました');
              submitButton.disabled = false;
              submitButton.innerHTML = '<i class="action-icon">💾</i> 保存';
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
                
                // 新しく追加されたメッセージにイベントリスナーを設定
                setupMessageSelection();
                
                // 新しく追加されたメッセージにフェードインアニメーションを適用
                const newMessages = Array.from(messageContainer.querySelectorAll('.message')).slice(0, data.messages.length);
                newMessages.forEach((message, index) => {
                  message.classList.add('fade-in');
                  message.style.animationDelay = \`\${index * 0.05}s\`;
                });
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
                
                // 新しく追加されたメッセージにイベントリスナーを設定
                setupMessageSelection();
                
                // 新しく追加されたメッセージにフェードインアニメーションを適用
                const allMessages = Array.from(messageContainer.querySelectorAll('.message'));
                const newMessages = allMessages.slice(allMessages.length - data.messages.length);
                newMessages.forEach((message, index) => {
                  message.classList.add('fade-in');
                  message.style.animationDelay = \`\${index * 0.05}s\`;
                });
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
