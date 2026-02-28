# レッツメディア - Webサイト

このプロジェクトは、レッツメディア株式会社のコーポレートサイトです。
Three.jsを使った3Dアニメーションと、ANRI.vcスタイルのデザインを採用しています。

## プロジェクト構成

```
lets-media/
├── index.html          # メインページ
├── style.css           # スタイルシート
├── main.js             # JavaScript (Three.js 3Dアニメーション)
├── company.html        # 会社概要ページ (要作成)
├── README.md           # このファイル
└── assets/             # 画像・動画ファイル (要追加)
    ├── logoheda.jpg
    ├── letsmedia読み込み.mp4
    ├── fabicon.png
    ├── oGP.png
    └── Buildingsandundertherailwaytracksfree_ver.otf
```

## 必要なファイル

以下のファイルを元のサイトからダウンロードして、プロジェクトフォルダに配置してください:

1. **logoheda.jpg** - ヘッダーロゴ画像
2. **letsmedia読み込み.mp4** - ローディング画面の動画
3. **fabicon.png** - ファビコン
4. **oGP.png** - OGP (SNSシェア用) 画像
5. **Buildingsandundertherailwaytracksfree_ver.otf** - カスタムフォント
6. **company.html** - 会社概要ページ

### ファイルのダウンロード方法

元のサイト (https://letsmedia.vercel.app) から以下の手順でファイルをダウンロードできます:

1. ブラウザで元のサイトを開く
2. F12で開発者ツールを開く
3. Networkタブを開く
4. ページをリロード
5. 必要なファイルを右クリック→「Save」でダウンロード

## ローカルで確認する方法

1. **シンプルなHTTPサーバーを起動**

```bash
# Pythonがインストールされている場合
python -m http.server 8000

# Node.jsのhttp-serverを使う場合
npx http-server -p 8000
```

2. ブラウザで `http://localhost:8000` を開く

## Vercelにデプロイする方法

### 1. GitHubリポジトリの作成

1. GitHub Desktopを開く
2. File → New Repository
3. 名前: `lets-media-site`
4. Local Path: このフォルダ (`レッツメディア`)
5. Create Repository

### 2. ファイルをコミット

1. 全てのファイルを選択
2. Commit messageを入力 (例: "Initial commit")
3. Commit to main

### 3. GitHubにプッシュ

1. Publish repository をクリック
2. GitHubアカウントと連携
3. Publish

### 4. Vercelにデプロイ

1. https://vercel.com にアクセス
2. GitHubでログイン
3. "New Project" をクリック
4. "Import Git Repository" から `lets-media-site` を選択
5. "Deploy" をクリック

**設定不要！** Vercelが自動的に静的サイトとして認識してデプロイします。

## 使用技術

- **Three.js** - 3Dグラフィックス
- **GSAP** - アニメーションライブラリ
- **Vanilla JavaScript** - フレームワーク不使用
- **CSS3** - モダンなスタイリング
- **Google Fonts** - Noto Sans JP

## 特徴

- ✨ Three.jsによる3Dオブジェクトアニメーション
- 🎨 ページ切り替え時の背景色変更
- 📱 レスポンシブデザイン (PC・タブレット・スマホ対応)
- 🔄 スムーズなページ遷移
- 🎬 ローディングアニメーション

## ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge

## カスタマイズ

### 会社名・サービス名の変更

`index.html` の以下の箇所を編集:

```html
<title>Changer Capital レッツ</title>
<meta name="description" content="...">
```

### 色の変更

`style.css` の `:root` セクションでカラーテーマを変更できます:

```css
:root {
    --color-bg: #c8c8c8;  /* 背景色 */
    --color-text: #000;   /* テキスト色 */
}
```

### ページ内容の変更

各ページのコンテンツは `index.html` 内で編集できます。

## トラブルシューティング

### 3Dアニメーションが表示されない

- ブラウザのWebGL対応を確認
- F12で開発者ツール→Consoleでエラーを確認

### 画像が表示されない

- ファイルパスが正しいか確認
- ファイル名が正確か確認 (大文字小文字も含む)

## ライセンス

このプロジェクトはレッツメディア株式会社の所有物です。

## お問い合わせ

質問や問題がある場合は、開発者にお問い合わせください。
