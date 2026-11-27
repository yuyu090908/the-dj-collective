import type { ModuleContent } from "./types";

// LEVEL 02 — MIXING
export const level2: ModuleContent[] = [
  {
    minutes: 10,
    body: {
      en: "Most dance music is built in phrases of 8, 16 or 32 bars (one bar = 4 beats). Something changes at the start of each phrase: a new element enters, the bass drops out, a breakdown begins. Phrase mixing means starting the new track so that its phrase boundaries line up with the current track's.\n\nCount bars while you listen: 1-2-3-4 is one bar; after 8 bars something usually happens. Start the incoming track on the first beat of a phrase in the outgoing track — commonly 32 bars before the outgoing track's outro or breakdown — so both tracks change at the same moment. Waveform colours and beat-counters in software help, but counting by ear is the reliable skill.",
      ja: "ほとんどのダンスミュージックは8・16・32小節（1小節＝4拍）のフレーズでできています。フレーズの頭では何かが変わります。新しい音が入る、ベースが抜ける、ブレイクダウンが始まる、など。フレーズミックスとは、新しい曲のフレーズの区切りを今の曲の区切りとそろえてスタートさせることです。\n\n聴きながら小節を数えましょう。1-2-3-4で1小節、8小節たつとたいてい何かが起こります。今の曲のアウトロやブレイクダウンの32小節前など、フレーズの1拍目で次の曲を出すと、両方の曲が同じ瞬間に展開します。波形の色や拍カウンターも役立ちますが、確実なのは耳で数える力です。",
      th: "เพลงแดนซ์ส่วนใหญ่สร้างจากเฟรส 8, 16 หรือ 32 ห้อง (1 ห้อง = 4 บีต) ต้นเฟรสมักมีบางอย่างเปลี่ยน เช่น เครื่องดนตรีใหม่เข้ามา เบสหายไป หรือเริ่มเบรกดาวน์ การมิกซ์ตามเฟรสคือการปล่อยเพลงใหม่ให้รอยต่อเฟรสตรงกับเพลงที่เล่นอยู่\n\nนับห้องขณะฟัง 1-2-3-4 คือหนึ่งห้อง ครบ 8 ห้องมักมีอะไรเกิดขึ้น ปล่อยเพลงใหม่ที่บีตแรกของเฟรสในเพลงเดิม มักเป็น 32 ห้องก่อนเอาท์โทรหรือเบรกดาวน์ของเพลงเดิม เพื่อให้ทั้งสองเพลงเปลี่ยนพร้อมกัน สีเวฟฟอร์มและตัวนับบีตในซอฟต์แวร์ช่วยได้ แต่การนับด้วยหูคือทักษะที่เชื่อถือได้",
    },
    points: {
      en: ["Phrases are usually 8/16/32 bars", "Start the new track on a phrase boundary", "Both tracks should change at the same moment", "Count by ear; use waveforms as a check"],
      ja: ["フレーズは通常8/16/32小節", "新しい曲はフレーズの区切りで出す", "2曲が同じ瞬間に展開するように", "耳で数え、波形は確認に使う"],
      th: ["เฟรสมักยาว 8/16/32 ห้อง", "ปล่อยเพลงใหม่ที่รอยต่อเฟรส", "ให้สองเพลงเปลี่ยนพร้อมกัน", "นับด้วยหู ใช้เวฟฟอร์มตรวจสอบ"],
    },
    practice: {
      en: "Choose three tracks and mark every phrase change (time stamps) while counting bars. Then mix track 1 into track 2 starting exactly 32 bars before track 1's outro.",
      ja: "3曲を選び、小節を数えながらすべてのフレーズの切り替わりの時刻をメモします。次に、曲1のアウトロのちょうど32小節前から曲2を出してつなぎましょう。",
      th: "เลือก 3 เพลง จดเวลาทุกจุดเปลี่ยนเฟรสขณะนับห้อง จากนั้นมิกซ์เพลง 1 เข้าเพลง 2 โดยปล่อยเพลง 2 ตรง 32 ห้องก่อนเอาท์โทรของเพลง 1",
    },
    quiz: [
      { q: { en: "How many beats are in a 16-bar phrase (4/4)?", ja: "16小節のフレーズ（4/4拍子）は何拍？", th: "เฟรส 16 ห้อง (4/4) มีกี่บีต" }, o: { en: ["16", "32", "64"], ja: ["16", "32", "64"], th: ["16", "32", "64"] }, a: 2 },
      { q: { en: "What is the goal of phrase mixing?", ja: "フレーズミックスの目的は？", th: "เป้าหมายของการมิกซ์ตามเฟรสคืออะไร" },
        o: { en: ["Both tracks change at the same moment", "Mix as fast as possible", "Avoid using EQ"], ja: ["2曲が同じ瞬間に展開する", "できるだけ速くつなぐ", "EQを使わない"], th: ["สองเพลงเปลี่ยนพร้อมกัน", "มิกซ์ให้เร็วที่สุด", "ไม่ใช้อีคิว"] }, a: 0 },
      { q: { en: "Where should the incoming track usually start?", ja: "次の曲は通常どこで出す？", th: "เพลงใหม่ควรเริ่มที่ใด" },
        o: { en: ["Any beat", "The first beat of a phrase", "The middle of a bar"], ja: ["どの拍でもよい", "フレーズの1拍目", "小節の途中"], th: ["บีตไหนก็ได้", "บีตแรกของเฟรส", "กลางห้อง"] }, a: 1 },
    ],
  },
  {
    minutes: 10,
    body: {
      en: "The 3-band EQ lets two tracks share the frequency range instead of piling up. The most important rule: never let two full basslines (low EQ) play together at full level — it sounds muddy and can push the system into distortion. A common approach is the bass swap: bring the new track in with its low cut, then at a phrase change cut the old track's low and open the new track's low at the same moment.\n\nMids hold vocals, synths and snares; two vocals at once clash, so lower one track's mids. Highs carry hi-hats and air; cutting highs makes a track feel distant, which is useful for bringing a track in gently. EQ is not a volume knob: use it to shape, then set level with gain and faders.",
      ja: "3バンドEQを使うと、2曲が周波数帯を奪い合わずに共存できます。最重要ルールは、2曲のベースライン（ロー）をフルで同時に鳴らさないこと。音がこもり、システムが歪む原因になります。代表的なのがベーススワップです。新しい曲はローをカットした状態で入れ、フレーズの変わり目で古い曲のローを切ると同時に新しい曲のローを戻します。\n\nミッドにはボーカル、シンセ、スネアが入っています。ボーカルが2つ重なるとぶつかるので、片方のミッドを下げます。ハイはハイハットや空気感を担い、ハイを切ると曲が遠く感じられるため、そっと曲を入れる時に便利です。EQは音量つまみではありません。音を整える道具として使い、音量はゲインとフェーダーで決めます。",
      th: "อีคิว 3 ย่านช่วยให้สองเพลงแบ่งย่านความถี่กันแทนที่จะทับกัน กฎสำคัญที่สุดคือ อย่าให้เบสไลน์ (ย่านต่ำ) ของสองเพลงดังเต็มพร้อมกัน เสียงจะขุ่นและทำให้ระบบเสียงแตกได้ วิธีที่นิยมคือการสลับเบส นำเพลงใหม่เข้ามาโดยตัดย่านต่ำไว้ แล้วที่รอยต่อเฟรสให้ตัดย่านต่ำของเพลงเก่าพร้อมเปิดย่านต่ำของเพลงใหม่\n\nย่านกลางมีเสียงร้อง ซินธ์ และสแนร์ เสียงร้องสองเสียงพร้อมกันจะชนกัน จึงควรลดย่านกลางของเพลงหนึ่ง ย่านสูงมีไฮแฮตและความโปร่ง การตัดย่านสูงทำให้เพลงฟังไกล ใช้ได้ดีตอนนำเพลงเข้ามาเบา ๆ อีคิวไม่ใช่ปุ่มความดัง ใช้แต่งเสียง แล้วตั้งความดังด้วยเกนและเฟดเดอร์",
    },
    points: {
      en: ["Never run two full basslines together", "Bass swap on a phrase change", "Lower mids to avoid vocal clashes", "EQ shapes; gain/faders set level"],
      ja: ["2曲のベースをフルで同時に鳴らさない", "ベーススワップはフレーズの変わり目で", "ボーカルがぶつかる時はミッドを下げる", "EQは音作り、音量はゲインとフェーダー"],
      th: ["อย่าเปิดเบสเต็มสองเพลงพร้อมกัน", "สลับเบสที่รอยต่อเฟรส", "ลดย่านกลางเมื่อเสียงร้องชนกัน", "อีคิวใช้แต่งเสียง เกน/เฟดเดอร์ใช้ตั้งความดัง"],
    },
    practice: {
      en: "Do ten transitions using only a bass swap on the phrase change. Record them and listen: is there any moment where both basslines play at once, or a gap with no bass at all?",
      ja: "フレーズの変わり目でのベーススワップだけを使って10回つなぎます。録音して、ベースが2つ同時に鳴る瞬間や、ベースが全くない隙間がないか確認しましょう。",
      th: "ทำทรานซิชัน 10 ครั้งโดยใช้การสลับเบสที่รอยต่อเฟรสเท่านั้น อัดเสียงแล้วฟังว่ามีช่วงที่เบสสองเพลงดังพร้อมกัน หรือช่วงที่ไม่มีเบสเลยไหม",
    },
    quiz: [
      { q: { en: "What happens if two full basslines play together?", ja: "2曲のベースがフルで重なると？", th: "ถ้าเบสสองเพลงดังเต็มพร้อมกันจะเกิดอะไร" },
        o: { en: ["Clearer sound", "Muddy sound and possible distortion", "Nothing"], ja: ["音がクリアになる", "音がこもり歪むことがある", "何も起きない"], th: ["เสียงชัดขึ้น", "เสียงขุ่นและอาจแตก", "ไม่มีอะไร"] }, a: 1 },
      { q: { en: "Which band mostly holds vocals?", ja: "ボーカルが主に含まれる帯域は？", th: "เสียงร้องอยู่ย่านไหนเป็นหลัก" }, o: { en: ["Low", "Mid", "High"], ja: ["ロー", "ミッド", "ハイ"], th: ["ต่ำ", "กลาง", "สูง"] }, a: 1 },
      { q: { en: "When is the best moment for a bass swap?", ja: "ベーススワップに最適なタイミングは？", th: "ช่วงไหนเหมาะกับการสลับเบสที่สุด" },
        o: { en: ["At a phrase change", "Randomly", "During a vocal line"], ja: ["フレーズの変わり目", "適当なタイミング", "ボーカルの途中"], th: ["ที่รอยต่อเฟรส", "เมื่อไรก็ได้", "ระหว่างท่อนร้อง"] }, a: 0 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "Channel faders control how much of each track reaches the mix; the crossfader blends between deck sides. Many house and techno DJs leave the crossfader in the middle and mix with channel faders only, which gives finer control. Scratch and hip hop DJs use a sharp crossfader curve for fast cuts.\n\nMove faders with intention: a slow 16- or 32-bar blend suits long, smooth transitions; a quick cut on the downbeat suits genre changes or high-energy moments. Check the fader curve setting on your mixer — a 'smooth' curve and a 'sharp' curve feel completely different with the same hand movement.",
      ja: "チャンネルフェーダーは各曲をどれだけミックスに出すかを決め、クロスフェーダーは左右のデッキをブレンドします。ハウスやテクノのDJの多くはクロスフェーダーを中央に置いたまま、より細かく調整できるチャンネルフェーダーだけでミックスします。スクラッチやヒップホップのDJは、素早いカットのためにシャープなカーブを使います。\n\nフェーダーは意図を持って動かしましょう。16〜32小節のゆっくりしたブレンドは長くなめらかなつなぎに、頭拍での素早いカットはジャンルチェンジや盛り上がる瞬間に向いています。ミキサーのフェーダーカーブ設定も確認しましょう。同じ手の動きでも「スムーズ」と「シャープ」では全く違う結果になります。",
      th: "เฟดเดอร์แชนเนลคุมว่าแต่ละเพลงเข้ามิกซ์มากแค่ไหน ครอสเฟดเดอร์ผสมระหว่างสองฝั่ง ดีเจเฮาส์และเทคโนหลายคนวางครอสเฟดเดอร์ไว้ตรงกลางแล้วใช้แต่เฟดเดอร์แชนเนลซึ่งคุมได้ละเอียดกว่า ดีเจสแครชและฮิปฮอปใช้เคิร์ฟแบบคมเพื่อตัดเร็ว\n\nขยับเฟดเดอร์อย่างตั้งใจ การผสมช้า ๆ 16–32 ห้องเหมาะกับทรานซิชันยาวและนุ่ม การตัดเร็วบนดาวน์บีตเหมาะกับการเปลี่ยนแนวหรือช่วงพลังสูง ตรวจสอบการตั้งค่าเคิร์ฟเฟดเดอร์ด้วย เพราะเคิร์ฟ \"นุ่ม\" กับ \"คม\" ให้ผลต่างกันมากแม้ขยับมือเท่ากัน",
    },
    points: {
      en: ["Channel faders = how much of each track", "Many club DJs leave the crossfader centred", "Slow blends vs. quick cuts — choose deliberately", "Know your fader curve setting"],
      ja: ["チャンネルフェーダー＝各曲の出す量", "クラブDJの多くはクロスフェーダーを中央に", "ゆっくりのブレンドか素早いカットかを意図して選ぶ", "フェーダーカーブ設定を把握する"],
      th: ["เฟดเดอร์แชนเนล = ปริมาณของแต่ละเพลง", "ดีเจคลับหลายคนวางครอสเฟดเดอร์ไว้กลาง", "เลือกระหว่างผสมช้ากับตัดเร็วอย่างตั้งใจ", "รู้การตั้งค่าเคิร์ฟเฟดเดอร์ของคุณ"],
    },
    practice: {
      en: "Mix the same two tracks three ways: a 32-bar fader blend, an 8-bar blend, and a cut on the downbeat. Record all three and decide which suits those tracks best, and why.",
      ja: "同じ2曲を3通りでつなぎます：32小節のフェーダーブレンド、8小節のブレンド、頭拍でのカット。3つとも録音し、その2曲に一番合うのはどれか、理由と一緒に考えましょう。",
      th: "มิกซ์สองเพลงเดิม 3 แบบ: ผสมด้วยเฟดเดอร์ 32 ห้อง ผสม 8 ห้อง และตัดบนดาวน์บีต อัดเสียงทั้งสามแล้วตัดสินว่าแบบไหนเหมาะกับสองเพลงนี้ที่สุด เพราะอะไร",
    },
    quiz: [
      { q: { en: "Why do many club DJs mix with channel faders only?", ja: "多くのクラブDJがチャンネルフェーダーだけでミックスする理由は？", th: "ทำไมดีเจคลับหลายคนมิกซ์ด้วยเฟดเดอร์แชนเนลอย่างเดียว" },
        o: { en: ["Finer control", "The crossfader is broken", "It's louder"], ja: ["より細かく調整できる", "クロスフェーダーが壊れている", "音が大きくなる"], th: ["คุมได้ละเอียดกว่า", "ครอสเฟดเดอร์เสีย", "เสียงดังกว่า"] }, a: 0 },
      { q: { en: "Which fader curve suits scratching?", ja: "スクラッチに向いているカーブは？", th: "เคิร์ฟเฟดเดอร์แบบไหนเหมาะกับการสแครช" }, o: { en: ["Smooth", "Sharp", "Any"], ja: ["スムーズ", "シャープ", "どれでも"], th: ["นุ่ม", "คม", "แบบไหนก็ได้"] }, a: 1 },
      { q: { en: "A quick cut on the downbeat is useful for…", ja: "頭拍での素早いカットが向いているのは…", th: "การตัดเร็วบนดาวน์บีตเหมาะกับ…" },
        o: { en: ["Genre changes or high-energy moments", "Very long ambient blends", "Gain staging"], ja: ["ジャンルチェンジや盛り上がる瞬間", "とても長いアンビエントのブレンド", "ゲイン調整"], th: ["การเปลี่ยนแนวหรือช่วงพลังสูง", "การผสมแอมเบียนต์ยาว ๆ", "การปรับเกน"] }, a: 0 },
    ],
  },
  {
    minutes: 10,
    body: {
      en: "Gain staging means setting each channel's input level so all tracks reach the mix at a similar loudness, with headroom left before distortion. Watch the channel meter: most of the track should sit around the 0 dB mark on club mixers (the orange area is the limit), never constantly in the red.\n\nSet gain with the channel fader up and EQ flat, then use faders for musical changes. If the master meter is in the red, turning up the booth or asking for more volume from the sound engineer is the fix — not pushing your master harder. Distortion in a club damages the speakers, tires listeners and is the most common thing sound engineers complain about. Mix Lab measures clipping and loudness of your recordings so you can check this objectively.",
      ja: "ゲインステージングとは、各チャンネルの入力レベルを調整して、すべての曲が同じくらいの音量でミックスに入り、歪むまでの余裕（ヘッドルーム）を残すことです。チャンネルメーターを見ましょう。クラブ用ミキサーでは曲の大半が0 dB付近に収まるのが目安で（オレンジが限界）、常に赤に入るのはNGです。\n\nゲインはチャンネルフェーダーを上げ、EQをフラットにした状態で合わせ、音楽的な変化はフェーダーで行います。マスターメーターが赤なら、マスターを押し上げるのではなく、ブースを上げるかPAエンジニアに音量を上げてもらうのが正解です。クラブでの歪みはスピーカーを傷め、聴く人を疲れさせ、PAから最も多く指摘される点です。Mix Labでは録音のクリッピングと音量を計測できるので、客観的に確認できます。",
      th: "การจัดเกนคือการตั้งระดับสัญญาณเข้าของแต่ละแชนเนลให้ทุกเพลงเข้ามิกซ์ด้วยความดังใกล้เคียงกัน และเหลือเฮดรูมก่อนเสียงแตก ดูมิเตอร์แชนเนล บนมิกเซอร์คลับส่วนใหญ่ของเพลงควรอยู่ราว 0 dB (สีส้มคือขีดจำกัด) ไม่ใช่อยู่ในสีแดงตลอด\n\nตั้งเกนโดยดันเฟดเดอร์แชนเนลขึ้นและอีคิวแบน แล้วใช้เฟดเดอร์สำหรับการเปลี่ยนทางดนตรี ถ้ามิเตอร์มาสเตอร์แดง วิธีแก้คือเพิ่มบูธหรือขอให้ซาวด์เอนจิเนียร์เพิ่มเสียง ไม่ใช่ดันมาสเตอร์ให้ดังขึ้น เสียงแตกในคลับทำลายลำโพง ทำให้ผู้ฟังเหนื่อย และเป็นเรื่องที่ซาวด์เอนจิเนียร์บ่นบ่อยที่สุด Mix Lab วัดการคลิปและความดังของไฟล์อัดเสียงให้ตรวจสอบได้อย่างเป็นกลาง",
    },
    points: {
      en: ["Match track levels with gain, EQ flat", "Keep meters out of the red", "Need more volume? Booth / sound engineer, not master", "Check your recordings for clipping in Mix Lab"],
      ja: ["EQフラットでゲインを合わせる", "メーターを赤に入れない", "音量が足りない時はブース／PAに。マスターではない", "録音のクリッピングをMix Labで確認"],
      th: ["ตั้งเกนให้ความดังเท่ากันโดยอีคิวแบน", "อย่าให้มิเตอร์เข้าแดง", "อยากได้เสียงดังขึ้น? บูธ/ซาวด์เอนจิเนียร์ ไม่ใช่มาสเตอร์", "ตรวจการคลิปของไฟล์อัดใน Mix Lab"],
    },
    practice: {
      en: "Record a 20-minute mix keeping every channel peak below the red. Upload it to Mix Lab and check the clipping count and loudness curve. Aim for zero clipping events.",
      ja: "すべてのチャンネルのピークを赤に入れずに20分のミックスを録音します。Mix Labで解析し、クリッピング回数と音量カーブを確認しましょう。目標はクリッピング0回です。",
      th: "อัดมิกซ์ 20 นาทีโดยให้พีกทุกแชนเนลต่ำกว่าสีแดง วิเคราะห์ใน Mix Lab แล้วดูจำนวนการคลิปและเส้นความดัง ตั้งเป้าไม่มีการคลิปเลย",
    },
    quiz: [
      { q: { en: "The master meter is constantly red. What should you do?", ja: "マスターメーターが常に赤です。どうする？", th: "มิเตอร์มาสเตอร์แดงตลอด ควรทำอย่างไร" },
        o: { en: ["Push the master further", "Lower gains/master and ask for more booth or PA volume", "Boost all EQs"], ja: ["さらにマスターを上げる", "ゲイン/マスターを下げ、ブースやPAの音量を上げてもらう", "すべてのEQを上げる"], th: ["ดันมาสเตอร์ขึ้นอีก", "ลดเกน/มาสเตอร์แล้วขอเพิ่มบูธหรือ PA", "เพิ่มอีคิวทั้งหมด"] }, a: 1 },
      { q: { en: "How should EQ be set while setting gain?", ja: "ゲインを合わせる時のEQは？", th: "ขณะตั้งเกน อีคิวควรเป็นอย่างไร" }, o: { en: ["Flat", "Bass boosted", "Highs cut"], ja: ["フラット", "ローを上げる", "ハイを切る"], th: ["แบน", "เพิ่มเบส", "ตัดย่านสูง"] }, a: 0 },
      { q: { en: "What is headroom?", ja: "ヘッドルームとは？", th: "เฮดรูมคืออะไร" },
        o: { en: ["Space left before distortion", "The DJ booth", "A type of headphone"], ja: ["歪むまでの余裕", "DJブース", "ヘッドホンの種類"], th: ["ช่องว่างก่อนเสียงแตก", "บูธดีเจ", "ชนิดของหูฟัง"] }, a: 0 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "A loop repeats a section of a track — usually 1, 2, 4, 8 or 16 beats — perfectly in time. Loops let you extend an intro that is too short, hold a groove while you fix something, or build tension by halving the loop length (8 → 4 → 2 → 1 beat) before releasing on the drop.\n\nAlways set loops on the beat (quantise on) and exit them at the end of a phrase so the track continues musically. Use loops sparingly in a set — repeating a section too long is noticeable to dancers.",
      ja: "ループは曲の一部（通常1・2・4・8・16拍）をテンポに合わせて繰り返します。短すぎるイントロを延ばす、何かを直す間グルーヴを保つ、ループ長を半分ずつ（8→4→2→1拍）にして緊張感を高めてからドロップで解放する、といった使い方ができます。\n\nループは必ず拍に合わせて（クオンタイズON）設定し、フレーズの終わりで抜けて曲が音楽的に続くようにしましょう。セットの中では控えめに。同じ部分を長く繰り返すと踊っている人にも気づかれます。",
      th: "ลูปคือการเล่นซ้ำบางส่วนของเพลง มักเป็น 1, 2, 4, 8 หรือ 16 บีต ให้ตรงจังหวะพอดี ลูปช่วยยืดอินโทรที่สั้นเกินไป ประคองกรูฟขณะแก้ปัญหา หรือสร้างความตึงด้วยการลดความยาวลูปครึ่งหนึ่งทีละขั้น (8 → 4 → 2 → 1 บีต) ก่อนปล่อยที่ดร็อป\n\nตั้งลูปบนบีตเสมอ (เปิดควอนไทซ์) และออกจากลูปตอนจบเฟรสเพื่อให้เพลงไปต่ออย่างเป็นดนตรี ใช้ลูปแต่พอดีในเซ็ต เพราะการเล่นซ้ำนานเกินไปคนเต้นจะสังเกตได้",
    },
    points: {
      en: ["Loops: 1/2/4/8/16 beats, on the beat", "Extend short intros or hold a groove", "Halving loops builds tension", "Exit at a phrase end; don't overuse"],
      ja: ["ループは1/2/4/8/16拍、拍に合わせて", "短いイントロの延長やグルーヴの維持に", "ループを半分ずつ短くすると緊張感が高まる", "フレーズの終わりで抜ける。使いすぎない"],
      th: ["ลูป 1/2/4/8/16 บีต ตรงบีต", "ยืดอินโทรสั้นหรือประคองกรูฟ", "ลดลูปครึ่งหนึ่งสร้างความตึง", "ออกที่จบเฟรส อย่าใช้มากเกินไป"],
    },
    practice: {
      en: "Take a track with a 16-bar intro and loop it to make a 32-bar intro, then mix into it. Next, build a loop roll 8 → 4 → 2 → 1 beats before a drop and release exactly on the drop.",
      ja: "イントロ16小節の曲をループで32小節に延ばし、そこへつなぎます。次に、ドロップ前で8→4→2→1拍とループを短くし、ちょうどドロップで解放しましょう。",
      th: "นำเพลงที่อินโทร 16 ห้องมาลูปให้เป็น 32 ห้องแล้วมิกซ์เข้า จากนั้นทำลูปโรล 8 → 4 → 2 → 1 บีตก่อนดร็อป และปล่อยตรงดร็อปพอดี",
    },
    quiz: [
      { q: { en: "Why turn quantise on when setting loops?", ja: "ループ設定時にクオンタイズをONにする理由は？", th: "ทำไมต้องเปิดควอนไทซ์เวลาตั้งลูป" },
        o: { en: ["Loops snap to the beat", "It increases volume", "It changes the key"], ja: ["ループが拍にそろう", "音量が上がる", "キーが変わる"], th: ["ลูปจะล็อกตรงบีต", "เพิ่มความดัง", "เปลี่ยนคีย์"] }, a: 0 },
      { q: { en: "When should you exit a loop?", ja: "ループはいつ抜ける？", th: "ควรออกจากลูปเมื่อไร" }, o: { en: ["At a phrase end", "Mid-bar", "Never"], ja: ["フレーズの終わり", "小節の途中", "抜けない"], th: ["ตอนจบเฟรส", "กลางห้อง", "ไม่ต้องออก"] }, a: 0 },
      { q: { en: "Halving a loop 8 → 4 → 2 → 1 beats mainly…", ja: "ループを8→4→2→1拍と半分にしていくと主に…", th: "การลดลูป 8 → 4 → 2 → 1 บีต ส่วนใหญ่ใช้เพื่อ…" },
        o: { en: ["Builds tension", "Fixes the BPM", "Lowers the bass"], ja: ["緊張感を高める", "BPMを直す", "低音を下げる"], th: ["สร้างความตึง", "แก้ BPM", "ลดเบส"] }, a: 0 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "Effects (FX) colour a transition. Filters (low-pass/high-pass) remove frequencies smoothly and are the most useful everyday effect. Echo/delay repeats the sound in time with the BPM and is a classic way to exit a track: put an echo on the last beat, then fade the channel. Reverb adds space. Beat-synced effects use a beat length (1/2, 1, 2 beats) so they stay musical.\n\nUse effects to support the music, not to cover a messy mix. Start with the effect's dry/wet low, bring it in on a phrase, and switch it off on the downbeat. If people notice the effect more than the music, there is too much.",
      ja: "エフェクト（FX）はトランジションに色をつけます。フィルター（ローパス/ハイパス）は周波数をなめらかに削り、日常的に最も役立つエフェクトです。エコー/ディレイはBPMに合わせて音を繰り返し、曲を抜ける定番の方法です。最後の拍にエコーをかけてからチャンネルを下げます。リバーブは空間を加えます。ビート同期のエフェクトは拍の長さ（1/2・1・2拍など）で設定するので音楽的に保てます。\n\nエフェクトは音楽を支えるために使い、雑なミックスを隠すためには使いません。Dry/Wetを低めから始め、フレーズの頭で入れ、頭拍でオフにします。音楽よりエフェクトの方が目立つなら、かけすぎです。",
      th: "เอฟเฟกต์ (FX) แต่งสีสันให้ทรานซิชัน ฟิลเตอร์ (โลว์พาส/ไฮพาส) ตัดความถี่อย่างนุ่มนวลและมีประโยชน์ที่สุดในการเล่นประจำวัน เอคโค/ดีเลย์ทำเสียงซ้ำตาม BPM และเป็นวิธีคลาสสิกในการออกจากเพลง ใส่เอคโคที่บีตสุดท้ายแล้วลดแชนเนลลง รีเวิร์บเพิ่มมิติ เอฟเฟกต์ที่ซิงก์บีตตั้งความยาวเป็นบีต (1/2, 1, 2 บีต) จึงฟังเป็นดนตรี\n\nใช้เอฟเฟกต์เพื่อเสริมดนตรี ไม่ใช่ปิดบังมิกซ์ที่เละ เริ่มจากดรายเว็ตต่ำ เปิดที่ต้นเฟรส และปิดบนดาวน์บีต ถ้าคนสังเกตเอฟเฟกต์มากกว่าเพลง แปลว่าใส่มากเกินไป",
    },
    points: {
      en: ["Filters are the everyday workhorse", "Echo out on the last beat to exit a track", "Use beat-synced lengths", "Effects support the music — don't overdo it"],
      ja: ["フィルターは日常的に一番使うエフェクト", "最後の拍にエコーをかけて曲を抜ける", "拍に同期した長さで使う", "エフェクトは音楽を支えるもの。かけすぎない"],
      th: ["ฟิลเตอร์คือเอฟเฟกต์หลักในการเล่น", "ใส่เอคโคที่บีตสุดท้ายเพื่อออกจากเพลง", "ใช้ความยาวที่ซิงก์บีต", "เอฟเฟกต์เสริมเพลง อย่าใส่มากเกิน"],
    },
    practice: {
      en: "Do three transitions: one with a high-pass filter on the outgoing track, one echo-out, one with no effect at all. Compare the recordings and note which felt most natural.",
      ja: "3回つなぎます：外す曲にハイパスフィルター、エコーアウト、エフェクトなし。録音を比べ、どれが一番自然だったかメモしましょう。",
      th: "ทำทรานซิชัน 3 แบบ: ใส่ไฮพาสฟิลเตอร์กับเพลงที่จะออก เอคโคเอาท์ และไม่ใส่เอฟเฟกต์เลย เทียบไฟล์อัดแล้วจดว่าแบบไหนเป็นธรรมชาติที่สุด",
    },
    quiz: [
      { q: { en: "A classic way to exit a track is…", ja: "曲を抜ける定番の方法は…", th: "วิธีคลาสสิกในการออกจากเพลงคือ…" },
        o: { en: ["Echo on the last beat, then fade", "Maximum reverb for 2 minutes", "Turning up the gain"], ja: ["最後の拍にエコー、その後フェード", "2分間リバーブを最大", "ゲインを上げる"], th: ["ใส่เอคโคที่บีตสุดท้ายแล้วเฟด", "รีเวิร์บสูงสุด 2 นาที", "เพิ่มเกน"] }, a: 0 },
      { q: { en: "Which effect is most useful day-to-day?", ja: "日常的に最も役立つエフェクトは？", th: "เอฟเฟกต์ใดใช้บ่อยที่สุด" }, o: { en: ["Filter", "Flanger", "Bit crusher"], ja: ["フィルター", "フランジャー", "ビットクラッシャー"], th: ["ฟิลเตอร์", "แฟลนเจอร์", "บิตครัชเชอร์"] }, a: 0 },
      { q: { en: "Too much effect means…", ja: "エフェクトがかかりすぎとは…", th: "ใส่เอฟเฟกต์มากเกินไปคือ…" },
        o: { en: ["People notice the effect more than the music", "The BPM is wrong", "The mixer is broken"], ja: ["音楽よりエフェクトが目立っている", "BPMが間違っている", "ミキサーが壊れている"], th: ["คนสังเกตเอฟเฟกต์มากกว่าเพลง", "BPM ผิด", "มิกเซอร์เสีย"] }, a: 0 },
    ],
  },
  {
    minutes: 12,
    body: {
      en: "A transition combines everything so far: phrase timing, beatmatching, EQ and faders. A reliable long blend: (1) start the new track on a phrase with its low cut and fader down; (2) bring the fader up over 8–16 bars; (3) on the next phrase, swap basses; (4) lower mids/highs and the fader of the old track over the next phrase; (5) let it go at its outro.\n\nOther types: the cut (instant switch on the downbeat), the echo-out (old track fades on an echo, new one starts clean), and the breakdown mix (bring the new track in during the old track's breakdown). Plan transitions by asking: how long are the intros/outros, do the keys clash (see Level 3), and should the energy rise, hold or drop?",
      ja: "トランジションはここまでのすべて（フレーズのタイミング、ビートマッチ、EQ、フェーダー）の組み合わせです。安定したロングブレンドの手順：(1) 新しい曲をローカット・フェーダー下げの状態でフレーズの頭から出す、(2) 8〜16小節かけてフェーダーを上げる、(3) 次のフレーズでベーススワップ、(4) 次のフレーズで古い曲のミッド・ハイとフェーダーを下げる、(5) アウトロで抜ききる。\n\n他にも、カット（頭拍で瞬時に切り替え）、エコーアウト（古い曲をエコーで消し、新しい曲をクリーンに出す）、ブレイクダウンミックス（古い曲のブレイクダウン中に新しい曲を入れる）などがあります。イントロ/アウトロの長さ、キーがぶつからないか（レベル3参照）、エネルギーを上げるか保つか下げるかを考えてトランジションを計画しましょう。",
      th: "ทรานซิชันคือการรวมทุกอย่างที่เรียนมา ทั้งจังหวะเฟรส การแมตช์บีต อีคิว และเฟดเดอร์ วิธีผสมยาวที่เชื่อถือได้: (1) ปล่อยเพลงใหม่ที่ต้นเฟรสโดยตัดย่านต่ำและเฟดเดอร์ลง (2) ดันเฟดเดอร์ขึ้นใน 8–16 ห้อง (3) เฟรสถัดไปสลับเบส (4) เฟรสถัดไปลดย่านกลาง/สูงและเฟดเดอร์ของเพลงเก่า (5) ปล่อยเพลงเก่าที่เอาท์โทร\n\nแบบอื่น ๆ ได้แก่ การตัด (สลับทันทีบนดาวน์บีต) เอคโคเอาท์ (เพลงเก่าหายไปพร้อมเอคโค เพลงใหม่เริ่มสะอาด) และเบรกดาวน์มิกซ์ (นำเพลงใหม่เข้าระหว่างเบรกดาวน์ของเพลงเก่า) วางแผนทรานซิชันโดยถามว่า อินโทร/เอาท์โทรยาวแค่ไหน คีย์ชนกันไหม (ดูเลเวล 3) และพลังงานควรขึ้น คงที่ หรือลง",
    },
    points: {
      en: ["Long blend: phrase start → fader up → bass swap → fade out", "Other types: cut, echo-out, breakdown mix", "Plan by intros/outros, keys and energy direction", "Record and review every practice transition"],
      ja: ["ロングブレンド：フレーズ頭→フェーダーUP→ベーススワップ→フェードアウト", "他にカット、エコーアウト、ブレイクダウンミックス", "イントロ/アウトロ、キー、エネルギーの方向で計画", "練習のつなぎは毎回録音して振り返る"],
      th: ["ผสมยาว: ต้นเฟรส → ดันเฟดเดอร์ → สลับเบส → เฟดออก", "แบบอื่น: ตัด เอคโคเอาท์ เบรกดาวน์มิกซ์", "วางแผนจากอินโทร/เอาท์โทร คีย์ และทิศทางพลังงาน", "อัดและทบทวนทุกทรานซิชันที่ฝึก"],
    },
    practice: {
      en: "Record a 30-minute mix with at least six transitions using at least three different transition types. Analyse it in Mix Lab, then ask the AI Coach about the weakest moment you hear.",
      ja: "3種類以上のトランジションを使い、6回以上つなぐ30分のミックスを録音します。Mix Labで解析し、自分で一番弱いと感じた箇所についてAIコーチに相談しましょう。",
      th: "อัดมิกซ์ 30 นาทีที่มีอย่างน้อย 6 ทรานซิชัน และใช้อย่างน้อย 3 แบบ วิเคราะห์ใน Mix Lab แล้วถาม AI Coach เกี่ยวกับช่วงที่คุณฟังแล้วอ่อนที่สุด",
    },
    quiz: [
      { q: { en: "In a long blend, when do you swap basses?", ja: "ロングブレンドでベーススワップするのは？", th: "ในการผสมยาว สลับเบสเมื่อไร" },
        o: { en: ["On a phrase change", "Before the new track starts", "Never"], ja: ["フレーズの変わり目", "新しい曲を出す前", "しない"], th: ["ที่รอยต่อเฟรส", "ก่อนเพลงใหม่เริ่ม", "ไม่สลับ"] }, a: 0 },
      { q: { en: "A breakdown mix brings the new track in…", ja: "ブレイクダウンミックスで新しい曲を入れるのは…", th: "เบรกดาวน์มิกซ์นำเพลงใหม่เข้ามา…" },
        o: { en: ["During the old track's breakdown", "After the old track ends", "Only at the very start of the set"], ja: ["古い曲のブレイクダウン中", "古い曲が終わった後", "セットの最初だけ"], th: ["ระหว่างเบรกดาวน์ของเพลงเก่า", "หลังเพลงเก่าจบ", "เฉพาะต้นเซ็ต"] }, a: 0 },
      { q: { en: "Which question is NOT part of planning a transition?", ja: "トランジションの計画に含まれないのは？", th: "ข้อใดไม่ใช่ส่วนหนึ่งของการวางแผนทรานซิชัน" },
        o: { en: ["How long are the intros/outros?", "Do the keys clash?", "What colour is the track artwork?"], ja: ["イントロ/アウトロの長さは？", "キーはぶつからないか？", "ジャケットの色は？"], th: ["อินโทร/เอาท์โทรยาวแค่ไหน", "คีย์ชนกันไหม", "ปกเพลงสีอะไร"] }, a: 2 },
    ],
  },
];
