import type { FC } from 'hono/jsx'

export const GlobalStyles: FC = () => {
  return (
    <style>{`
      body {
        font-family: 'Arial', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      .user-info {
        display: flex;
        align-items: center;
      }
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 1rem;
      }
      .logout-button, .back-button, .reblog-button {
        background-color: #5865F2;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        margin-left: 1rem;
      }
      .logout-button {
        background-color: #f44336;
      }
      .reblog-button {
        background-color: #43b581;
      }
      .reblog-button:disabled {
        background-color: #a0d8bc;
        cursor: not-allowed;
      }
      .message-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        margin-bottom: 2rem;
      }
      .message {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        position: relative;
      }
      .message:last-child {
        border-bottom: none;
      }
      .message.highlight {
        background-color: #f0f7ff;
        border-left: 4px solid #5865F2;
      }
      .message.selected {
        background-color: #e3f2fd;
      }
      .message-checkbox {
        position: absolute;
        top: 1rem;
        right: 1rem;
      }
      .message-header {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 0.5rem;
      }
      .message-author {
        font-weight: bold;
        margin-right: 0.5rem;
      }
      .message-timestamp {
        color: #666;
        font-size: 0.8rem;
      }
      .message-content {
        white-space: pre-wrap;
        word-break: break-word;
      }
      .message-attachments {
        margin-top: 0.5rem;
      }
      .message-attachment {
        display: block;
        margin-top: 0.5rem;
      }
      .message-attachment img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 4px;
      }
      .message-reactions {
        display: flex;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      .reaction {
        display: flex;
        align-items: center;
        background-color: #f2f3f5;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }
      .reaction .emoji {
        width: 20px;
        height: 20px;
        margin-right: 0.25rem;
      }
      .reaction-count {
        color: #666;
        margin-left: 0.25rem;
      }
      .load-more-container {
        text-align: center;
        margin: 1rem 0;
      }
      .load-more-button {
        background-color: #5865F2;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .load-more-button:hover {
        background-color: #4752C4;
      }
      .load-more-button:disabled {
        background-color: #99A0E8;
        cursor: not-allowed;
      }
      .loading-indicator {
        margin-top: 0.5rem;
        color: #666;
      }
      .message-form {
        margin-bottom: 2rem;
      }
      .message-input {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        margin-bottom: 1rem;
      }
      .submit-button {
        background-color: #5865F2;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }
      .error-message {
        color: #f44336;
        margin-bottom: 1rem;
      }
      .form-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border: 1px solid #eee;
        border-radius: 8px;
        background-color: #f9f9f9;
      }
      .form-section h3 {
        margin-top: 0;
      }
      .channel-select {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        margin-bottom: 1rem;
      }
      .or-divider {
        display: flex;
        align-items: center;
        margin: 2rem 0;
        color: #666;
      }
      .or-divider::before,
      .or-divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #ddd;
      }
      .or-divider::before {
        margin-right: 1rem;
      }
      .or-divider::after {
        margin-left: 1rem;
      }
    `}</style>
  )
}
