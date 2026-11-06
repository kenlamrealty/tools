# BRIEF — Nhóm "Giải nghĩa Forms" (T420–T439)

Ken Lam (Broker Associate, BRG Realty Corp, DRE #01401822, San Jose) muốn: mỗi form C.A.R. được giải thích RIÊNG, chính xác, dễ hiểu nhất (kiểu giải thích cho đứa nhỏ 10 tuổi, có ví dụ đời thường ở Bắc Cali), rồi mỗi form có 1 tool web + 1 video 45 giây. Không gộp form với nhau.

## Nguồn (bắt buộc đọc đủ)
Bản Markdown của form thật: `/home/claude/forms/md/<TÊN>.md`. Mọi điều anh viết về form PHẢI có trong form (số đoạn, số ngày mặc định, ai ký). Không bịa, không lấy từ trí nhớ. Ghi số phiên bản/ngày sửa form (vd "Revised 6/25") nếu có ở chân trang. Khi nói luật ngoài form (Civil Code…), chỉ nói nếu form tự trích dẫn; còn lại đánh dấu "(ngoài form)" và giữ ở mức chung.
Bản quyền: form © C.A.R. KHÔNG chép nguyên văn từng đoạn dài, không chụp hình form. Diễn giải bằng lời mình; trích tối đa vài chữ tiếng Anh then chốt (vd "Liquidated Damages") để khách nhận ra trên form.

## Bảng mã
| Mã | Form | Tên VN | Tên EN |
|---|---|---|---|
| T420 | ACS | Chia commission giữa 2 agent | Agent Commission Sharing Agreement explained |
| T421 | ARB | Thỏa thuận trọng tài (không ra tòa) | Arbitration Agreement explained |
| T422 | BBD | Thông báo rệp giường cho người thuê | Bed Bug Disclosure explained |
| T423 | BDS | Bản khai khi bán business | Business Disclosure Statement explained |
| T424 | BIRN | Thông báo kiểm tra lý lịch người thuê | Background Investigation Report Notice explained |
| T425 | BOS | Giấy bán đồ đạc (Bill of Sale) | Bill of Sale explained |
| T426 | BPA | Hợp đồng mua business | Business Purchase Agreement explained |
| T427 | BVLIA | Lưu ý khi mua đất trống | Vacant Land Inspection Advisory explained |
| T428 | BXA | Buyer làm 1031 exchange | Buyer's Intent to Exchange Addendum explained |
| T429 | CL | Hợp đồng thuê mặt bằng thương mại | Commercial Lease Agreement explained |
| T430 | CLA | Listing nhà thương mại & nhà cho thuê | Commercial & Income Listing Agreement explained |
| T431 | CLCA | Phụ lục CASp (người khuyết tật) khi thuê thương mại | Commercial Lease Accessibility (CASp) Addendum explained |
| T432 | CLR | Hủy hợp đồng thuê | Cancellation of Lease or Rental explained |
| T433 | CML-CNDA | Thỏa thuận bảo mật thương mại | Commercial Confidentiality & NDA explained |
| T434 | CML-EIA | Phụ lục vấn đề môi trường | Commercial Environmental Issues Addendum explained |
| T435 | CML-LEC | Chủ đất đồng ý kiểm tra môi trường | Landlord's Environmental Consent explained |
| T436 | CML-REL | Thỏa thuận buông khiếu nại thương mại | Commercial Release Agreement explained |
| T437 | CPA | Hợp đồng mua tài sản thương mại | Commercial Property Purchase Agreement explained |
| T438 | ITA | Thỏa thuận thông dịch viên | Interpreter/Translator Agreement explained |
| T439 | RIPA | Hợp đồng mua nhà cho thuê 2–4 căn | Residential Income Property Purchase Agreement explained |

## Mỗi form anh làm 5 file

### 1. `/home/claude/forms/explain/<FORM>.md` — bài giải thích cho Ken (tiếng Việt có dấu)
Cấu trúc cố định:
- `# <FORM> — <Tên EN> (<Tên VN>)` + dòng: số trang, phiên bản form, ai ký, nhóm.
- **Nói 1 câu:** form này là gì (ELI10).
- **Ví dụ đời thường:** 1 tình huống thật ở San Jose/Bắc Cali (tên chung chung, không tên khách thật).
- **Khi nào gặp / ai đưa / ai ký.**
- **Đọc từng đoạn:** theo đúng số đoạn của form (1, 2, 3… hoặc A, B, C), mỗi đoạn 1–3 câu dễ hiểu. Form dài (RIPA, CPA, BPA, CLA, CL): gom theo cụm đoạn nhưng giữ số đoạn, và nêu RÕ mọi con số mặc định (số ngày contingency, deposit, hạn chót, % …) đúng như form.
- **3 điều quan trọng nhất** cho người ký.
- **Nhiều người hiểu sai:** 2–3 điều.
- **Bước tiếp theo:** 2–3 việc nên làm.
- **Khác gì form gần giống** (vd RIPA vs RPA, CPA vs RPA) — chỉ khi có.
- Ghi chú: "Đây là giải thích để dễ hiểu, không phải tư vấn pháp lý. Đọc form chính thức và hỏi luật sư khi cần."

### 2. `/home/claude/tools/t4XX/index.html` — tool
- Template BẮT BUỘC: copy CSS, i18n, nút đổi ngôn ngữ, khung nút, footer từ `/home/claude/tools/t229/index.html` (đọc kỹ trước). Mặc định English + nút "Tiếng Việt" (localStorage key `kl_lang`, bọc try/catch). Mọi chữ có bản vi và en.
- Nội dung trang, theo thứ tự:
  1. Tiêu đề: "<FORM>: <tên dễ hiểu>" + 1 câu ELI10 + chip: số trang · ai ký · khi nào gặp.
  2. **"Form này nói gì với tôi?"** — 3–5 ô chọn/nhập (vd: Tôi là [buyer/seller/landlord/tenant/agent], tình huống, ngày ký/acceptance, số tiền…) → kết quả hiện NGAY (không cần nút): quyền của mình, nghĩa vụ của mình, tiền, các mốc ngày thật tính từ ngày nhập (chỉ dùng số ngày mặc định ghi trong form; nói rõ "nếu hợp đồng không sửa số ngày"). Số to, dễ đọc. Form có tiền (ACS chia %, CL tiền thuê/deposit, CLR tiền trả lại, CPA/RIPA/BPA deposit + hạn contingency, CLA commission) thì tính ra số. Form không có số (BBD, ITA, BIRN…) thì là bộ chọn tình huống → câu trả lời + checklist tick được.
  3. **"Đọc từng đoạn"** — accordion theo số đoạn, mỗi đoạn lời dễ hiểu (giống explain.md, bản ngắn).
  4. **"Nhiều người hiểu sai"** — 3 câu Đúng/Sai bấm để xem đáp án.
  5. **"Bước tiếp theo"** — 2–3 việc, có link tới tool liên quan có sẵn trong repo nếu đúng chủ đề (vd T401 RPA, T402 Thư viện Forms, T22x 1031, nhóm thuê nhà). Chỉ link tool có thật (`ls /home/claude/tools`).
  6. Video: `<video src="video.mp4" controls playsinline preload="metadata">` tiêu đề "Video 45 giây" (file sẽ được thêm sau; đừng tạo file video). Nút "Xem video 45 giây" → `/t4XX/video.mp4`.
  7. Nút: Email Ken (mailto:ken@kenlamrealty.com, subject có mã form, body có kết quả/số người dùng vừa nhập), Text Ken (`sms:4086662825?&body=...`), "Mọi form giải nghĩa" → `/t402/`.
  8. Footer: "Form gốc © California Association of REALTORS®. Trang này chỉ giải thích, không thay thế form và không phải tư vấn pháp lý/thuế." + nguồn (tên form + revised) + `Ken Lam · Broker Associate · DRE #01401822 · kenlamrealty.com` + `Updated: 06/11/2026`.
- Mọi con số/ngày mặc định để trong 1 khối `const` đầu script, có comment số đoạn form.
- `<title>` dạng `<FORM> Giải Nghĩa · Ken Lam Tools`, có meta description, og giống t229.
- Không thư viện ngoài, không gọi mạng. Mobile 375px không tràn ngang.

### 3. `/home/claude/forms/scripts/<FORM>.json` — kịch bản video 45 giây (tiếng Việt có dấu)
```json
{"code":"T4XX","form":"<FORM>","title":"<tên VN ngắn>","scenes":[
 {"secs":4,"kicker":"Form <FORM>","head":"<hook gây tò mò, ≤ 8 chữ>","body":""},
 {"secs":7,"kicker":"Nói 1 câu","head":"…","body":"… ≤ 22 chữ"},
 {"secs":6,"kicker":"Ai ký · Khi nào","head":"…","body":"…"},
 {"secs":7,"kicker":"Điều 1","head":"…","body":"…"},
 {"secs":7,"kicker":"Điều 2","head":"…","body":"…"},
 {"secs":7,"kicker":"Hay hiểu sai","head":"…","body":"…"},
 {"secs":7,"kicker":"Tool miễn phí","head":"kenlamrealty.com/tools","body":"Tìm T4XX · Hỏi Ken 408-666-2825"}]}
```
Tổng = 45 giây. head ≤ 8 chữ, body ≤ 22 chữ. Giọng người làm nghề 23 năm, không sáo ngữ AI.

### 4. `/home/claude/forms/posts/<FORM>.md`
(a) bài group Facebook "Địa Ốc Bắc Cali" tiếng Việt (giọng /HUMAN: câu ngắn xen câu dài, một bài học thật, một ý kiến sắc, một điều hay hiểu sai; link `https://tools.kenlamrealty.com/t4XX/`); (b) caption reel ≤ 150 chữ + 5 hashtag; (c) "KEN DUYỆT": chỗ nào anh không chắc / cần Ken xác nhận; (d) nhúng Squarespace: `<iframe src="https://tools.kenlamrealty.com/t4XX/" style="width:100%;height:1400px;border:0" loading="lazy"></iframe>`. Không bịa tên khách, không quảng cáo lố.

### 5. `/home/claude/forms/cards/<FORM>.json`
`{"code":"T4XX","form":"<FORM>","href":"/t4XX/","vi":"…","en":"…","vi_desc":"…","en_desc":"…"}` (desc ≤ 140 ký tự).

## Cấm
- Không sửa `/home/claude/tools/index.html`, `sitemap.xml`, `t402/`, tool của người khác, không chạy git.
- Không tạo video.

## Tự test (bắt buộc trước khi báo xong)
Playwright (đã cài sẵn, `require('playwright')`, `chromium.launch()`): mở `file:///home/claude/tools/t4XX/index.html` ở 375px và 1280px, cả EN và VI: không lỗi console, `document.documentElement.scrollWidth <= innerWidth`, VI không còn câu tiếng Anh sót (trừ tên form/thuật ngữ), thử 3 bộ số/tình huống ra kết quả đúng. Tool có toán: tính tay 1 ví dụ bằng Python và so với trang.
Báo lại ngắn: mã, form, các số mặc định quan trọng lấy từ form (kèm số đoạn), chỗ KEN DUYỆT.
