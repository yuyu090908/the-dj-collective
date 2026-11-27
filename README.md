# THE DJ COLLECTIVE

バンコク発・オンライン対応のDJスクール＋学習プラットフォーム。
**現在の実装範囲：PHASE 01 ACADEMY CORE ＋ PHASE 02 AI LEARNING**
- Phase 01：ブランドサイト／講師紹介／レッスン予約／オンラインレッスン／会員登録・決済／講師管理／運営管理／EN・JA・TH
- Phase 02：月額サブスクリプション（Stripe）／カリキュラム Level 1–3（本文・練習課題・クイズ）と学習履歴／AI Mix Lab（ブラウザ内解析）／AI DJ Coach（Claude API）／Set Builder／講師による分析レビュー／管理画面のAI利用状況

Phase 03〜04 のページ（コミュニティ、バトル、アーティスト、イベント等）は全ルートに実画面があり、「Phase XX」表示と中身の予定を示しています（ダミーデータで動いているように見せることはしていません）。

- Next.js 16 (App Router, Turbopack) / React 19 / Tailwind CSS v4 / TypeScript
- PostgreSQL（本番は Supabase）＋ RLS（防御の二重化）
- 決済：Stripe Checkout（カード＋PromptPay）。**予約確定は署名検証済みWebhookのみ**
- オンラインレッスン：Daily.co（ルーム自動発行）
- メール：Resend

## ローカル起動

```bash
npm install
cp .env.example .env.local        # DATABASE_URL と AUTH_SECRET を設定
# ローカルPostgresの場合のみ：Supabase の auth スキーマ代替を作成
psql "$DATABASE_URL" -f supabase/local/00_auth_stub.sql
npm run db:migrate
npm run db:seed
npm run db:create-user -- admin@example.com 'long-password-here' admin
npm run dev
```

管理画面 `/admin` は初回ログイン時に 2段階認証（TOTP）の登録が必須です（Google Authenticator 等でQRを読み取り）。

## 本番（Vercel + Supabase）セットアップ

1. **Supabase** プロジェクト作成 → SQL Editor で `supabase/migrations/` の `0001_init.sql`, `0002_phase02.sql`, `0003_coach.sql` を順に実行（`00_auth_stub.sql` は実行しない）。
   その後 `DATABASE_URL=<接続文字列> npm run db:seed`。
2. Supabase Auth を使う場合は `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定（未設定時は内蔵のメール＋パスワード認証）。
   管理者は登録後に SQL で `update public.users set role='admin' where email='...'`。
3. **Stripe**（タイ法人アカウント、PromptPay を有効化）
   - `STRIPE_SECRET_KEY` を設定
   - Webhook エンドポイント `https://<domain>/api/stripe/webhook` を作成し、イベント
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`,
     `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` を選択 → 署名シークレットを `STRIPE_WEBHOOK_SECRET` に
   - 月額プラン：Stripe で月額の Price を作成し、`update plans set stripe_price_id='price_...' where code='member'` のように各プランへ設定（未設定でも Checkout は価格を都度生成して動きますが、カスタマーポータルでのプラン変更には Price ID が必要）。カスタマーポータルを Stripe ダッシュボードで有効化。月額はカードのみ（PromptPay は自動更新に非対応）
4. **Daily.co**：`DAILY_API_KEY`。音楽用途のため、入室前の「機材チェック」ページ（`/device-check`）でエコーキャンセル等を無効にした音声確認ができます。
5. **Resend**：送信ドメイン認証後 `RESEND_API_KEY` と `EMAIL_FROM`。
6. **Cron**：`vercel.json` で `/api/cron/reminders` を毎日 01:00 UTC（バンコク 08:00）に実行（24時間以内のレッスンにリマインド）。`CRON_SECRET` を設定。Pro プランなら1時間毎に変更可。
7. **Claude API**：`ANTHROPIC_API_KEY` を設定すると AI DJ Coach が有効になります（未設定時は「NOT CONNECTED」表示で入力不可、架空の回答は出しません）。モデルは `claude-opus-5-5`、ストリーミング、プロンプトキャッシュ、**サーバー側の拒否時フォールバック（`fallbacks: "default"`）を有効化**。利用回数はプランの月間上限で制限し、トークン数と概算費用を `ai_usage` に記録（管理画面 → AI usage）。
8. 管理画面 → Settings でレッスン価格を確定（「Price confirmed」にチェックすると「仮価格」表示が消えます）、スタジオ住所、講師プロフィール、Content でヒーロー動画・SNSリンクを設定。

> ⚠️ `DEMO_PAYMENTS=1` はプレビュー環境専用です。Stripe 未設定時に「決済をシミュレート」ボタンを出し、明示的に DEMO と表示されます。Stripe キーを設定すると自動で無効になります。本番サイトでは設定しないでください。

## 環境変数

| 変数 | 必須 | 用途 |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres / Supabase |
| `AUTH_SECRET` | ✅ | セッション・MFA Cookie の署名 |
| `NEXT_PUBLIC_SITE_URL` | ✅ | canonical / hreflang / sitemap / Stripe 戻りURL |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 任意 | Supabase Auth |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | 決済に必須 | カード・PromptPay |
| `DAILY_API_KEY` | オンラインレッスンに必須 | ビデオ通話ルーム |
| `RESEND_API_KEY`, `EMAIL_FROM` | 推奨 | 予約確認・リマインド・キャンセルメール |
| `CRON_SECRET` | 推奨 | リマインド Cron の認証 |
| `ANTHROPIC_API_KEY` | AI Coach に必須 | AI DJ Coach（Claude API） |
| `DEMO_PAYMENTS` | プレビューのみ | 決済シミュレーション |

未接続のサービスは管理画面のダッシュボード／Settings に「NOT CONNECTED」と表示されます。

## 予約・決済の仕組み

- 5ステップ：レッスン選択 → 日時 → 確認 → 決済 → 完了
- 日時選択で **10分間の仮押さえ**（Stripe へ進むと35分）。期限切れは自動解放
- 二重予約は DB の排他制約（`exclude using gist (instructor_id with =, period with &&)`）で**サーバー側で物理的に不可能**
- 支払い確定は Stripe Webhook（署名検証・イベントID冪等）のみ。仮押さえ期限後に支払われ、枠が埋まっていた場合は自動キャンセル＋返金
- 24時間前まで無料キャンセル・日時変更。管理者は返金・キャンセル可能（監査ログに記録）
- 表示は利用者のタイムゾーン、補助としてバンコク時間を併記

## AI 機能の設計（Phase 02）

- **Mix Lab**：音源は端末から出ません。ブラウザでデコード（長さに応じて 8–22.05 kHz に間引き）し、ラウドネス（ITU-R BS.1770 / EBU R128 ゲーティング）・ピーク・クリップ・ステレオ相関・無音区間を**測定値**、テンポ・キー・つなぎ候補を**推定値（信頼度つき）**として保存。スコアは画面に式を表示したルールベースで、AI の判定ではありません。120分超の録音はサーバー側解析ワーカー（未実装・NOT CONNECTED）が必要。
- **AI DJ Coach**：システムプロンプトで「コンテキストにない数値を作らない」「推定値は推定と明示」「機材固有の操作は推測しない」「手元の技術は講師へ」を指示。学習データは利用者がチェックした場合のみ送信。
- **Set Builder**（Artist Pro 以上）：rekordbox XML / CSV / 手入力のライブラリから曲順を作成。BPM変化率・Camelot 相性・出番ごとのエネルギー目安を表示。曲情報の外部検索や推測はしません。

## テスト

```bash
npm run typecheck
npm run lint
CHROME_PATH=/path/to/chrome npm run test:e2e   # Playwright（ローカルDB必須、dev サーバーは自動起動）
npm run test:rls                                # RLS ポリシー検証
npm run test:webhook                            # Stripe Webhook 署名・確定・冪等性・サブスク同期
npm run test:analyzer                           # 音声解析（合成音源で BPM・クリップ・キー・LUFS を検証）
npm run test:coach                              # AI Coach（ローカルのモック API でリクエスト形式・保存・課金記録を検証）
npm run test:sets                               # Set Builder（キー変換・CSV 解析・BPM 変化）
```

E2E は `localhost` のDBにのみ接続し、`*@local.test` のテストユーザーを作成します。

## ディレクトリ

- `src/app/[locale]/(site)` 公開ページ ／ `app` 会員 ／ `instructor` 講師 ／ `admin` 運営
- `src/lib/booking` 空き枠計算・仮押さえ・決済・キャンセル
- `src/lib/i18n/dictionaries` EN / JA / TH 文言
- `src/lib/legal.ts` 利用規約等の**ドラフト**（公開前に専門家のレビューが必要）
- `supabase/migrations` スキーマ（46テーブル・RLS）
- `src/lib/audio` ブラウザ内解析・スコア ／ `src/lib/coach.ts` AI Coach ／ `src/lib/sets` Set Builder ロジック
- `scripts/curriculum` カリキュラム本文（EN/JA/TH、講師レビュー前のドラフト）
- `e2e/` Playwright、`tests/` RLS・Webhook・解析・Coach・Set Builder
