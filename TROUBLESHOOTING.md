# Spotify認証エラーの解決方法

## 発生しているエラー

- `Failed to authenticate player: Authentication failed`
- `429 Too Many Requests` (レート制限)
- WebSocket接続失敗

## 解決手順

### 1. 認証の再設定

現在のSpotify認証をクリアして再設定する必要があります：

1. **ブラウザのDevToolsでCookieを削除**
   - F12を押してDevToolsを開く
   - Applicationタブ → Cookies → `http://localhost:3000`
   - `spotify_access_token` と `spotify_refresh_token` を削除
   - ページをリロード

2. **Spotify Dashboardで設定確認**
   - [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - アプリの設定で以下を確認：
     - Redirect URIs: `http://localhost:3000/api/auth/spotify/callback`
     - Web Playback SDKが有効化されている

### 2. 環境変数の確認

`.env`ファイルが正しく設定されているか確認：

```env
SPOTIFY_CLIENT_ID=your_actual_client_id
SPOTIFY_CLIENT_SECRET=your_actual_client_secret  
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

### 3. スコープの問題

最小限のスコープに変更しました：
- `user-read-private`
- `user-read-email`
- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`
- `streaming`

### 4. 再認証手順

1. サーバーを再起動:
   ```bash
   # Ctrl+C で停止
   npm run dev
   ```

2. ブラウザでアプリにアクセス
3. 「Login with Spotify」をクリック
4. Spotifyで認証を完了
5. リダイレクト後、Web Playerが初期化されるまで待つ

### 5. デバッグ情報の確認

右上のデバッグパネルで以下を確認：
- Web Player Device IDが表示される
- Available Devicesに「Back2Back DJ Player」が表示される
- 必要に応じて「Activate Web Player」をクリック

### 6. よくある問題

**A. Spotify Premiumアカウント**
- Web Playback SDKはPremiumアカウントでのみ動作
- 無料アカウントでは認証エラーが発生する可能性

**B. 複数のブラウザタブ**
- 複数のタブで同時にWeb Playerを使用するとエラーが発生
- 他のSpotifyアプリ（デスクトップアプリなど）を閉じる

**C. ブラウザの自動再生ポリシー**
- 最初に手動でPlayボタンをクリックする必要
- Chrome、Safari、Firefoxで動作を確認済み

## 最終的な確認

1. コンソールエラーがクリアされる
2. デバッグパネルでデバイスが認識される
3. 「▶ Play」ボタンで音楽が再生される

これらの手順で解決しない場合、コンソールの新しいエラーメッセージを確認してください。