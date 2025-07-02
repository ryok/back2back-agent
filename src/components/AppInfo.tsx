'use client';

export function AppInfo() {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '20px',
      borderRadius: '12px',
      margin: '20px 0',
      border: '1px solid #333',
    }}>
      <h3 style={{ marginBottom: '15px', color: '#00a8ff' }}>🎵 Back2Back DJ - Preview Mode</h3>
      
      <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6' }}>
        この Back2Back DJ アプリは、人間とAIが協力してDJセッションを行うアプリケーションです。
        現在は <strong>プレビューモード</strong> で動作しており、各楽曲の30秒プレビューを使用しています。
      </p>
      
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>使い方：</h4>
        <ol style={{ marginLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>Spotify検索で楽曲を探して、Human DJデッキにロード</li>
          <li>「🤖 Request AI Selection」をクリックして、AIに相性の良い楽曲を選んでもらう</li>
          <li>各デッキの再生ボタン（▶）で30秒プレビューを再生</li>
          <li>クロスフェーダーで左右のデッキの音量バランスを調整</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
        <strong>注意：</strong> Spotify Web Playback SDKの接続問題により、フル楽曲の再生機能は現在無効化されています。
        プレビュー再生は正常に動作します。
      </div>
    </div>
  );
}