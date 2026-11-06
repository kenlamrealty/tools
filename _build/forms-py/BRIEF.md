# BRIEF — Nhóm "Giải nghĩa form" (T430–T444)

Ken Lam (Broker Associate, BRG Realty Corp, DRE #01401822, San Jose; khách người Việt ở Santa Clara County) muốn: mỗi form C.A.R. một trang giải thích riêng, rõ, chính xác, dễ hiểu nhất, lấy chính form làm hình minh họa và ví dụ; mỗi form một tool; mỗi form một video ~45 giây. Sau đó gom vào thư viện T402.

## Mã tool
| Mã | Form | Tên VN (gợi ý) | Tên EN |
|---|---|---|---|
| T430 | LL | Đọc hợp đồng nhờ agent cho thuê nhà (LL) | Lease Listing Agreement explained |
| T431 | LPD | Disclosure sơn chì nhà trước 1978 (LPD) | Lead-based paint disclosure explained |
| T432 | MARSMRN | Thư ngân hàng đồng ý short sale (MARS-MRN) | Offer of Mortgage Relief Notice explained |
| T433 | MARSSN | Thông báo khi nhờ agent lo short sale (MARS-SN) | Short Sale Negotiation Notice explained |
| T434 | MCA | Lưu ý thị trường khi làm offer (MCA) | Market Conditions Advisory explained |
| T435 | MCN | Thông báo nhà nhiễm meth (MCN) | Meth contamination notice explained |
| T436 | MHTDS | Disclosure mobile home (MHTDS) | Mobilehome TDS explained |
| T437 | NCPA | Hợp đồng mua nhà xây mới (NCPA) | New construction purchase agreement explained |
| T438 | NODPA | Hợp đồng mua nhà đang Notice of Default (NODPA) | Notice of Default purchase agreement explained |
| T439 | NTF | Phí chuyển nhượng riêng (NTF) | Private transfer fee notice explained |
| T440 | PMA | Hợp đồng quản lý nhà cho thuê (PMA) | Property Management Agreement explained |
| T441 | PRBS | Agent làm cho nhiều người mua/bán (PRBS) | PRBS disclosure & consent explained |
| T442 | PSD | Disclosure chỗ đậu xe và kho (PSD) | Parking & storage disclosure explained |
| T443 | PVOH | Lưu ý khi đi coi nhà, open house (PVOH) | Property visit & open house advisory explained |
| T444 | VRL | Hợp đồng giao agent cho thuê nhà nghỉ mát (VRL) | Vacation rental authorization explained |

## Nguồn (đã chuẩn bị, chỉ đọc)
- PDF sạch (địa chỉ đã đổi thành **1234 Example Lane, San Jose, CA 95100**): `/home/claude/forms/clean/<FORM>.pdf`
- Markdown (MarkItDown): `/home/claude/forms/md/<FORM>.md` — đọc cái này trước, đừng đọc PDF.
- Hình từng trang 110 dpi: `/home/claude/forms/pages/<FORM>/p-N.png`. Cần nét hơn: `pdftoppm -r 170 -f N -l N -png clean/<FORM>.pdf out`.
- KHÔNG dùng `/home/claude/forms/src/` (còn địa chỉ thật). Bất kỳ địa chỉ nào xuất hiện trong ví dụ, hình, video: chỉ dùng 1234 Example Lane, San Jose, CA 95100. Tên người ví dụ: tên giả rõ ràng, vd "Anh Tâm", "Chị Hoa", "Builder ABC Homes", "Công ty XYZ Property Management".

## Template bắt buộc
Copy nguyên khung, CSS, tooltip từ ngữ (TERMS + nút .t), lightbox, stepper từ **/home/claude/tools/t401/index.html** (tool "Đọc hợp đồng RPA từng bước"). Cùng phong cách, cùng font, cùng màu, dark mode như T401.
- Tiếng Việt có dấu (giống T401; nhóm này chỉ tiếng Việt). `<title>Tên · Ken Lam Tools</title>`, canonical `https://tools.kenlamrealty.com/t4XX/`.
- Eyebrow: "Ken Lam Library · Giải nghĩa form · <mã form>".
- Đầu trang: 1 đoạn "Form này là gì" 2–3 câu + khối "Giống như…" ví dụ đời thường (kiểu ELI10, đứa nhỏ 10 tuổi hiểu được) + 3 ô: Ai ký · Khi nào gặp · Điều quan trọng nhất.
- Khối "Thử với ví dụ của anh chị": 2–5 ô nhập riêng cho form đó (vd LPD: năm xây nhà + ngày ký → có cần LPD không, hạn 10 ngày kiểm tra chì; LL/PMA/VRL: tiền thuê + % → tiền công agent/thu nhập chủ; NODPA: ngày ký → hạn hủy 5 ngày làm việc; NTF: giá bán + % phí → phí bao nhiêu; PSD: kích thước xe vs chỗ đậu; PVOH/PRBS/MCN/MARS: tình huống chọn đáp án/checklist). Kết quả hiện ngay, số to. Mặc định có sẵn ví dụ, địa chỉ ví dụ 1234 Example Lane, San Jose, CA 95100.
- Stepper đi qua từng khúc form theo thứ tự của form: mỗi bước có hình crop thật từ form (s01.jpg, s02.jpg… JPEG q≈80, rộng ≤1400px, chỉ crop khúc liên quan, kèm khung/vạch vàng-đỏ đánh dấu chỗ cần coi nếu được), "ref" (Trang X · Đoạn Y), câu hỏi người đọc hay hỏi, các ý (pins) giải thích bằng lời thường, "Nói cho dễ hiểu", "Cẩn thận". Form 1 trang: 3–5 bước. Form dài (NCPA, NODPA, PMA, LL): 8–12 bước, chọn khúc quan trọng, không dịch cả form.
- Bước cuối: "Nhiều người hiểu sai" (2–3 ý) + "Bước tiếp theo" (link tool liên quan có sẵn trong /home/claude/tools, vd /t401/, /t402/, /t60/, /t151/; chỉ link tool có thật — kiểm `ls`).
- Video: `<video src="guide.mp4" controls playsinline preload="metadata" poster="poster.jpg">` trong 1 section "Video 45 giây" (file sẽ có sau, để sẵn thẻ).
- Nút: "Hỏi Ken" sms:4086662825?&body=<câu hỏi có mã form>, email mailto:ken@kenlamrealty.com?subject=..., link "Mọi form khác" → /t402/.
- Footer như T401: "Hình trích từ C.A.R. Form <MÃ> Revised <x/xx> (© 2026 California Association of REALTORS®) để giải thích. Trang này chỉ giải thích cho dễ hiểu, không thay form gốc, không phải tư vấn pháp lý hay thuế." + Ken Lam, Broker Associate · BRG Realty Corp · DRE #01401822 · ken@kenlamrealty.com · kenlamrealty.com · Cập nhật 06/11/2026. Ghi nguồn luật (link).
- Số/luật để trong 1 khối `const` đầu script.
- Giọng: người làm nghề 23 năm nói chuyện với khách, câu ngắn xen câu dài, không sáo ngữ AI ("đào sâu", "minh chứng", "giải pháp đột phá", "trong bối cảnh"...). Không bịa tên khách thật. Không quảng cáo lố. Thuật ngữ MLS/form giữ tiếng Anh, giải thích bằng tooltip.

## Chính xác là số 1
- Mọi điều luật, số ngày, số tiền phải khớp chữ trên form (md) hoặc nguồn luật chính thức. Tự tra luật bằng WebSearch/WebFetch cho từng form (Civil Code, Health & Safety Code, 42 USC 4852d / 24 CFR 35 / 40 CFR 745, Reg O 12 CFR 1015, CA Civil Code 1695 v.v. — tùy form), hỏi rõ có thay đổi 12 tháng qua không. leginfo hay bị chặn → Justia/law.cornell/public.law, ghi rõ.
- Ghi `/home/claude/forms/facts/<FORM>.md`: từng fact + link nguồn + ngày tra (06/11/2026); đánh dấu ESTIMATE (thực hành) và UNVERIFIED.
- Không chắc thì nói "hỏi agent/luật sư", đừng đoán.

## Mỗi form còn phải ra
1. `/home/claude/tools/t4XX/index.html` + hình s01.jpg… + `poster.jpg` (1080x1920, hình bìa video: tên form to + 1 crop).
2. `/home/claude/forms/video/<FORM>.json` — kịch bản video 45 giây, đúng schema:
```json
{"code":"LPD","tcode":"T431","title":"Form LPD là gì?","color":"#1f5a6b",
 "scenes":[
  {"dur":4,"kicker":"C.A.R. Form LPD","text":"Nhà xây trước 1978? Có tờ này.","sub":"Disclosure sơn chì","img":null},
  {"dur":6,"kicker":"Trang 1 · Đoạn 1","text":"Seller khai: biết gì về sơn chì","sub":"Có báo cáo gì phải đưa hết","img":"s02.jpg","focus":[0.0,0.1,1.0,0.5]},
  ...
  {"dur":5,"kicker":"Coi tool","text":"tools.kenlamrealty.com/t431","sub":"Ken Lam · 408-666-2825 · DRE #01401822","img":null}
 ]}
```
   Tổng dur = 45 (±1). 7–9 cảnh. Cảnh 1 là hook (câu hỏi/gây tò mò). `text` ≤ 12 chữ, `sub` ≤ 18 chữ, tiếng Việt có dấu. `img` = file trong /home/claude/tools/t4XX/; `focus` = [x,y,w,h] phần trăm (0–1) vùng hình cần zoom. Cảnh cuối CTA như trên.
3. `/home/claude/forms/posts/<FORM>.md`: (a) bài group Facebook "Địa Ốc Bắc Cali" 120–200 chữ, giọng thật, mở bằng chuyện/hiểu lầm hay gặp, kết bằng link tools.kenlamrealty.com/t4XX/ ; (b) caption reel ngắn + 3–5 hashtag; (c) KEN DUYỆT: những chỗ Ken nên kiểm/quyết; (d) nhúng Squarespace: `<iframe src="https://tools.kenlamrealty.com/t4XX/" style="width:100%;height:1400px;border:0" loading="lazy"></iframe>`.
4. `/home/claude/forms/cards/<FORM>.json`: {"code":"T4XX","href":"/t4XX/","form":"LPD","vi":"...","en":"...","vi_desc":"1 câu","en_desc":"1 sentence"}.

## Cấm
- Không sửa /home/claude/tools/index.html, sitemap.xml, t402, bất kỳ tool cũ nào; không chạy git.
- Không dùng địa chỉ thật nào ngoài 1234 Example Lane, San Jose, CA 95100.

## Tự test trước khi báo xong
Playwright (đã cài sẵn, `require('playwright')`, chromium.launch() không cần option): mở file:// ở 375px và 1280px: không lỗi console, không tràn ngang (document.scrollingElement.scrollWidth <= innerWidth), đi hết stepper, đổi 3 bộ số ở ô nhập ra kết quả đúng. Tool có toán: tính tay 1 ví dụ bằng Python và so. Chụp 1 screenshot 375px, Read để tự nhìn.

Báo lại (ngắn): mã đã xong, số bước mỗi tool, 3 fact luật quan trọng nhất có nguồn, mục KEN DUYỆT quan trọng, lỗi còn lại.
