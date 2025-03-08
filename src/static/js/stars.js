document.addEventListener('DOMContentLoaded', () => {
  // スターボタンのイベントリスナー
  document.querySelectorAll('.star-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const button = e.currentTarget;
      const entryId = button.dataset.entryId;
      const action = button.dataset.action;
      
      try {
        let response;
        
        if (action === 'add-star') {
          // スターを追加
          response = await fetch('/api/stars/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entryId }),
          });
        } else if (action === 'remove-star') {
          // スターを削除
          response = await fetch('/api/stars/remove', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entryId }),
          });
        }
        
        if (response && response.ok) {
          // ページをリロード
          window.location.reload();
        } else {
          const error = await response.json();
          alert(`エラー: ${error.error || '不明なエラーが発生しました'}`);
        }
      } catch (error) {
        console.error('スター操作エラー:', error);
        alert('エラーが発生しました。もう一度お試しください。');
      }
    });
  });
});
