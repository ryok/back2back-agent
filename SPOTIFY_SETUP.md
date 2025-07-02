# Spotify App Setup Guide

## 1. Spotify Developer Dashboardでアプリを設定

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)にアクセス
2. "Create app"をクリック
3. 以下の情報を入力：
   - **App name**: Back2Back DJ (任意の名前)
   - **App description**: Collaborative DJ application with AI
   - **Website**: http://localhost:3000 (開発用)
   - **Redirect URIs**: **必ず以下のURIを正確に追加**
     ```
     http://localhost:3000/api/auth/spotify/callback
     ```
   - **Which API/SDKs are you planning to use?**: 
     - Web API
     - Web Playback SDK

4. "Save"をクリック

## 2. 認証情報を取得

1. 作成したアプリの設定ページで"Settings"をクリック
2. **Client ID**をコピー
3. "View client secret"をクリックして**Client Secret**を表示・コピー

## 3. 環境変数を設定

`.env`ファイルを作成（`.env.example`をコピー）して、以下を設定：

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

## 4. よくあるエラーと解決方法

### "INVALID_CLIENT: Invalid redirect URI"エラー

このエラーは、アプリケーションで使用しているリダイレクトURIとSpotify Dashboardに登録されているURIが完全に一致していない場合に発生します。

**確認事項：**
- URIが完全に一致しているか（大文字小文字、スラッシュの有無など）
- 末尾にスラッシュがないか
- httpとhttpsを間違えていないか
- ポート番号（:3000）が含まれているか

**正しいURI：**
```
http://localhost:3000/api/auth/spotify/callback
```

**間違った例：**
- `http://localhost:3000/api/auth/spotify/callback/` (末尾のスラッシュ)
- `https://localhost:3000/api/auth/spotify/callback` (https)
- `http://localhost/api/auth/spotify/callback` (ポート番号なし)

## 5. 開発環境での注意点

- 開発中は`http://localhost:3000`を使用
- 本番環境では、実際のドメインでリダイレクトURIを更新する必要があります
- Spotify Premiumアカウントが必要です（Web Playback SDK使用のため）