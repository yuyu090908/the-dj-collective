import type { ModuleContent } from "./types";

// LEVEL 03 — MUSIC SELECTION
export const level3: ModuleContent[] = [
  {
    minutes: 12,
    body: {
      en: "Harmonic mixing means choosing tracks whose musical keys work together, so overlapping melodies and basslines don't clash. The Camelot wheel makes this simple: each key has a number (1–12) and a letter (A = minor, B = major). Compatible moves: same code (8A → 8A), one step around the wheel (8A → 7A or 9A), or switching letter at the same number (8A → 8B, the relative major/minor). '+2' (8A → 10A) is a bolder 'energy boost'.\n\nKey analysis in software is an estimate — percussive tracks with little melody are often detected wrongly, so trust your ears. Harmonic mixing matters most when two melodic parts overlap for a long time. Drum-only intros and quick cuts are much less sensitive. Treat key as a tool, not a rule: a great selection that clashes slightly is often better than a dull one that matches perfectly.",
      ja: "ハーモニックミックスとは、キーの相性が良い曲を選び、重なるメロディやベースがぶつからないようにすることです。キャメロットホイールを使うと簡単です。各キーには数字（1〜12）と文字（A＝マイナー、B＝メジャー）が付いています。相性の良い動き：同じコード（8A→8A）、ホイール上で1つ隣（8A→7A/9A）、同じ数字で文字を変える（8A→8B、平行調）。「+2」（8A→10A）は大胆なエネルギーブーストです。\n\nソフトのキー解析は推定です。メロディが少ない打楽器中心の曲は誤検出されやすいので、耳で確認しましょう。ハーモニックミックスが重要なのは、2つのメロディが長く重なる時です。ドラムだけのイントロや素早いカットではそれほど影響しません。キーはルールではなく道具。少しぶつかっても最高の選曲の方が、完璧に合う退屈な選曲より良いこともよくあります。",
      th: "ฮาร์โมนิกมิกซ์คือการเลือกเพลงที่คีย์เข้ากันได้ เพื่อให้เมโลดี้และเบสไลน์ที่ซ้อนกันไม่ชนกัน วงล้อคาเมล็อตทำให้ง่ายขึ้น แต่ละคีย์มีตัวเลข (1–12) และตัวอักษร (A = ไมเนอร์, B = เมเจอร์) การเปลี่ยนที่เข้ากัน: โค้ดเดิม (8A → 8A) ขยับหนึ่งช่องรอบวงล้อ (8A → 7A หรือ 9A) หรือเปลี่ยนตัวอักษรที่เลขเดิม (8A → 8B คีย์คู่ขนาน) ส่วน \"+2\" (8A → 10A) เป็นการเพิ่มพลังแบบกล้าขึ้น\n\nการวิเคราะห์คีย์ในซอฟต์แวร์เป็นการประมาณ เพลงที่เน้นเพอร์คัชชันและมีเมโลดี้น้อยมักตรวจผิด จึงควรใช้หูตรวจสอบ ฮาร์โมนิกมิกซ์สำคัญที่สุดเมื่อเมโลดี้สองส่วนซ้อนกันนาน อินโทรที่มีแต่กลองหรือการตัดเร็วได้รับผลน้อยกว่ามาก ใช้คีย์เป็นเครื่องมือ ไม่ใช่กฎ เพลงที่เลือกได้ยอดเยี่ยมแต่ชนเล็กน้อยมักดีกว่าเพลงที่เข้ากันเป๊ะแต่น่าเบื่อ",
    },
    points: {
      en: ["Camelot: number 1–12 + A (minor) / B (major)", "Safe moves: same, ±1, A↔B at the same number", "+2 = energy boost", "Key detection is an estimate; ears decide"],
      ja: ["キャメロット：数字1〜12＋A（マイナー）/B（メジャー）", "安全な動き：同じ、±1、同じ数字でA↔B", "+2＝エネルギーブースト", "キー検出は推定。最後は耳で判断"],
      th: ["คาเมล็อต: เลข 1–12 + A (ไมเนอร์) / B (เมเจอร์)", "การเปลี่ยนที่ปลอดภัย: เดิม, ±1, A↔B เลขเดิม", "+2 = เพิ่มพลัง", "การตรวจคีย์เป็นการประมาณ หูเป็นผู้ตัดสิน"],
    },
    practice: {
      en: "Build a 10-track list in Set Builder where every step is a compatible Camelot move. Then try one deliberate clash with a long overlap and listen to what happens.",
      ja: "Set Builderで、すべてのつなぎがキャメロット上で相性の良い動きになる10曲のリストを作ります。次に、あえてぶつかる組み合わせを長く重ねて、何が起こるか聴いてみましょう。",
      th: "สร้างรายการ 10 เพลงใน Set Builder ที่ทุกขั้นเป็นการเปลี่ยนคาเมล็อตที่เข้ากัน จากนั้นลองจับคู่ที่ชนกันโดยตั้งใจและซ้อนนาน ๆ แล้วฟังว่าเกิดอะไรขึ้น",
    },
    quiz: [
      { q: { en: "Which move is compatible from 5A?", ja: "5Aから相性が良いのは？", th: "จาก 5A การเปลี่ยนใดเข้ากันได้" }, o: { en: ["5B", "11A", "8B"], ja: ["5B", "11A", "8B"], th: ["5B", "11A", "8B"] }, a: 0 },
      { q: { en: "In Camelot notation, 'A' means…", ja: "キャメロットの「A」は…", th: "ในคาเมล็อต \"A\" หมายถึง…" }, o: { en: ["Major", "Minor", "Atonal"], ja: ["メジャー", "マイナー", "無調"], th: ["เมเจอร์", "ไมเนอร์", "ไม่มีคีย์"] }, a: 1 },
      { q: { en: "When does harmonic mixing matter most?", ja: "ハーモニックミックスが最も重要なのは？", th: "ฮาร์โมนิกมิกซ์สำคัญที่สุดเมื่อไร" },
        o: { en: ["Long overlaps of melodic parts", "Quick cuts on drums", "Never"], ja: ["メロディが長く重なる時", "ドラムでの素早いカット", "重要ではない"], th: ["เมโลดี้ซ้อนกันนาน", "ตัดเร็วตอนมีแต่กลอง", "ไม่สำคัญเลย"] }, a: 0 },
    ],
  },
  {
    minutes: 10,
    body: {
      en: "Most club tracks follow a recognisable structure: intro (DJ-friendly drums, 16–32 bars), build/groove, breakdown (drums drop out, melody or vocal comes forward), build-up (tension, often with a riser or snare roll), drop/main section, and outro (elements removed, back to drums). Radio edits skip the long intro and outro and are harder to mix.\n\nKnowing the structure tells you where to mix in and out: overlap intros with outros for smooth blends, and avoid having two breakdowns or two vocals at the same time. Before a gig, listen through new tracks and set hot cues at the key structure points: first kick, breakdown, drop, outro.",
      ja: "多くのクラブトラックは分かりやすい構成になっています：イントロ（DJがつなぎやすいドラム、16〜32小節）、ビルド/グルーヴ、ブレイクダウン（ドラムが抜けてメロディやボーカルが前に出る）、ビルドアップ（ライザーやスネアロールで緊張感）、ドロップ/メイン、アウトロ（音が減ってドラムに戻る）。ラジオエディットは長いイントロ/アウトロが省かれていて、つなぎにくくなります。\n\n構成が分かれば、どこで入れてどこで抜くかが分かります。スムーズにつなぐならイントロとアウトロを重ね、ブレイクダウン同士やボーカル同士が同時にならないようにします。本番前に新しい曲を通して聴き、最初のキック、ブレイクダウン、ドロップ、アウトロなど重要な位置にホットキューを設定しておきましょう。",
      th: "เพลงคลับส่วนใหญ่มีโครงสร้างที่จำได้: อินโทร (กลองที่ดีเจมิกซ์ง่าย 16–32 ห้อง) บิลด์/กรูฟ เบรกดาวน์ (กลองหายไป เมโลดี้หรือเสียงร้องเด่นขึ้น) บิลด์อัป (สร้างความตึง มักมีไรเซอร์หรือสแนร์โรล) ดร็อป/ช่วงหลัก และเอาท์โทร (ลดองค์ประกอบกลับเหลือกลอง) เวอร์ชันวิทยุตัดอินโทรและเอาท์โทรยาวออก จึงมิกซ์ยากกว่า\n\nการรู้โครงสร้างบอกว่าควรมิกซ์เข้าและออกตรงไหน ซ้อนอินโทรกับเอาท์โทรเพื่อการผสมที่นุ่ม และหลีกเลี่ยงเบรกดาวน์หรือเสียงร้องสองเพลงพร้อมกัน ก่อนขึ้นเล่นให้ฟังเพลงใหม่ตลอดเพลงและตั้งฮอตคิวที่จุดสำคัญ: คิกแรก เบรกดาวน์ ดร็อป เอาท์โทร",
    },
    points: {
      en: ["Intro → groove → breakdown → build-up → drop → outro", "Overlap intros with outros", "Avoid two breakdowns or two vocals at once", "Hot-cue the structure before the gig"],
      ja: ["イントロ→グルーヴ→ブレイクダウン→ビルドアップ→ドロップ→アウトロ", "イントロとアウトロを重ねる", "ブレイクダウン同士・ボーカル同士を重ねない", "本番前に構成の要所へホットキュー"],
      th: ["อินโทร → กรูฟ → เบรกดาวน์ → บิลด์อัป → ดร็อป → เอาท์โทร", "ซ้อนอินโทรกับเอาท์โทร", "อย่าให้เบรกดาวน์หรือเสียงร้องสองเพลงพร้อมกัน", "ตั้งฮอตคิวตามโครงสร้างก่อนเล่น"],
    },
    practice: {
      en: "Map the structure of five tracks (bar numbers for each section). Compare: which have the longest DJ-friendly intro, and which would be hard to mix?",
      ja: "5曲の構成を書き出します（各セクションの小節番号）。DJがつなぎやすいイントロが一番長いのはどれか、つなぎにくいのはどれか比べましょう。",
      th: "เขียนโครงสร้างของ 5 เพลง (เลขห้องของแต่ละช่วง) เปรียบเทียบว่าเพลงไหนมีอินโทรที่มิกซ์ง่ายยาวที่สุด และเพลงไหนมิกซ์ยาก",
    },
    quiz: [
      { q: { en: "Where do drums usually drop out?", ja: "ドラムが抜けることが多いのは？", th: "กลองมักหายไปช่วงไหน" }, o: { en: ["Intro", "Breakdown", "Outro"], ja: ["イントロ", "ブレイクダウン", "アウトロ"], th: ["อินโทร", "เบรกดาวน์", "เอาท์โทร"] }, a: 1 },
      { q: { en: "Why are radio edits harder to mix?", ja: "ラジオエディットがつなぎにくい理由は？", th: "ทำไมเวอร์ชันวิทยุมิกซ์ยากกว่า" }, o: { en: ["No long intro/outro", "Wrong BPM", "Too quiet"], ja: ["長いイントロ/アウトロがない", "BPMが違う", "音が小さい"], th: ["ไม่มีอินโทร/เอาท์โทรยาว", "BPM ผิด", "เสียงเบาเกินไป"] }, a: 0 },
      { q: { en: "For a smooth blend, overlap…", ja: "スムーズにつなぐには何を重ねる？", th: "เพื่อการผสมที่นุ่ม ควรซ้อน…" }, o: { en: ["Two breakdowns", "Outro with intro", "Two vocals"], ja: ["ブレイクダウン同士", "アウトロとイントロ", "ボーカル同士"], th: ["เบรกดาวน์สองเพลง", "เอาท์โทรกับอินโทร", "เสียงร้องสองเพลง"] }, a: 1 },
    ],
  },
  {
    minutes: 10,
    body: {
      en: "Energy is how intense a track feels: tempo, density, brightness, how hard the drums hit. A good set is not a straight line up. It moves in waves: build, release, hold, lift again. A typical club night shape is opening → groove → build → peak → recovery → closing, but your slot changes it: the warm-up DJ should rarely reach peak energy, and the closing DJ brings people down gently.\n\nRate your tracks' energy (1–10) as you prepare. Mix Lab's loudness and band-energy curves show how energy actually moved in your recorded sets, and Set Builder compares your planned energy with a target shape for your slot.",
      ja: "エネルギーとは曲の強さの感じ方です。テンポ、音の密度、明るさ、ドラムの強さなどで決まります。良いセットは右肩上がりの直線ではありません。上げる、解放する、保つ、また上げる、と波のように動きます。クラブの夜の典型的な形はオープニング→グルーヴ→ビルド→ピーク→リカバリー→クロージングですが、出演枠によって変わります。ウォームアップDJがピークまで上げることはほとんどなく、クロージングDJはゆっくり落ち着かせます。\n\n準備の段階で曲のエネルギーを1〜10で評価しておきましょう。Mix Labの音量カーブや帯域エネルギーのカーブで、録音したセットのエネルギーが実際にどう動いたかを確認でき、Set Builderでは計画したエネルギーと出演枠に合った目標の形を比べられます。",
      th: "พลังงานคือความเข้มข้นที่รู้สึกได้จากเพลง ทั้งความเร็ว ความหนาแน่น ความสว่าง และความหนักของกลอง เซ็ตที่ดีไม่ใช่เส้นตรงที่ไต่ขึ้นอย่างเดียว แต่เคลื่อนเป็นคลื่น: สร้าง ปล่อย คงไว้ แล้วยกขึ้นอีก รูปแบบทั่วไปของคืนในคลับคือ เปิด → กรูฟ → บิลด์ → พีค → ฟื้นตัว → ปิด แต่ช่วงเวลาที่คุณเล่นทำให้ต่างไป ดีเจวอร์มอัปแทบไม่ควรถึงพีค ดีเจปิดพาคนลงอย่างนุ่มนวล\n\nให้คะแนนพลังงานของเพลง (1–10) ตอนเตรียมตัว เส้นความดังและพลังงานแต่ละย่านใน Mix Lab แสดงว่าพลังงานในเซ็ตที่อัดไว้เคลื่อนไหวจริงอย่างไร และ Set Builder เปรียบเทียบพลังงานที่วางแผนกับรูปทรงเป้าหมายสำหรับช่วงเวลาของคุณ",
    },
    points: {
      en: ["Energy = tempo, density, brightness, drum intensity", "Sets move in waves, not a straight line", "Your slot (warm-up, peak, closing) defines the shape", "Rate tracks 1–10 and compare plan vs. reality"],
      ja: ["エネルギー＝テンポ、密度、明るさ、ドラムの強さ", "セットは直線ではなく波で動く", "出演枠（ウォームアップ・ピーク・クロージング）で形が決まる", "曲を1〜10で評価し、計画と実際を比べる"],
      th: ["พลังงาน = ความเร็ว ความหนาแน่น ความสว่าง ความหนักของกลอง", "เซ็ตเคลื่อนเป็นคลื่น ไม่ใช่เส้นตรง", "ช่วงเวลาที่เล่น (วอร์มอัป พีค ปิด) กำหนดรูปทรง", "ให้คะแนนเพลง 1–10 แล้วเทียบแผนกับของจริง"],
    },
    practice: {
      en: "Plan a 60-minute warm-up set in Set Builder with energy ratings, keeping it below peak. Record it, analyse it in Mix Lab, and compare the loudness curve with your plan.",
      ja: "Set Builderでエネルギー評価付きの60分ウォームアップセットを、ピーク未満に収めて計画します。録音してMix Labで解析し、音量カーブと計画を比べましょう。",
      th: "วางแผนเซ็ตวอร์มอัป 60 นาทีใน Set Builder พร้อมคะแนนพลังงาน โดยไม่ให้ถึงพีค อัดเสียง วิเคราะห์ใน Mix Lab แล้วเทียบเส้นความดังกับแผน",
    },
    quiz: [
      { q: { en: "A good set's energy usually…", ja: "良いセットのエネルギーは通常…", th: "พลังงานของเซ็ตที่ดีมัก…" }, o: { en: ["Rises in a straight line", "Moves in waves", "Stays flat"], ja: ["直線的に上がる", "波のように動く", "一定のまま"], th: ["ขึ้นเป็นเส้นตรง", "เคลื่อนเป็นคลื่น", "คงที่"] }, a: 1 },
      { q: { en: "The warm-up DJ should…", ja: "ウォームアップDJは…", th: "ดีเจวอร์มอัปควร…" }, o: { en: ["Reach peak energy fast", "Rarely reach peak energy", "Play the headliner's tracks"], ja: ["すぐにピークまで上げる", "ピークまで上げることはほとんどない", "ヘッドライナーの曲をかける"], th: ["ขึ้นถึงพีคเร็ว ๆ", "แทบไม่ถึงพีค", "เปิดเพลงของเฮดไลเนอร์"] }, a: 1 },
      { q: { en: "Which is NOT an energy factor?", ja: "エネルギーの要素でないのは？", th: "ข้อใดไม่ใช่ปัจจัยของพลังงาน" }, o: { en: ["Tempo", "Drum intensity", "File name"], ja: ["テンポ", "ドラムの強さ", "ファイル名"], th: ["ความเร็ว", "ความหนักของกลอง", "ชื่อไฟล์"] }, a: 2 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "Genres have their own tempos, structures and expectations. House (≈120–128) is groove- and vocal-friendly; tech house (≈124–130) is tighter and more percussive; techno (≈128–140+) is hypnotic and long-form; melodic techno focuses on emotional synth lines and long breakdowns; afro house mixes organic percussion with deep grooves; hip hop and R&B (≈85–105) are mixed with shorter blends, cuts and well-known vocal hooks; EDM is built around big drops.\n\nMixing across genres works best through shared elements: tempo (or half/double tempo), similar percussion, or a matching key. Know the expectations of the room — a hip hop crowd expects recognisable songs quickly; a techno crowd expects long blends and patience.",
      ja: "ジャンルごとにテンポ、構成、期待されることが違います。ハウス（約120〜128）はグルーヴとボーカルに向き、テックハウス（約124〜130）はタイトでパーカッシブ、テクノ（約128〜140以上）は催眠的で長い展開、メロディックテクノはエモーショナルなシンセと長いブレイクダウン、アフロハウスは生楽器的なパーカッションと深いグルーヴ。ヒップホップやR&B（約85〜105）は短いブレンドやカット、有名なボーカルフックでつなぎ、EDMは大きなドロップが中心です。\n\nジャンルをまたぐミックスは、共通要素を通すとうまくいきます。テンポ（または半分/倍）、似たパーカッション、合うキーなどです。会場の期待も知っておきましょう。ヒップホップの客は聞き覚えのある曲を早く求め、テクノの客は長いブレンドと我慢を楽しみます。",
      th: "แต่ละแนวเพลงมีความเร็ว โครงสร้าง และความคาดหวังของตัวเอง เฮาส์ (≈120–128) เน้นกรูฟและเสียงร้อง เทคเฮาส์ (≈124–130) แน่นและเน้นเพอร์คัชชัน เทคโน (≈128–140+) สะกดจิตและยาว เมโลดิกเทคโนเน้นซินธ์ที่สื่ออารมณ์และเบรกดาวน์ยาว แอฟโฟรเฮาส์ผสมเพอร์คัชชันแบบออร์แกนิกกับกรูฟลึก ฮิปฮอปและอาร์แอนด์บี (≈85–105) มิกซ์ด้วยการผสมสั้น การตัด และท่อนฮุกที่คนรู้จัก EDM สร้างรอบดร็อปใหญ่ ๆ\n\nการมิกซ์ข้ามแนวได้ผลดีที่สุดผ่านองค์ประกอบร่วม: ความเร็ว (หรือครึ่ง/สองเท่า) เพอร์คัชชันคล้ายกัน หรือคีย์ที่เข้ากัน รู้ความคาดหวังของห้อง ผู้ชมฮิปฮอปอยากได้เพลงที่คุ้นเร็ว ๆ ผู้ชมเทคโนรอได้และชอบการผสมยาว",
    },
    points: {
      en: ["Each genre has typical tempo and mixing style", "Cross genres via shared tempo, percussion or key", "Half/double tempo connects e.g. 87 ↔ 174", "Match the room's expectations"],
      ja: ["ジャンルごとに典型的なテンポとミックスの仕方がある", "共通のテンポ・パーカッション・キーでジャンルをまたぐ", "半分/倍のテンポでつながる（例：87↔174）", "会場の期待に合わせる"],
      th: ["แต่ละแนวมีความเร็วและสไตล์มิกซ์ปกติ", "ข้ามแนวผ่านความเร็ว เพอร์คัชชัน หรือคีย์ที่ร่วมกัน", "ครึ่ง/สองเท่าเชื่อมกันได้ เช่น 87 ↔ 174", "ตอบความคาดหวังของห้อง"],
    },
    practice: {
      en: "Make a 20-minute mix that moves between two genres you like (for example house → afro house, or R&B → hip hop). Note which shared element you used for each genre change.",
      ja: "好きな2つのジャンルを行き来する20分のミックスを作ります（例：ハウス→アフロハウス、R&B→ヒップホップ）。ジャンルが変わるたびに、どの共通要素を使ったかメモしましょう。",
      th: "ทำมิกซ์ 20 นาทีที่เคลื่อนระหว่างสองแนวที่ชอบ (เช่น เฮาส์ → แอฟโฟรเฮาส์ หรือ อาร์แอนด์บี → ฮิปฮอป) จดว่าใช้องค์ประกอบร่วมอะไรในการเปลี่ยนแนวแต่ละครั้ง",
    },
    quiz: [
      { q: { en: "Typical techno tempo?", ja: "テクノの典型的なテンポは？", th: "ความเร็วปกติของเทคโน" }, o: { en: ["85–100", "128–140+", "170–175"], ja: ["85〜100", "128〜140以上", "170〜175"], th: ["85–100", "128–140+", "170–175"] }, a: 1 },
      { q: { en: "A hip hop crowd usually expects…", ja: "ヒップホップの客が通常期待するのは…", th: "ผู้ชมฮิปฮอปมักคาดหวัง…" }, o: { en: ["Recognisable songs quickly", "20-minute blends", "No vocals"], ja: ["聞き覚えのある曲を早く", "20分のブレンド", "ボーカルなし"], th: ["เพลงที่คุ้นเคยเร็ว ๆ", "การผสม 20 นาที", "ไม่มีเสียงร้อง"] }, a: 0 },
      { q: { en: "Which helps you mix across genres?", ja: "ジャンルをまたぐミックスに役立つのは？", th: "อะไรช่วยให้มิกซ์ข้ามแนวได้" }, o: { en: ["Shared tempo or percussion", "Random selection", "Louder volume"], ja: ["共通のテンポやパーカッション", "ランダムな選曲", "大きな音量"], th: ["ความเร็วหรือเพอร์คัชชันร่วมกัน", "เลือกแบบสุ่ม", "เปิดดังขึ้น"] }, a: 0 },
    ],
  },
  {
    minutes: 8,
    body: {
      en: "Your library is your instrument. Organise it so you can find the right track in seconds: playlists by energy or role (openers, groovers, peak, closers, tools), by genre, and by gig. Tag tracks with comments (vocal/instrumental, mood) and energy ratings. Delete or archive tracks you would never play.\n\nPrepare for each gig with a focused playlist of roughly 2–3× more music than your set length, so you can react to the room. Always check analysis (BPM, beatgrid, key) on new tracks, set hot cues, and back up your USB library on a second stick. You can import your rekordbox library XML into Set Builder to plan sets from music you actually own.",
      ja: "ライブラリはDJにとっての楽器です。数秒で目的の曲を見つけられるよう整理しましょう。エネルギーや役割別（オープナー、グルーヴ、ピーク、クローザー、ツール）、ジャンル別、出演ごとのプレイリストを作り、コメント（ボーカル/インスト、ムード）やエネルギー評価でタグ付けします。絶対にかけない曲は削除かアーカイブしましょう。\n\n出演ごとに、セットの長さの2〜3倍程度の曲を絞り込んだプレイリストを用意し、フロアに合わせて対応できるようにします。新しい曲は必ず解析（BPM、ビートグリッド、キー）を確認し、ホットキューを設定し、USBのライブラリは2本目にバックアップしましょう。rekordboxのライブラリXMLをSet Builderに取り込めば、実際に持っている曲でセットを計画できます。",
      th: "คลังเพลงคือเครื่องดนตรีของคุณ จัดให้หาเพลงที่ใช่ได้ในไม่กี่วินาที: เพลย์ลิสต์ตามพลังงานหรือบทบาท (เปิด กรูฟ พีค ปิด ทูล) ตามแนว และตามงาน แท็กเพลงด้วยคอมเมนต์ (มีเสียงร้อง/บรรเลง อารมณ์) และคะแนนพลังงาน ลบหรือเก็บเพลงที่ไม่มีวันเปิด\n\nเตรียมเพลย์ลิสต์เฉพาะสำหรับแต่ละงาน ประมาณ 2–3 เท่าของความยาวเซ็ต เพื่อปรับตามห้องได้ ตรวจผลวิเคราะห์ (BPM บีตกริด คีย์) ของเพลงใหม่เสมอ ตั้งฮอตคิว และสำรองคลังเพลงใน USB อีกอัน คุณนำเข้าไฟล์ XML คลังเพลง rekordbox ไปที่ Set Builder เพื่อวางแผนเซ็ตจากเพลงที่มีจริงได้",
    },
    points: {
      en: ["Organise by role/energy, genre and gig", "Tag energy and comments", "Gig playlist ≈ 2–3× the set length", "Check analysis, set cues, back up your USB"],
      ja: ["役割/エネルギー、ジャンル、出演別に整理", "エネルギーとコメントでタグ付け", "出演用プレイリストはセットの2〜3倍", "解析を確認、キューを設定、USBをバックアップ"],
      th: ["จัดตามบทบาท/พลังงาน แนว และงาน", "แท็กพลังงานและคอมเมนต์", "เพลย์ลิสต์งาน ≈ 2–3 เท่าของเซ็ต", "ตรวจผลวิเคราะห์ ตั้งคิว สำรอง USB"],
    },
    practice: {
      en: "Create five role playlists (openers, groovers, peak, closers, tools) with at least eight tracks each. Export your rekordbox collection XML and import it into Set Builder.",
      ja: "役割別プレイリストを5つ（オープナー、グルーヴ、ピーク、クローザー、ツール）、それぞれ8曲以上で作ります。rekordboxのコレクションXMLを書き出し、Set Builderに取り込みましょう。",
      th: "สร้างเพลย์ลิสต์ตามบทบาท 5 อัน (เปิด กรูฟ พีค ปิด ทูล) อย่างน้อยอันละ 8 เพลง ส่งออก XML คอลเลกชัน rekordbox แล้วนำเข้า Set Builder",
    },
    quiz: [
      { q: { en: "How much music should a gig playlist hold?", ja: "出演用プレイリストの曲の量は？", th: "เพลย์ลิสต์สำหรับงานควรมีเพลงเท่าไร" }, o: { en: ["Exactly the set length", "About 2–3× the set length", "Your whole library"], ja: ["セットの長さちょうど", "セットの約2〜3倍", "ライブラリ全部"], th: ["เท่ากับความยาวเซ็ตพอดี", "ราว 2–3 เท่าของเซ็ต", "คลังเพลงทั้งหมด"] }, a: 1 },
      { q: { en: "Why keep a second USB?", ja: "USBを2本用意する理由は？", th: "ทำไมต้องมี USB สำรอง" }, o: { en: ["Backup if one fails", "To play two sets at once", "It's louder"], ja: ["1本が壊れた時のバックアップ", "2つのセットを同時にかけるため", "音が大きくなる"], th: ["สำรองเผื่ออันหนึ่งเสีย", "เพื่อเล่นสองเซ็ตพร้อมกัน", "เสียงดังกว่า"] }, a: 0 },
      { q: { en: "What should you check on new tracks?", ja: "新しい曲で確認すべきことは？", th: "ควรตรวจอะไรในเพลงใหม่" }, o: { en: ["BPM, beatgrid and key", "Only the artwork", "Nothing"], ja: ["BPM、ビートグリッド、キー", "ジャケットだけ", "何もない"], th: ["BPM บีตกริด และคีย์", "แค่ปก", "ไม่ต้องตรวจ"] }, a: 0 },
    ],
  },
  {
    minutes: 12,
    body: {
      en: "Set construction brings selection and technique together for a specific gig. Start from the context: venue size, time slot, who plays before and after you, the crowd, and your set length. Decide the energy shape first, then pick anchor tracks (the moments you know you want), then fill the journey between them with compatible tempo and key moves.\n\nPlan, but don't script: prepare a route with alternatives at each stage so you can respond to the room. After the gig, write down what worked, what emptied the floor and why. Over time these notes, your Mix Lab analyses and your instructor's feedback become the most valuable training data you have.",
      ja: "セット構成とは、特定の出演に向けて選曲と技術をまとめることです。まず状況から考えます。会場の規模、時間帯、前後のDJ、客層、セットの長さ。最初にエネルギーの形を決め、次にアンカーとなる曲（ここでかけたいと決めている瞬間）を選び、その間をテンポとキーの相性が良い流れで埋めていきます。\n\n計画はしても台本にはしないこと。各段階に代わりの選択肢を用意しておき、フロアの反応に合わせて動けるようにします。出演後は、うまくいったこと、フロアが空いたこととその理由を書き残しましょう。こうしたメモ、Mix Labの解析、講師のフィードバックが、時間とともに最も価値のある成長の記録になります。",
      th: "การวางโครงเซ็ตคือการนำการเลือกเพลงและเทคนิคมารวมกันสำหรับงานหนึ่ง ๆ เริ่มจากบริบท: ขนาดสถานที่ ช่วงเวลา ใครเล่นก่อนและหลังคุณ ผู้ชม และความยาวเซ็ต กำหนดรูปทรงพลังงานก่อน แล้วเลือกเพลงหลัก (ช่วงที่รู้ว่าอยากเปิด) จากนั้นเติมเส้นทางระหว่างนั้นด้วยการเปลี่ยนความเร็วและคีย์ที่เข้ากัน\n\nวางแผนแต่อย่าเขียนบท เตรียมเส้นทางพร้อมทางเลือกในแต่ละช่วงเพื่อตอบสนองต่อห้อง หลังเล่นจบ จดสิ่งที่ได้ผล สิ่งที่ทำให้ฟลอร์ว่าง และเหตุผล เมื่อเวลาผ่านไป บันทึกเหล่านี้ ผลวิเคราะห์ Mix Lab และฟีดแบ็กจากผู้สอนจะกลายเป็นข้อมูลการพัฒนาที่มีค่าที่สุดของคุณ",
    },
    points: {
      en: ["Start from context: venue, slot, crowd, length", "Energy shape → anchor tracks → fill the journey", "Plan alternatives; don't script", "Write notes after every gig"],
      ja: ["状況から考える：会場、時間帯、客層、長さ", "エネルギーの形→アンカー曲→流れを埋める", "代わりの選択肢を用意し、台本にしない", "出演後は毎回メモを残す"],
      th: ["เริ่มจากบริบท: สถานที่ ช่วงเวลา ผู้ชม ความยาว", "รูปทรงพลังงาน → เพลงหลัก → เติมเส้นทาง", "เตรียมทางเลือก อย่าเขียนบท", "จดบันทึกหลังทุกงาน"],
    },
    practice: {
      en: "Build a complete 90-minute set plan in Set Builder for a specific imagined gig (venue, slot, crowd). Include at least two alternative tracks per stage. Discuss the plan with the AI Coach or your instructor.",
      ja: "具体的な出演（会場、時間帯、客層）を想定し、Set Builderで90分のセットプランを完成させます。各段階に代わりの曲を2曲以上用意し、AIコーチか講師とプランについて話し合いましょう。",
      th: "สร้างแผนเซ็ต 90 นาทีที่สมบูรณ์ใน Set Builder สำหรับงานสมมติที่ชัดเจน (สถานที่ ช่วงเวลา ผู้ชม) มีเพลงทางเลือกอย่างน้อย 2 เพลงต่อช่วง แล้วคุยเรื่องแผนกับ AI Coach หรือผู้สอน",
    },
    quiz: [
      { q: { en: "What should you decide first when building a set?", ja: "セットを組む時に最初に決めるのは？", th: "สิ่งแรกที่ควรตัดสินใจเมื่อวางเซ็ต" }, o: { en: ["The energy shape for the context", "The last track", "The fonts on your flyer"], ja: ["状況に合ったエネルギーの形", "最後の曲", "フライヤーのフォント"], th: ["รูปทรงพลังงานตามบริบท", "เพลงสุดท้าย", "ฟอนต์บนใบปลิว"] }, a: 0 },
      { q: { en: "Why prepare alternatives?", ja: "代わりの選択肢を用意する理由は？", th: "ทำไมต้องเตรียมทางเลือก" }, o: { en: ["To respond to the room", "To play longer", "It's required by clubs"], ja: ["フロアの反応に対応するため", "長くプレイするため", "クラブの決まりだから"], th: ["เพื่อตอบสนองต่อห้อง", "เพื่อเล่นได้นานขึ้น", "คลับบังคับ"] }, a: 0 },
      { q: { en: "Anchor tracks are…", ja: "アンカー曲とは…", th: "เพลงหลัก (anchor) คือ…" }, o: { en: ["Moments you know you want to play", "Tracks with an anchor on the cover", "Always the loudest tracks"], ja: ["かけたいと決めている瞬間の曲", "ジャケットにいかりが描かれた曲", "常に一番音の大きい曲"], th: ["ช่วงที่รู้ว่าอยากเปิด", "เพลงที่มีรูปสมอบนปก", "เพลงที่ดังที่สุดเสมอ"] }, a: 0 },
    ],
  },
];
