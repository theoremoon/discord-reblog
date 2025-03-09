import type { FC } from 'hono/jsx'

export const GlobalStyles: FC = () => {
  return (
    <style>{`
      body {
        font-family: 'Arial', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background-color: #f9f9f9;
        color: #333;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      .main-nav {
        display: flex;
        gap: 1.5rem;
      }
      .nav-link {
        text-decoration: none;
        color: #5865F2;
        font-weight: 500;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      .nav-link:hover {
        background-color: #f0f2ff;
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
        transition: all 0.2s ease;
      }
      .logout-button {
        background-color: #f44336;
      }
      .logout-button:hover {
        background-color: #d32f2f;
      }
      .reblog-button {
        background-color: #43b581;
      }
      .reblog-button:hover:not(:disabled) {
        background-color: #3ca374;
      }
      .reblog-button:disabled {
        background-color: #a0d8bc;
        cursor: not-allowed;
      }
      .message-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        margin-bottom: 2rem;
        transition: all 0.3s ease;
      }
      .message {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        position: relative;
        transition: all 0.2s ease;
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
      .message:hover {
        background-color: #f9f9f9;
      }
      .message-checkbox {
        position: absolute;
        top: 1rem;
        right: 1rem;
        transform: scale(1.2);
        cursor: pointer;
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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
        word-break: break-word;
        line-height: 1.5;
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
      }
      .message-attachment img:hover {
        transform: scale(1.02);
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
        transition: all 0.2s ease;
        cursor: default;
      }
      .reaction:hover {
        background-color: #e3e5e8;
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
        transition: all 0.2s ease;
      }
      .load-more-button:hover:not(:disabled) {
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
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: border-color 0.2s ease;
      }
      .message-input:focus {
        border-color: #5865F2;
        outline: none;
        box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
      }
      .submit-button {
        background-color: #5865F2;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s ease;
      }
      .submit-button:hover {
        background-color: #4752C4;
      }
      .error-message {
        color: #f44336;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
        border-left: 3px solid #f44336;
      }
      .form-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border: 1px solid #eee;
        border-radius: 8px;
        background-color: #f9f9f9;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      .form-section h3 {
        margin-top: 0;
        color: #5865F2;
      }
      .channel-select {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        margin-bottom: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: border-color 0.2s ease;
      }
      .channel-select:focus {
        border-color: #5865F2;
        outline: none;
        box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
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
      
      /* Reblog Timeline Styles */
      .reblog-entry {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      .reblog-entry:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      }
      .reblog-header {
        padding: 1.2rem;
        border-bottom: 1px solid #eee;
        background-color: #f8f9fa;
      }
      .reblog-title {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: #5865F2;
      }
      .reblog-title a {
        color: #5865F2;
        text-decoration: none;
        transition: color 0.2s ease;
      }
      .reblog-title a:hover {
        color: #4752C4;
        text-decoration: underline;
      }
      .reblog-description {
        color: #666;
        margin-bottom: 0.8rem;
        line-height: 1.5;
      }
      .reblog-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.85rem;
        color: #888;
      }
      .message-preview {
        padding: 1.2rem;
        background-color: white;
      }
      .message-preview-count {
        text-align: center;
        padding: 0.8rem;
        background-color: #f8f9fa;
        border-top: 1px solid #eee;
      }
      .message-preview-count a {
        color: #5865F2;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      .message-preview-count a:hover {
        color: #4752C4;
        text-decoration: underline;
      }
      .month-section {
        margin-bottom: 2.5rem;
      }
      .month-header {
        position: relative;
        margin-bottom: 1.2rem;
        padding-bottom: 0.5rem;
        color: #333;
        font-size: 1.3rem;
        cursor: pointer;
        user-select: none;
      }
      .month-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, #5865F2, transparent);
      }
      .month-header::before {
        content: '▼';
        display: inline-block;
        margin-right: 0.5rem;
        font-size: 0.8rem;
        transition: transform 0.3s ease;
      }
      .month-header.collapsed::before {
        transform: rotate(-90deg);
      }
      .month-content {
        transition: max-height 0.5s ease, opacity 0.3s ease;
        max-height: 2000px;
        opacity: 1;
        overflow: hidden;
      }
      .month-content.collapsed {
        max-height: 0;
        opacity: 0;
      }
      .no-entries {
        text-align: center;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      /* Reblog Form Modal Styles */
      .reblog-form-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      .reblog-form-container.visible {
        opacity: 1;
        visibility: visible;
      }
      .reblog-form {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 95%;
        max-width: 650px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        transform: translateY(20px);
        transition: transform 0.3s ease;
      }
      .reblog-form-container.visible .reblog-form {
        transform: translateY(0);
      }
      .reblog-form h3 {
        margin-top: 0;
        color: #5865F2;
        border-bottom: 2px solid #eee;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }
      .form-group {
        margin-bottom: 1.5rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.8rem;
        font-weight: 600;
        color: #333;
        font-size: 1.1rem;
      }
      .form-group input[type="text"],
      .form-group textarea {
        width: 100%;
        padding: 1.5rem;
        border: 3px solid #5865F2;
        border-radius: 12px;
        font-size: 1.2rem;
        transition: all 0.3s ease;
        background-color: #f9f9f9;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 0.5rem;
      }
      .form-group input[type="text"]:hover,
      .form-group textarea:hover {
        border-color: #4752C4;
        background-color: #fff;
      }
      .form-group input[type="text"]:focus,
      .form-group textarea:focus {
        border-color: #4752C4;
        outline: none;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 16px rgba(88, 101, 242, 0.2);
      }
      .form-group input[type="text"]::placeholder,
      .form-group textarea::placeholder {
        color: #aaa;
        font-style: italic;
        opacity: 0.8;
      }
      .form-group textarea {
        min-height: 180px;
        resize: vertical;
        line-height: 1.6;
      }
      .selected-messages {
        max-height: 200px;
        overflow-y: auto;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.8rem;
        background-color: #f9f9f9;
      }
      .message-preview {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        background-color: #f9f9f9;
        border-radius: 8px;
        margin-bottom: 0.8rem;
        transition: all 0.2s ease;
      }
      .message-preview:hover {
        background-color: #f0f2ff;
      }
      .message-preview:last-child {
        margin-bottom: 0;
        border-bottom: none;
      }
      .form-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1.5rem;
        margin-top: 2rem;
      }
      .cancel-button {
        background-color: #f2f2f2;
        color: #333;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1rem;
        transition: all 0.2s ease;
        font-weight: 500;
      }
      .cancel-button:hover {
        background-color: #e0e0e0;
      }
      .submit-button {
        background-color: #43b581;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
      }
      .submit-button:hover {
        background-color: #3ca374;
      }
      
      /* Animation for new content */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in {
        animation: fadeIn 0.5s ease forwards;
      }
    `}</style>
  )
}
