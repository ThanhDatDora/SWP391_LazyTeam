# 🔄 Browser Cache Clear Instructions

## Để xem encoding fixes, BẮT BUỘC phải clear cache:

### Option 1: Hard Refresh (Nhanh nhất)
1. Mở http://localhost:5173
2. Nhấn **Ctrl + Shift + R** (Chrome/Edge)
3. Hoặc **Ctrl + F5** (Firefox)

### Option 2: DevTools Clear (Chắc chắn nhất)
1. Mở http://localhost:5173
2. Nhấn **F12** để mở DevTools
3. **Click phải vào nút Refresh** (⟲)
4. Chọn "**Empty Cache and Hard Reload**"

### Option 3: Manual Cache Clear
1. **Chrome**: Settings → Privacy and security → Clear browsing data → Cached images and files
2. **Edge**: Settings → Privacy, search, and services → Clear browsing data → Cached images and files
3. **Firefox**: Settings → Privacy & Security → Cookies and Site Data → Clear Data

## ✅ Sau khi clear cache, bạn sẽ thấy:
- "Chào mừng đến Mini Coursera!" (ĐÚNG)
- Thay vì "ChÃ o má»«ng Ä'áº¿n..." (SAI)

## 🎯 Test Pages:
- Main app: http://localhost:5173
- UTF-8 test: http://localhost:5173/test-utf8-encoding.html

*Note: Vietnamese text encoding đã được fix trong source code. Browser cache là lý do duy nhất tại sao bạn vẫn thấy text bị lỗi.*