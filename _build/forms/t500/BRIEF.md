# BRIEF — Nhóm "Giải nghĩa forms" (T500–T509) cho tools.kenlamrealty.com

Khách: người Việt ở Santa Clara County (San Jose…), nhiều người mới mua nhà lần đầu, đọc tiếng Anh yếu. Ken Lam, Broker Associate, BRG Realty Corp, DRE #01401822, 23 năm nghề.
Mục tiêu: MỖI form một trang riêng (không gộp), giải thích chính xác, rõ, dễ hiểu nhất (/ELI10: đủ dễ cho đứa nhỏ 10 tuổi, ví dụ đời thường), và có phần tương tác để người ta tự hiểu form nói gì với HỌ.

## Bảng tool
| Mã | Form (file .md trong /home/claude/forms/md/) | Tên VN | Tên EN |
|---|---|---|---|
| T500 | SXA_Sellers_Intent_to_Exchange_Addendum.md | SXA: người bán muốn đổi nhà 1031 | SXA: Seller's Intent to Exchange |
| T501 | VLPA_Vacant_Land_Purchase_Agreement...md | VLPA: hợp đồng mua đất trống | VLPA: Vacant land purchase agreement |
| T502 | 1___Residential_Environmental_Hazards...md | Cẩm nang độc hại môi trường trong nhà | Residential Environmental Hazards booklet |
| T503 | 2___Protect_your_Family_from_Lead...md | Sách chì trong nhà (nhà trước 1978) | Protect Your Family From Lead |
| T504 | 3___Home_Energy_Rating_Pamphlet_1.md | Sách chấm điểm điện năng của nhà | Home Energy Rating pamphlet |
| T505 | 4___Homeowners_Guide_to_Earthquake_Safety_pamphlet_1.md | Sách an toàn động đất cho chủ nhà | Homeowner's Guide to Earthquake Safety |
| T506 | 5___Homeowners_Guide_to_Earthquake_Safety_form_1.md | Tờ khai rủi ro động đất của nhà | Residential Earthquake Risk Disclosure Statement |
| T507 | 6___Homeowners_Guide_Signature_Page_1 (md bị lỗi font → đọc PDF gốc bằng Read, 1 trang) | Trang ký nhận sách động đất & môi trường | Booklet receipt / signature page |
| T508 | CDPH_Mold_Booklet...md (ít chữ → xem PDF gốc nếu cần) | Sách mold (nấm mốc) cho người thuê nhà | CDPH Dampness & Mold booklet |
| T509 | SB_800_Civil_Code...md | SB 800: luật lỗi xây dựng nhà mới | SB 800: construction defect law |

PDF gốc: /mnt/user-data/attachments/e61534ef-077e-52a4-bb53-84fb3cd886db/*.pdf (đọc bằng Read với pages khi md thiếu/lỗi).

## Mỗi tool phải có (thứ tự trên trang)
1. Tiêu đề + 1 câu: "Form này là gì" bằng lời thường.
2. Thẻ nhanh: Ai đưa / ai ký / khi nào gặp / bắt buộc không / số trang.
3. "Form này nói gì" — đi từng phần của form (đoạn, mục) theo đúng thứ tự form, mỗi phần 1–3 câu dễ hiểu + ví dụ đời thường. Chính xác theo văn bản; không bịa. Form C.A.R. (SXA, VLPA) có bản quyền: diễn giải bằng lời mình, KHÔNG chép nguyên văn quá 1 câu ngắn.
4. Phần tương tác (bắt buộc, chọn cái hợp form): vd "Bạn là ai?" (buyer/seller/tenant/landlord) + vài câu hỏi (năm xây, có con nhỏ, nhà trên đồi…) → ra ngay "Form này nghĩa là gì với bạn" + việc cần làm. VLPA/SB 800: máy tính mốc ngày (nhập ngày chấp nhận offer / ngày close → ra deadline theo mặc định của form/luật). Earthquake form: tự trả lời checklist → ra mức rủi ro + chỗ cần sửa. Có quiz 3 câu "Bạn hiểu đúng chưa?" ở cuối.
5. "Nhiều người hiểu sai" (2–4 ý) + "Bước tiếp theo".
6. Video: `<video src="guide.mp4" controls playsinline preload="metadata">` 9:16 (file sẽ có sau, để sẵn thẻ) + nút "Xem video 45 giây".
7. Nút: email mailto ken@kenlamrealty.com (subject có mã tool), sms:4086662825?&body=..., link về Thư viện forms /t402/.
8. Footer: nguồn (tên văn bản + link chính thức nếu có), "Không phải tư vấn luật/thuế", Ken Lam · BRG Realty Corp · DRE #01401822, "Updated: 06/11/2026".

## Kỹ thuật (bắt buộc)
- Template: copy CSS, nút đổi ngôn ngữ, i18n, khối nút, footer từ /home/claude/tools/t171/index.html (đọc nó trước). Một file index.html tự chứa trong /home/claude/tools/t50X/.
- Mặc định English + nút Tiếng Việt; lưu localStorage key `kl_lang` (bọc try/catch). Cả hai bản phải đủ nội dung (VI có dấu, tự nhiên).
- Số/ngày luật để trong 1 khối `const` đầu script, có comment nguồn.
- Phone first: không tràn ngang ở 375px. Dark mode theo template.
- Giọng /HUMAN: câu ngắn xen dài, lời nói thường, không sáo ngữ AI ("đào sâu", "giải pháp đột phá", "trong bối cảnh"…). Không quảng cáo Ken trong phần giải thích.
- Kiểm fact quan trọng bằng WebSearch (bản form mới nhất, luật có đổi trong 12 tháng qua không — vd C.A.R. sửa VLPA/SXA 12/2025?; EPA lead rule 2024–2026; Civil Code 1102.6c; Gov Code 8897; SB 800 thời hạn). Ghi vào /home/claude/forms/facts/T50X.md: fact | nguồn | ngày tra | VERIFIED/UNVERIFIED/ESTIMATE.

## Mỗi tool còn phải ra thêm (file riêng)
- /home/claude/forms/explain/T50X.md — bài giải thích đầy đủ bằng tiếng Việt có dấu (giống phần 3–5 trên trang), để Ken đọc trong chat và lưu Project.
- /home/claude/forms/video/T50X.json — kịch bản video 45 giây dọc: `{"code","title_vi","scenes":[{"sec":<số giây>,"big":"chữ to ≤6 từ","small":"1–2 câu ≤22 từ, tiếng Việt có dấu"}...]}` tổng sec = 45, 7–9 cảnh, cảnh 1 là hook (câu hỏi/khúc mắc thật), cảnh cuối "Xem đầy đủ: tools.kenlamrealty.com/t50X".
- /home/claude/forms/posts/T50X.md — (a) bài đăng group Facebook tiếng Việt /HUMAN, (b) caption ngắn reel, (c) KEN DUYỆT: điểm Ken cần kiểm.
- /home/claude/forms/cards/T50X.json — {"code","href":"/t50X/","vi","en","vi_desc","en_desc"} (desc ≤ 140 ký tự, kiểu "Nhập/Chọn … thấy …").

## Cấm
Không sửa /home/claude/tools/index.html, sitemap.xml, t402, không chạy git. Chỉ ghi vào thư mục t50X của mình và /home/claude/forms/{explain,video,posts,cards,facts}.

## Tự test
Playwright (đã cài, `require('playwright')`, chromium.launch()): mở file ở 375px và 1280px, EN và VI, không lỗi console, không tràn ngang (scrollWidth ≤ clientWidth), thử phần tương tác 3 bộ đáp án khác nhau, chụp 1 ảnh 375px VI và tự Read xem. Máy tính ngày: tính tay 1 ví dụ bằng Python và so.
Báo lại ngắn: mã, đã làm gì, fact nào UNVERIFIED, KEN DUYỆT quan trọng nhất.
