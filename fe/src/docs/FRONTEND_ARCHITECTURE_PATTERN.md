# 🏛️ KIẾN TRÚC FRONTEND VÀ PATTERN CHUẨN (SOLARIS FRONTEND ARCHITECTURE)

Tài liệu này được biên soạn để chuẩn hóa toàn bộ quy trình thiết kế, xây dựng và tổ chức Component trong dự án SOLARIS theo các góp ý chuyên môn từ Giảng viên / Senior Architect.

---

## 📌 1. BẢNG ĐỐI SOÁT CÁC YÊU CẦU CỦA GIẢNG VIÊN

| # | Yêu cầu của Giảng viên | Giải pháp kỹ thuật được triển khai | Vị trí mã nguồn |
| :---: | :--- | :--- | :--- |
| **1** | **Build base ráp component từ nhỏ đến lớn** | Xây dựng bộ thư viện **Atomic Base Components** (`Button`, `Badge`, `Card`, `Input`, `Modal`) làm khối nguyên tử, sau đó ráp lại thành các Widget / Feature lớn. | `fe/src/components/base/` |
| **2** | **Tách ra hook state (ghi rõ ra có gì)** | Tách riêng Custom Hook (`useVoiceAssistantState.ts`), khai báo tường minh Interface State và Interface Actions trong file types. | `fe/src/components/voice/pattern/useVoiceAssistantState.ts` |
| **3** | **Tách riêng UI với hook** | Triển khai pattern **Headless UI / Container-Presenter**: File Presenter chỉ nhận props và vẽ UI; toàn bộ state, effect, API được giấu trong Hook. | `fe/src/components/voice/pattern/VoiceAssistantPresenter.tsx` |
| **4** | **Cách build component như nào** | Chuẩn hóa quy trình 4 bước xây dựng Component từ Types $\rightarrow$ Hook $\rightarrow$ Presenter $\rightarrow$ Container. | Xem mục 3 trong tài liệu này |
| **5** | **Thống nhất class dùng cho component** | Chuẩn hóa hệ thống Variant Class (`primary`, `secondary`, `danger`, `ghost`, `corona`) và Size Class (`sm`, `md`, `lg`). | `fe/src/components/base/Button.tsx`, `Badge.tsx` |
| **6** | **Thiết lập biến font, class để chung trong 1 css** | Khai báo toàn bộ **Design Tokens** (Font sans/mono, Color variables, Radius, Transitions) trong `:root` tại `index.css`. | `fe/src/index.css` |
| **7** | **Phải hiểu cơ chế và ràng buộc** | Định nghĩa chi tiết cơ chế Re-render, Data flow 1 chiều, Props immutability và bắt buộc gõ kiểu TypeScript. | Xem mục 4 trong tài liệu này |
| **8** | **Viết 1 pattern** | Đóng gói mẫu kiến trúc chuẩn tại thư mục `fe/src/components/voice/pattern/` để làm khuôn mẫu cho toàn dự án. | `fe/src/components/voice/pattern/` |

---

## 🧩 2. MÔ HÌNH XÂY DỰNG TỪ NHỎ ĐẾN LỚN (ATOMIC COMPONENT COMPOSITION)

```
[Level 1: Base Components]         Button, Badge, Input, Card, Modal
               ↓
[Level 2: Molecules & Visuals]    AudioWaveVisualizer, PreviewDrawer
               ↓
[Level 3: Feature Presenter]       VoiceAssistantPresenter
               ↓
[Level 4: Feature Container]       VoiceAssistantContainer (Gắn useVoiceAssistantState)
               ↓
[Level 5: App Integration]        MainLayout, KanbanBoard, Navigation
```

### Danh mục Base Components tại `fe/src/components/base/`:
- **`Button.tsx`**: Nút bấm hỗ trợ 5 variants (`primary`, `secondary`, `danger`, `ghost`, `corona`) và 3 sizes (`sm`, `md`, `lg`) với loading state spinner.
- **`Badge.tsx`**: Nhãn hiển thị trạng thái hỗ trợ chấm phát sáng (pulse dot) cho 5 mức độ (`info`, `success`, `warning`, `danger`, `neutral`).
- **`Card.tsx`**: Khung viền container thống nhất hỗ trợ hiệu ứng kính mờ (`glass`), bóng đổ (`elevated`), viền mỏng (`default`).
- **`Input.tsx`**: Ô nhập liệu chuẩn hóa về kích thước font, focus ring vàng amber, icon đính kèm và thông báo lỗi validation.
- **`Modal.tsx`**: Khung popup chuẩn hóa hiệu ứng backdrop blur, animation zoom-in, phím tắt `Escape` và khóa cuộn trang `overflow: hidden`.

---

## 📐 3. PATTERN MẪU 4-FILE ĐỂ BUILD BẤT KỲ COMPONENT NÀO

Khi xây dựng một tính năng mới (Feature Component), luôn tuân thủ cấu trúc 4 file:

```text
📁 components/<feature>/pattern/
  ├── <feature>.types.ts             👈 Bước 1: Ràng buộc kiểu dữ liệu & Contracts
  ├── use<Feature>State.ts           👈 Bước 2: Headless Logic Hook (State + Effects)
  ├── <Feature>Presenter.tsx         👈 Bước 3: Pure UI Component (Presenter)
  ├── <Feature>Container.tsx         👈 Bước 4: Container kết nối Hook & Presenter
  └── index.ts                       👈 Barrel file export
```

### Ví dụ thực tế: Module Voice Assistant
1. **`voiceAssistant.types.ts`**:
   - `UseVoiceAssistantState`: Ghi rõ có các state `isRecording`, `isSubmitting`, `submittingStatus`, `previewData`, `apiError`, `manualText`, `audioVolume`, `recordingDuration`.
   - `UseVoiceAssistantActions`: Ghi rõ các hàm `startRecording`, `stopRecording`, `cancelRecording`, `setManualText`, `submitManualText`, `confirmCreateTask`, `resetState`.
2. **`useVoiceAssistantState.ts`**:
   - Chứa `useCallback`, `useState`, gọi API qua `api.post`, kích hoạt âm thanh `audioChimes`. Không chứa bất kỳ thẻ JSX nào.
3. **`VoiceAssistantPresenter.tsx`**:
   - Nhận `state` và `actions` qua `props`. Sử dụng các Base Component (`Modal`, `Card`, `Button`, `Badge`, `Input`) để vẽ giao diện.
4. **`VoiceAssistantContainer.tsx`**:
   - Gọi `const voice = useVoiceAssistantState(projectId)` và truyền vào `<VoiceAssistantPresenter state={...} actions={...} />`.

---

## ⚙️ 4. CƠ CHẾ VÀ RÀNG BUỘC CẦN HIỂU RÕ (REACT MECHANISMS & CONSTRAINTS)

### A. Cơ chế Kích hoạt Re-render:
Component React chỉ re-render khi:
1. `useState` thay đổi giá trị thông qua hàm `setState` (so sánh shallow equality `Object.is`).
2. `props` truyền từ component cha bị thay đổi reference.
3. Context/Zustand Store mà component đang lắng nghe phát sinh state mới.

### B. Ràng buộc Tách rời Logic (Separation of Concerns):
- **Presenter Component:** Tuyệt đối không gọi `fetch` hay `axios` trực tiếp. Mọi tương tác người dùng phải thông qua callback actions được truyền vào từ props (`onClick={actions.startRecording}`).
- **Custom Hook:** Trả về đối tượng thỏa mãn chính xác `UseVoiceAssistantReturn`. Sử dụng `useCallback` cho toàn bộ các handler function để tránh làm Presenter re-render vô ích khi parent component cập nhật.

### C. Ràng buộc Design Tokens (CSS Variables):
- Toàn bộ font chữ phải tham chiếu qua biến: `font-family: var(--font-sans)`.
- Màu chủ đạo được lấy từ `:root`: `--solar-corona` (#f59e0b), `--obsidian-void` (#090d16), `--eclipse-surface` (#0f172a).
- Không tự ý hardcode mã màu hex rải rác trong class nếu màu đó thuộc bộ nhận diện thương hiệu.

---

## 🚀 5. HƯỚNG DẪN KIỂM CHỨNG & DEMO CHO GIẢNG VIÊN

Khi trình bày với Giảng viên / Hội đồng:
1. Mở file `fe/src/components/base/index.ts` để chứng minh đã có các khối cơ bản (Button, Badge, Card, Modal, Input).
2. Mở file `fe/src/index.css` để chỉ ra khối `:root` chứa Design Tokens (Font variables, Color variables).
3. Mở thư mục `fe/src/components/voice/pattern/` để chứng minh đã tách bạch hoàn toàn giữa `voiceAssistant.types.ts`, `useVoiceAssistantState.ts` và `VoiceAssistantPresenter.tsx`.
4. Nhấn mạnh việc UI Presenter được lắp ráp hoàn toàn từ các Base Components ở Bước 1.
