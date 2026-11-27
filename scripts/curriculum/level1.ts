import type { ModuleContent } from "./types";

// LEVEL 01 — FOUNDATION
export const level1: ModuleContent[] = [
  {
    minutes: 8,
    body: {
      en: "A DJ selects and plays recorded music for people, joining tracks together so the music never stops and the mood moves where the room needs it to go. The craft has two halves: technique (keeping tracks in time, controlling volume and EQ, transitioning cleanly) and selection (choosing the right record for the moment).\n\nDifferent settings ask for different DJs. A club warm-up DJ builds atmosphere without peaking too early; a peak-time DJ keeps energy high; a bar or lounge DJ supports conversation; a wedding or event DJ reads a very mixed crowd. Radio and online mixes are judged without a dance floor, so flow and sound quality matter even more.\n\nNone of this requires expensive gear to start. It requires listening — to your music, to your mix in the headphones, and to the people in front of you.",
      ja: "DJとは、録音された音楽を選んでかけ、曲と曲をつないで音楽を止めずに、フロアの空気を必要な方向へ動かす人です。技術（テンポを合わせる、音量やEQを操作する、きれいにつなぐ）と選曲（その瞬間に合う曲を選ぶ）の2つが柱になります。\n\n現場によって求められるDJ像は違います。クラブのウォームアップは早く盛り上げすぎずに雰囲気を作り、ピークタイムはエネルギーを保ち、バーやラウンジは会話を邪魔しない音を作り、ウェディングやイベントでは幅広い客層を読む必要があります。ラジオやオンラインMIXはフロアがない分、流れと音質がより重視されます。\n\n始めるのに高価な機材は必要ありません。必要なのは「聴くこと」です。自分の曲、ヘッドホンの中のミックス、そして目の前の人たちを。",
      th: "ดีเจคือคนที่เลือกและเปิดเพลงที่บันทึกไว้ให้ผู้คนฟัง โดยเชื่อมเพลงต่อกันไม่ให้ดนตรีหยุด และพาบรรยากาศไปในทิศทางที่ห้องต้องการ งานนี้มีสองส่วน คือ เทคนิค (ทำให้จังหวะตรงกัน คุมความดังและอีคิว เปลี่ยนเพลงอย่างเนียน) และการเลือกเพลง (เลือกเพลงที่ใช่ในจังหวะนั้น)\n\nแต่ละสถานที่ต้องการดีเจต่างกัน ดีเจวอร์มอัปในคลับสร้างบรรยากาศโดยไม่พีคเร็วเกินไป ดีเจช่วงพีครักษาพลังให้สูง ดีเจบาร์หรือเลานจ์ช่วยให้คนคุยกันได้ ส่วนงานแต่งงานหรืออีเวนต์ต้องอ่านผู้ชมที่หลากหลาย มิกซ์ทางวิทยุหรือออนไลน์ไม่มีฟลอร์ จึงให้ความสำคัญกับความต่อเนื่องและคุณภาพเสียงมากขึ้น\n\nการเริ่มต้นไม่ต้องใช้อุปกรณ์ราคาแพง แต่ต้อง \"ฟัง\" ทั้งเพลงของคุณ มิกซ์ในหูฟัง และผู้คนตรงหน้า",
    },
    points: {
      en: ["DJing = technique + selection", "Different gigs (warm-up, peak, bar, event, online) need different approaches", "Listening is the core skill", "You can start learning on a simple controller"],
      ja: ["DJ = 技術 + 選曲", "現場（ウォームアップ、ピーク、バー、イベント、オンライン）ごとに求められることが違う", "最も大切なスキルは「聴くこと」", "シンプルなコントローラーから学び始められる"],
      th: ["ดีเจ = เทคนิค + การเลือกเพลง", "งานแต่ละแบบ (วอร์มอัป พีค บาร์ อีเวนต์ ออนไลน์) ต้องใช้วิธีต่างกัน", "ทักษะหลักคือการฟัง", "เริ่มเรียนได้ด้วยคอนโทรลเลอร์ง่าย ๆ"],
    },
    practice: {
      en: "Listen to one recorded DJ set (30 minutes) in a genre you like. Write down the time of every transition you notice and one sentence on how the energy changed across the 30 minutes.",
      ja: "好きなジャンルのDJセットを30分聴きます。気づいたトランジションの時刻をすべてメモし、30分の間にエネルギーがどう変化したかを1文で書きましょう。",
      th: "ฟังดีเจเซ็ตแนวที่ชอบ 30 นาที จดเวลาทุกจุดที่สังเกตว่ามีการเปลี่ยนเพลง และเขียนหนึ่งประโยคว่าพลังงานเปลี่ยนไปอย่างไรตลอด 30 นาที",
    },
    quiz: [
      { q: { en: "What are the two core halves of DJing?", ja: "DJの2つの柱は？", th: "สองส่วนหลักของการเป็นดีเจคืออะไร" },
        o: { en: ["Technique and selection", "Producing and singing", "Lighting and sound design"], ja: ["技術と選曲", "作曲と歌", "照明と音響デザイン"], th: ["เทคนิคและการเลือกเพลง", "การโปรดิวซ์และการร้อง", "แสงและการออกแบบเสียง"] }, a: 0 },
      { q: { en: "What is the main job of a warm-up DJ?", ja: "ウォームアップDJの主な役割は？", th: "หน้าที่หลักของดีเจวอร์มอัปคืออะไร" },
        o: { en: ["Play the biggest hits immediately", "Build atmosphere without peaking too early", "Play as fast as possible"], ja: ["すぐに一番の人気曲をかける", "早く盛り上げすぎずに雰囲気を作る", "できるだけ速い曲をかける"], th: ["เปิดเพลงฮิตที่สุดทันที", "สร้างบรรยากาศโดยไม่พีคเร็วเกินไป", "เปิดเพลงให้เร็วที่สุด"] }, a: 1 },
      { q: { en: "Which skill matters most when starting out?", ja: "始めたばかりの時に最も大切なスキルは？", th: "ทักษะใดสำคัญที่สุดเมื่อเริ่มต้น" },
        o: { en: ["Owning club gear", "Listening", "Having many followers"], ja: ["クラブ機材を持っていること", "聴くこと", "フォロワーが多いこと"], th: ["มีอุปกรณ์ระดับคลับ", "การฟัง", "มีผู้ติดตามเยอะ"] }, a: 1 },
    ],
  },
  {
    minutes: 10,
    body: {
      en: "Every DJ setup has the same building blocks. Two or more decks (players or jog wheels on a controller) play tracks. A mixer combines them: each channel has a gain (trim) knob, a 3-band EQ (high, mid, low), and a channel fader; a crossfader blends between sides. A cue/headphone section lets you hear a channel privately before the crowd does.\n\nOn a controller, the decks and mixer are one unit and the software (rekordbox, Serato, Traktor, djay) does the audio. In a club you'll usually meet standalone players (CDJ/XDJ) connected to a separate mixer, playing tracks from USB.\n\nSignal flow: deck → channel gain → EQ → channel fader → crossfader → master → speakers. Booth monitors let you hear the room sound; headphones let you prepare the next track. Learn where each control sits on your own gear before anything else.",
      ja: "DJ機材の構成要素はどれも同じです。2台以上のデッキ（プレーヤー、またはコントローラーのジョグ）で曲を再生し、ミキサーで混ぜます。各チャンネルにはゲイン（トリム）、3バンドEQ（ハイ・ミッド・ロー）、チャンネルフェーダーがあり、クロスフェーダーで左右をブレンドします。キュー/ヘッドホン部では、お客さんに聞こえる前にそのチャンネルを自分だけで聴けます。\n\nコントローラーではデッキとミキサーが一体で、音の処理はソフト（rekordbox、Serato、Traktor、djayなど）が行います。クラブでは単体のプレーヤー（CDJ/XDJ）と別体ミキサーを組み合わせ、USBから再生するのが一般的です。\n\n信号の流れ：デッキ → ゲイン → EQ → チャンネルフェーダー → クロスフェーダー → マスター → スピーカー。ブースモニターで会場の音を、ヘッドホンで次の曲を確認します。まずは自分の機材のどこに何があるかを覚えましょう。",
      th: "อุปกรณ์ดีเจทุกชุดมีองค์ประกอบเหมือนกัน เด็คสองตัวขึ้นไป (เครื่องเล่นหรือจ็อกวีลบนคอนโทรลเลอร์) เล่นเพลง มิกเซอร์รวมเสียงเข้าด้วยกัน แต่ละแชนเนลมีปุ่มเกน (ทริม) อีคิว 3 ย่าน (สูง กลาง ต่ำ) และเฟดเดอร์แชนเนล ส่วนครอสเฟดเดอร์ใช้ผสมระหว่างสองฝั่ง ส่วนคิว/หูฟังให้คุณฟังแชนเนลนั้นคนเดียวก่อนผู้ชมจะได้ยิน\n\nบนคอนโทรลเลอร์ เด็คและมิกเซอร์อยู่ในเครื่องเดียว และซอฟต์แวร์ (rekordbox, Serato, Traktor, djay) เป็นตัวประมวลผลเสียง ในคลับมักใช้เครื่องเล่นแยก (CDJ/XDJ) ต่อกับมิกเซอร์แยก และเล่นเพลงจาก USB\n\nเส้นทางสัญญาณ: เด็ค → เกน → อีคิว → เฟดเดอร์แชนเนล → ครอสเฟดเดอร์ → มาสเตอร์ → ลำโพง บูธมอนิเตอร์ให้ได้ยินเสียงในห้อง หูฟังใช้เตรียมเพลงถัดไป เริ่มจากจำตำแหน่งปุ่มบนอุปกรณ์ของคุณเองให้ได้ก่อน",
    },
    points: {
      en: ["Decks play, the mixer combines", "Each channel: gain → EQ → fader", "Controllers use software; clubs use CDJ/XDJ + mixer", "Headphones = preparing, booth monitor = hearing the room"],
      ja: ["デッキで再生し、ミキサーで混ぜる", "各チャンネル：ゲイン → EQ → フェーダー", "コントローラーはソフト、クラブはCDJ/XDJ＋ミキサー", "ヘッドホン＝準備、ブースモニター＝会場の音の確認"],
      th: ["เด็คเล่นเพลง มิกเซอร์รวมเสียง", "แต่ละแชนเนล: เกน → อีคิว → เฟดเดอร์", "คอนโทรลเลอร์ใช้ซอฟต์แวร์ คลับใช้ CDJ/XDJ + มิกเซอร์", "หูฟัง = เตรียมเพลง บูธมอนิเตอร์ = ฟังเสียงในห้อง"],
    },
    practice: {
      en: "Without music playing, point to and name every control on your setup: gain, high/mid/low EQ, channel fader, crossfader, cue button, headphone level, master level. Then load one track and follow its signal from deck to master by moving each control.",
      ja: "音を出さずに、自分の機材のすべての操作部を指さして名前を言いましょう：ゲイン、ハイ/ミッド/ローEQ、チャンネルフェーダー、クロスフェーダー、キューボタン、ヘッドホン音量、マスター音量。次に1曲読み込み、各つまみを動かしながらデッキからマスターまで信号をたどります。",
      th: "โดยไม่เปิดเพลง ชี้และเรียกชื่อปุ่มทุกปุ่มบนอุปกรณ์: เกน อีคิวสูง/กลาง/ต่ำ เฟดเดอร์แชนเนล ครอสเฟดเดอร์ ปุ่มคิว ระดับหูฟัง ระดับมาสเตอร์ จากนั้นโหลดเพลงหนึ่งเพลงแล้วไล่สัญญาณจากเด็คถึงมาสเตอร์โดยขยับแต่ละปุ่ม",
    },
    quiz: [
      { q: { en: "Which control sets a channel's input level before the EQ?", ja: "EQの前でチャンネルの入力レベルを決めるのは？", th: "ปุ่มใดตั้งระดับสัญญาณเข้าของแชนเนลก่อนอีคิว" },
        o: { en: ["Crossfader", "Gain / trim", "Master"], ja: ["クロスフェーダー", "ゲイン/トリム", "マスター"], th: ["ครอสเฟดเดอร์", "เกน / ทริม", "มาสเตอร์"] }, a: 1 },
      { q: { en: "What is the cue/headphone section for?", ja: "キュー/ヘッドホン部の役割は？", th: "ส่วนคิว/หูฟังมีไว้ทำอะไร" },
        o: { en: ["Hearing a channel privately before the crowd", "Making the master louder", "Recording the mix"], ja: ["お客さんより先にチャンネルを自分だけで聴く", "マスターを大きくする", "ミックスを録音する"], th: ["ฟังแชนเนลคนเดียวก่อนผู้ชม", "ทำให้มาสเตอร์ดังขึ้น", "อัดเสียงมิกซ์"] }, a: 0 },
      { q: { en: "What do most clubs use?", ja: "多くのクラブで使われているのは？", th: "คลับส่วนใหญ่ใช้อะไร" },
        o: { en: ["Only a laptop", "Standalone players (CDJ/XDJ) with a separate mixer", "Vinyl only"], ja: ["ノートPCのみ", "単体プレーヤー（CDJ/XDJ）と別体ミキサー", "レコードのみ"], th: ["แล็ปท็อปอย่างเดียว", "เครื่องเล่นแยก (CDJ/XDJ) กับมิกเซอร์แยก", "แผ่นเสียงอย่างเดียว"] }, a: 1 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "BPM (beats per minute) is a track's tempo. House usually sits around 120–128, tech house 124–130, techno 128–140+, hip hop 85–100, drum & bass around 170. To mix two tracks smoothly their BPMs must match, which you do with the pitch/tempo fader.\n\nA tempo fader set to ±8% can move a 124 BPM track from about 114 to 134. Small changes (2–3%) are rarely noticeable; big changes can make vocals and instruments sound unnatural. Master Tempo / key lock keeps the pitch the same while changing speed, at a small cost in sound quality on large changes.\n\nSoftware shows BPM automatically, but analysis can be wrong — most commonly half or double (e.g. 87 instead of 174). Learn to tap or count the beat yourself so you can tell when the number is wrong.",
      ja: "BPM（1分間の拍数）は曲のテンポです。ハウスは120〜128前後、テックハウスは124〜130、テクノは128〜140以上、ヒップホップは85〜100、ドラムンベースは170前後が一般的です。2曲をスムーズにつなぐにはBPMを合わせる必要があり、ピッチ/テンポフェーダーで調整します。\n\nテンポフェーダーが±8%なら、124 BPMの曲を約114〜134まで変えられます。2〜3%程度の変化はほとんど気づかれませんが、大きく変えるとボーカルや楽器が不自然に聞こえます。マスターテンポ（キーロック）を使うと速度を変えても音程は保たれますが、大きく変えると音質がやや落ちます。\n\nソフトはBPMを自動表示しますが、解析が間違うこともあります。よくあるのは半分や倍の値（174のはずが87など）です。自分で拍を数えたりタップしたりして、数字が間違っている時に気づけるようになりましょう。",
      th: "BPM (จำนวนบีตต่อนาที) คือความเร็วของเพลง เฮาส์มักอยู่ราว 120–128 เทคเฮาส์ 124–130 เทคโน 128–140+ ฮิปฮอป 85–100 ดรัมแอนด์เบสราว 170 การมิกซ์สองเพลงให้เนียน BPM ต้องตรงกัน ซึ่งปรับด้วยเฟดเดอร์พิตช์/เทมโป\n\nเฟดเดอร์เทมโปที่ตั้ง ±8% เปลี่ยนเพลง 124 BPM ได้ราว 114 ถึง 134 การเปลี่ยนเล็กน้อย (2–3%) แทบไม่มีใครสังเกต แต่การเปลี่ยนมากทำให้เสียงร้องและเครื่องดนตรีฟังไม่เป็นธรรมชาติ Master Tempo / คีย์ล็อกช่วยให้คีย์เดิมขณะเปลี่ยนความเร็ว แต่คุณภาพเสียงลดลงเล็กน้อยเมื่อเปลี่ยนมาก\n\nซอฟต์แวร์แสดง BPM อัตโนมัติ แต่การวิเคราะห์อาจผิด ที่พบบ่อยคือครึ่งหรือสองเท่า (เช่น 87 แทน 174) ฝึกนับหรือแตะจังหวะเองเพื่อรู้ว่าตัวเลขผิดเมื่อไร",
    },
    points: {
      en: ["BPM = tempo; genres have typical ranges", "Match BPMs with the tempo fader", "Key lock keeps pitch while changing speed", "Software BPM can be half/double — trust your ears"],
      ja: ["BPM＝テンポ。ジャンルごとに目安がある", "テンポフェーダーでBPMを合わせる", "キーロックで速度を変えても音程を保てる", "ソフトのBPMは半分/倍の誤りがある。耳で確認"],
      th: ["BPM = ความเร็ว แต่ละแนวมีช่วงปกติ", "ปรับ BPM ให้ตรงด้วยเฟดเดอร์เทมโป", "คีย์ล็อกคงคีย์ไว้ขณะเปลี่ยนความเร็ว", "BPM ในซอฟต์แวร์อาจเป็นครึ่ง/สองเท่า ใช้หูตรวจสอบ"],
    },
    practice: {
      en: "Pick five tracks. For each, count beats for 15 seconds and multiply by 4, then compare with the software's BPM. Note any track where the software was half or double.",
      ja: "5曲選び、それぞれ15秒間の拍数を数えて4倍し、ソフトのBPMと比べます。半分や倍になっていた曲をメモしましょう。",
      th: "เลือก 5 เพลง นับบีต 15 วินาทีแล้วคูณ 4 เทียบกับ BPM ในซอฟต์แวร์ จดเพลงที่ซอฟต์แวร์แสดงเป็นครึ่งหรือสองเท่า",
    },
    quiz: [
      { q: { en: "You count 31 beats in 15 seconds. What is the BPM?", ja: "15秒で31拍数えました。BPMは？", th: "นับได้ 31 บีตใน 15 วินาที BPM เท่าไร" },
        o: { en: ["62", "124", "155"], ja: ["62", "124", "155"], th: ["62", "124", "155"] }, a: 1 },
      { q: { en: "What does Master Tempo / key lock do?", ja: "マスターテンポ（キーロック）の働きは？", th: "Master Tempo / คีย์ล็อกทำอะไร" },
        o: { en: ["Keeps the pitch while the speed changes", "Locks the BPM so it can't change", "Matches the key automatically"], ja: ["速度を変えても音程を保つ", "BPMを変えられないよう固定する", "キーを自動で合わせる"], th: ["คงคีย์ไว้ขณะเปลี่ยนความเร็ว", "ล็อก BPM ไม่ให้เปลี่ยน", "ปรับคีย์ให้ตรงอัตโนมัติ"] }, a: 0 },
      { q: { en: "Software shows 87 BPM for a drum & bass track. Most likely it is…", ja: "ドラムンベースの曲が87 BPMと表示されました。おそらく…", th: "ซอฟต์แวร์แสดง 87 BPM สำหรับเพลงดรัมแอนด์เบส น่าจะเป็น…" },
        o: { en: ["Correct", "Actually about 174 (half-time detection)", "Actually about 43"], ja: ["正しい", "実際は約174（半分で検出）", "実際は約43"], th: ["ถูกต้อง", "จริง ๆ ประมาณ 174 (ตรวจจับได้ครึ่งเดียว)", "จริง ๆ ประมาณ 43"] }, a: 1 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "The Cue button marks a starting point. On CDJ-style players, pressing Cue while paused sets the cue point; holding Cue plays from it and releasing returns to it. Press Play while holding Cue to keep the track running. On many controllers the behaviour is similar but can be changed in the software settings.\n\nThe usual place for a cue point is the first beat of a phrase — often the very first kick of the track, or the first beat of the bar where the beat starts after an intro. Use hot cues (numbered pads) to store several points, for example the first kick, the start of the breakdown and the drop.\n\nPractice starting a track exactly on the beat of another one: 'cue-play' on the downbeat. A late or early start of even a tenth of a second is audible.",
      ja: "Cueボタンは再生開始位置を記録します。CDJ型のプレーヤーでは、一時停止中にCueを押すとキューポイントが設定され、Cueを押し続けるとそこから再生、離すと戻ります。Cueを押したままPlayを押すと再生が続きます。多くのコントローラーも同様ですが、ソフトの設定で動作を変えられる場合があります。\n\nキューポイントは通常、フレーズの1拍目に置きます。多くの場合、曲の最初のキック、またはイントロの後にビートが始まる小節の頭です。ホットキュー（番号付きパッド）を使えば、最初のキック、ブレイクダウンの始まり、ドロップなど複数の位置を保存できます。\n\nもう1曲の拍に合わせて、ちょうど頭拍でキュー再生する練習をしましょう。0.1秒の遅れや早さでも耳に分かります。",
      th: "ปุ่ม Cue ใช้กำหนดจุดเริ่ม บนเครื่องเล่นแบบ CDJ กด Cue ขณะหยุดจะตั้งจุดคิว กดค้างจะเล่นจากจุดนั้นและปล่อยจะกลับมาที่เดิม กด Play ขณะกด Cue ค้างเพื่อให้เพลงเล่นต่อ คอนโทรลเลอร์ส่วนใหญ่คล้ายกัน แต่อาจตั้งค่าต่างได้ในซอฟต์แวร์\n\nจุดคิวที่นิยมคือบีตแรกของเฟรส มักเป็นคิกแรกของเพลง หรือบีตแรกของห้องที่จังหวะเริ่มหลังอินโทร ใช้ฮอตคิว (แพดตัวเลข) เก็บหลายจุด เช่น คิกแรก จุดเริ่มเบรกดาวน์ และดร็อป\n\nฝึกปล่อยเพลงให้ตรงบีตของอีกเพลงพอดี (คิว-เพลย์บนดาวน์บีต) ช้าหรือเร็วเพียงหนึ่งในสิบวินาทีก็ได้ยิน",
    },
    points: {
      en: ["Cue sets and returns to a start point", "Place cues on the first beat of a phrase", "Hot cues store several important points", "Start on the downbeat — timing is audible"],
      ja: ["Cueで開始位置を設定し、そこに戻る", "キューはフレーズの1拍目に置く", "ホットキューで重要な位置を複数保存", "頭拍で出す。タイミングのずれは聞こえる"],
      th: ["Cue ตั้งและกลับไปยังจุดเริ่ม", "วางคิวที่บีตแรกของเฟรส", "ฮอตคิวเก็บจุดสำคัญได้หลายจุด", "ปล่อยบนดาวน์บีต จังหวะคลาดเคลื่อนได้ยินได้"],
    },
    practice: {
      en: "Set a cue on the first kick of track B. With track A playing, start B on A's downbeat 20 times in a row (volume down). Count how many starts were exactly on time.",
      ja: "曲Bの最初のキックにキューを置きます。曲Aを流しながら、Aの頭拍に合わせてBを20回連続でスタートさせましょう（Bの音量は下げたまま）。ぴったり合った回数を数えます。",
      th: "ตั้งคิวที่คิกแรกของเพลง B ขณะเพลง A เล่นอยู่ ปล่อย B ให้ตรงดาวน์บีตของ A 20 ครั้งติดกัน (ลดเสียง B ไว้) นับว่าตรงจังหวะกี่ครั้ง",
    },
    quiz: [
      { q: { en: "Where is the usual place for a cue point?", ja: "キューポイントを置く一般的な場所は？", th: "ตำแหน่งปกติของจุดคิวคือที่ใด" },
        o: { en: ["Anywhere in the middle of a bar", "The first beat of a phrase", "The last second of the track"], ja: ["小節の途中のどこか", "フレーズの1拍目", "曲の最後の1秒"], th: ["ตรงไหนก็ได้กลางห้อง", "บีตแรกของเฟรส", "วินาทีสุดท้ายของเพลง"] }, a: 1 },
      { q: { en: "What are hot cues for?", ja: "ホットキューの用途は？", th: "ฮอตคิวมีไว้ทำอะไร" },
        o: { en: ["Storing several points to jump to", "Changing the key", "Raising the volume"], ja: ["ジャンプ先の位置を複数保存する", "キーを変える", "音量を上げる"], th: ["เก็บหลายจุดเพื่อกระโดดไป", "เปลี่ยนคีย์", "เพิ่มความดัง"] }, a: 0 },
      { q: { en: "On a CDJ, how do you keep a track playing after holding Cue?", ja: "CDJでCueを押したまま再生を続けるには？", th: "บน CDJ จะให้เพลงเล่นต่อหลังกด Cue ค้างได้อย่างไร" },
        o: { en: ["Release Cue quickly", "Press Play while still holding Cue", "Move the crossfader"], ja: ["すばやくCueを離す", "Cueを押したままPlayを押す", "クロスフェーダーを動かす"], th: ["ปล่อย Cue เร็ว ๆ", "กด Play ขณะยังกด Cue ค้าง", "ขยับครอสเฟดเดอร์"] }, a: 1 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "Headphones let you hear the next track before the room does. Press the cue/PFL button on the channel you want to preview; the cue mix (or cue/master) knob blends between the previewed channel and the master in your headphones.\n\nMany DJs use one ear on the headphones and the other ear on the booth monitor. Your brain compares the two. Keep the headphone volume as low as you can while still hearing clearly — loud monitoring is the most common cause of hearing damage in DJs. Use earplugs designed for musicians in loud rooms.\n\nAsk for the booth monitor to point at you and to be loud enough, but not louder than needed. Sound from the main speakers arrives late in big rooms, so beatmatch using the booth and headphones, never the main PA.",
      ja: "ヘッドホンを使えば、会場に流す前に次の曲を聴けます。プレビューしたいチャンネルのCue（PFL）ボタンを押し、キューミックス（Cue/Master）つまみでヘッドホン内のプレビュー音とマスター音のバランスを調整します。\n\n多くのDJは片耳をヘッドホン、もう片耳をブースモニターにあて、頭の中で2つを比べます。はっきり聞こえる範囲でヘッドホンの音量はできるだけ下げましょう。大音量でのモニタリングはDJの聴覚障害の最大の原因です。大きな会場では音楽用イヤープラグを使いましょう。\n\nブースモニターは自分の方へ向け、必要十分な音量にしてもらいましょう。大きな会場ではメインスピーカーの音が遅れて届くため、ビートマッチはブースとヘッドホンで行い、メインPAの音では合わせないこと。",
      th: "หูฟังช่วยให้ได้ยินเพลงถัดไปก่อนคนในห้อง กดปุ่มคิว/PFL ที่แชนเนลที่ต้องการฟังก่อน แล้วใช้ปุ่มคิวมิกซ์ (คิว/มาสเตอร์) ปรับสัดส่วนระหว่างแชนเนลที่ฟังกับมาสเตอร์ในหูฟัง\n\nดีเจหลายคนใช้หูข้างหนึ่งฟังหูฟัง อีกข้างฟังบูธมอนิเตอร์ แล้วสมองเปรียบเทียบสองเสียง ตั้งเสียงหูฟังให้เบาที่สุดเท่าที่ยังได้ยินชัด การมอนิเตอร์ดังเกินไปเป็นสาเหตุอันดับหนึ่งของการสูญเสียการได้ยินในดีเจ ใช้เอียร์ปลั๊กสำหรับนักดนตรีในที่เสียงดัง\n\nขอให้หันบูธมอนิเตอร์มาทางคุณและดังพอดี ในห้องใหญ่เสียงจากลำโพงหลักมาถึงช้า จึงควรแมตช์บีตด้วยบูธและหูฟัง ไม่ใช่ลำโพงหลัก",
    },
    points: {
      en: ["Cue/PFL selects what you hear in headphones", "Cue mix blends preview and master", "Keep headphone volume low; protect your hearing", "Beatmatch with booth + headphones, not the main PA"],
      ja: ["Cue（PFL）でヘッドホンに流すチャンネルを選ぶ", "キューミックスでプレビューとマスターをブレンド", "ヘッドホン音量は低く。聴覚を守る", "ビートマッチはブースとヘッドホンで。メインPAでは合わせない"],
      th: ["คิว/PFL เลือกเสียงที่ได้ยินในหูฟัง", "คิวมิกซ์ผสมเสียงพรีวิวกับมาสเตอร์", "ตั้งเสียงหูฟังให้เบา ปกป้องการได้ยิน", "แมตช์บีตด้วยบูธ + หูฟัง ไม่ใช่ลำโพงหลัก"],
    },
    practice: {
      en: "Play track A out loud. Cue track B only in your headphones and practise switching your attention: 30 s headphones only, 30 s split (one ear each), 30 s cue-mix in the middle. Note which method makes timing differences easiest to hear.",
      ja: "曲Aをスピーカーで流し、曲Bをヘッドホンだけで聴きます。30秒ヘッドホンのみ、30秒片耳ずつ、30秒キューミックスを中間に、と切り替えて練習し、どの方法が一番タイミングのずれを聞き取りやすいかメモしましょう。",
      th: "เปิดเพลง A ออกลำโพง ฟังเพลง B ในหูฟังเท่านั้น ฝึกสลับ: 30 วิ หูฟังอย่างเดียว 30 วิ แยกหูละข้าง 30 วิ คิวมิกซ์กลาง ๆ จดว่าวิธีไหนได้ยินจังหวะที่คลาดง่ายที่สุด",
    },
    quiz: [
      { q: { en: "Why not beatmatch using the main PA in a big room?", ja: "大きな会場でメインPAの音でビートマッチしない理由は？", th: "ทำไมไม่ควรแมตช์บีตจากลำโพงหลักในห้องใหญ่" },
        o: { en: ["It's too quiet", "Its sound arrives late", "It has no bass"], ja: ["音が小さすぎる", "音が遅れて届く", "低音が出ない"], th: ["เสียงเบาเกินไป", "เสียงมาถึงช้า", "ไม่มีเสียงเบส"] }, a: 1 },
      { q: { en: "What does the cue mix knob do?", ja: "キューミックスつまみの役割は？", th: "ปุ่มคิวมิกซ์ทำอะไร" },
        o: { en: ["Blends preview and master in the headphones", "Changes the master EQ", "Sets the BPM"], ja: ["ヘッドホン内のプレビューとマスターをブレンドする", "マスターEQを変える", "BPMを設定する"], th: ["ผสมเสียงพรีวิวกับมาสเตอร์ในหูฟัง", "เปลี่ยนอีคิวมาสเตอร์", "ตั้ง BPM"] }, a: 0 },
      { q: { en: "Best practice for headphone volume?", ja: "ヘッドホン音量のベストプラクティスは？", th: "แนวปฏิบัติที่ดีสำหรับระดับเสียงหูฟังคือ" },
        o: { en: ["As loud as possible", "As low as possible while still clear", "Always at maximum in clubs"], ja: ["できるだけ大きく", "はっきり聞こえる範囲でできるだけ小さく", "クラブでは常に最大"], th: ["ดังที่สุด", "เบาที่สุดที่ยังได้ยินชัด", "ในคลับเปิดสุดเสมอ"] }, a: 1 },
    ],
  },
  {
    minutes: 12,
    body: {
      en: "Beatmatching means making two tracks play at the same tempo with their beats lined up. Step 1: match the BPM with the tempo fader. Step 2: start the new track on the downbeat. Step 3: listen for drift — if the kicks start to 'gallop' (two kicks close together), one track is ahead.\n\nTo correct phase, nudge the jog wheel: touch the outer edge to speed up or slow down briefly. To correct tempo, move the tempo fader in very small steps. If the tracks keep drifting the same way, the tempo is wrong; if they were aligned and slipped once, the phase is wrong.\n\nSync buttons do this automatically and are used by many professionals. Learn manual beatmatching anyway: beatgrids can be wrong, some tracks have live drummers, and gear can fail. Knowing how to hear drift is what makes your transitions safe.",
      ja: "ビートマッチとは、2曲を同じテンポで再生し、拍の位置をそろえることです。手順1：テンポフェーダーでBPMを合わせる。手順2：新しい曲を頭拍で出す。手順3：ずれを聴く。キックが「ドドッ」と2つ重なって聞こえたら、どちらかが先行しています。\n\n位相（拍の位置）は、ジョグの外周に触れて一時的に速めたり遅めたりして直します。テンポはテンポフェーダーをごく小さく動かして直します。同じ方向にずれ続けるならテンポが違い、一度合ってから一度だけずれたなら位相のずれです。\n\nSyncボタンはこれを自動で行い、多くのプロも使っています。それでも手動のビートマッチは身につけましょう。ビートグリッドが間違っていることもあり、生ドラムの曲もあり、機材トラブルもあります。ずれを聞き分けられることが、安全なつなぎの土台です。",
      th: "การแมตช์บีตคือการทำให้สองเพลงเล่นด้วยความเร็วเท่ากันและบีตตรงกัน ขั้นที่ 1: ปรับ BPM ให้ตรงด้วยเฟดเดอร์เทมโป ขั้นที่ 2: ปล่อยเพลงใหม่บนดาวน์บีต ขั้นที่ 3: ฟังการเลื่อน ถ้าคิกเริ่ม \"ควบม้า\" (คิกสองตัวติดกัน) แปลว่ามีเพลงหนึ่งนำอยู่\n\nแก้เฟสด้วยการดันจ็อกวีล แตะขอบนอกเพื่อเร่งหรือชะลอชั่วคราว แก้เทมโปด้วยการขยับเฟดเดอร์ทีละนิด ถ้าเลื่อนไปทางเดิมเรื่อย ๆ แปลว่าเทมโปผิด ถ้าตรงแล้วเลื่อนครั้งเดียวแปลว่าเฟสผิด\n\nปุ่ม Sync ทำสิ่งนี้อัตโนมัติและมืออาชีพหลายคนก็ใช้ แต่ควรฝึกแมตช์บีตด้วยมือไว้ เพราะบีตกริดอาจผิด บางเพลงใช้มือกลองจริง และอุปกรณ์อาจขัดข้อง การฟังออกว่าบีตเลื่อนคือสิ่งที่ทำให้ทรานซิชันปลอดภัย",
    },
    points: {
      en: ["Match tempo first, then phase", "'Galloping' kicks = drift", "Jog nudges fix phase; tempo fader fixes tempo", "Use Sync if you like, but learn to hear drift"],
      ja: ["まずテンポ、次に位相を合わせる", "キックが重なって聞こえる＝ずれている", "ジョグで位相、テンポフェーダーでテンポを直す", "Syncを使ってもよいが、ずれを聞き分ける力は身につける"],
      th: ["ปรับเทมโปก่อน แล้วค่อยเฟส", "คิก \"ควบม้า\" = บีตเลื่อน", "ดันจ็อกแก้เฟส เฟดเดอร์เทมโปแก้เทมโป", "ใช้ Sync ได้ แต่ต้องฟังการเลื่อนให้ออก"],
    },
    practice: {
      en: "With Sync off, take two tracks within 3 BPM of each other. Match them by ear and keep them aligned for 64 bars (about 2 minutes) using only small nudges. Record yourself and listen back for any gallop. Repeat daily for a week.",
      ja: "Syncをオフにして、BPM差が3以内の2曲を用意します。耳だけで合わせ、小さなジョグ操作だけで64小節（約2分）そろえ続けましょう。録音して、キックが重なる瞬間がないか聴き返します。1週間毎日くり返しましょう。",
      th: "ปิด Sync เลือกสองเพลงที่ BPM ห่างกันไม่เกิน 3 แมตช์ด้วยหูและประคองให้ตรง 64 ห้อง (ราว 2 นาที) โดยดันจ็อกเล็กน้อยเท่านั้น อัดเสียงแล้วฟังว่ามีคิกควบม้าไหม ทำทุกวันเป็นเวลาหนึ่งสัปดาห์",
    },
    quiz: [
      { q: { en: "The kicks were aligned, then keep drifting apart in the same direction. What's wrong?", ja: "キックが合っていたのに、同じ方向にずれ続けます。原因は？", th: "คิกตรงกันแล้ว แต่เลื่อนออกไปทางเดิมเรื่อย ๆ ผิดที่อะไร" },
        o: { en: ["Phase", "Tempo (BPM)", "EQ"], ja: ["位相", "テンポ（BPM）", "EQ"], th: ["เฟส", "เทมโป (BPM)", "อีคิว"] }, a: 1 },
      { q: { en: "How do you fix a one-off phase slip?", ja: "一度だけの位相のずれはどう直す？", th: "แก้เฟสที่เลื่อนครั้งเดียวอย่างไร" },
        o: { en: ["Nudge the jog wheel", "Change the key", "Pull down the master"], ja: ["ジョグで調整する", "キーを変える", "マスターを下げる"], th: ["ดันจ็อกวีล", "เปลี่ยนคีย์", "ลดมาสเตอร์"] }, a: 0 },
      { q: { en: "Why learn manual beatmatching if Sync exists?", ja: "Syncがあるのに手動ビートマッチを学ぶ理由は？", th: "ทำไมต้องฝึกแมตช์บีตเองทั้งที่มี Sync" },
        o: { en: ["Sync is banned in clubs", "Beatgrids can be wrong and gear can fail", "It makes tracks louder"], ja: ["クラブではSyncが禁止だから", "ビートグリッドの誤りや機材トラブルがあるから", "曲の音が大きくなるから"], th: ["คลับห้ามใช้ Sync", "บีตกริดอาจผิดและอุปกรณ์อาจขัดข้อง", "ทำให้เพลงดังขึ้น"] }, a: 1 },
    ],
  },
];
