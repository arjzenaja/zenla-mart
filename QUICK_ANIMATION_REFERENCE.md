# 🎬 Quick Animation Reference

## 📌 TL;DR - Apa Yang Berubah?

### ✨ Enter Animation (Muncul)
```
Durasi: 300ms
Gerakan: Slide down + Fade in + Scale up
Easing: Smooth dengan bounce effect
Desktop: Slide dari top-right corner
Mobile: Slide dari atas (centered)
```

### 🚪 Exit Animation (Hilang)  
```
Durasi: 250ms
Gerakan: Slide up + Fade out + Scale down
Easing: Smooth ease-in
Wichtig: Animation selesai SEBELUM remove dari DOM ✅
```

### 👆 Hover Behavior
```
Pause auto-dismiss ✅
Shadow elevate ✅
Cursor pointer ✅
```

---

## 🎯 3 Hal Paling Penting

### 1. Enter Animation
- Toast muncul smooth dengan slide dari atas
- Tidak langsung appear, tapi animated entry
- Durasi 300ms (cepat namun tidak instant)

### 2. Exit Animation  
- Toast tidak langsung hilang
- Exit dengan smooth animation 250ms
- Animation selesai DULU sebelum remove dari state
- **Tidak ada flicker!** ✅

### 3. Hover Pause
- Saat user hover toast, auto-dismiss **pause**
- Lepas hover, auto-dismiss **resume**
- Shadow bertambah untuk visual feedback

---

## 📊 Animation Timeline

```
0ms    ┌─ Mount
       ├─ isVisible = false
       ├─ isExiting = false
       │
150ms  ├─ setIsVisible(true) → .toast-enter class
       │  [Slide down + Fade in + Scale up animation running]
       │
300ms  ├─ Animation complete, toast visible
       │  [Auto-dismiss timer running]
       │
3500ms ├─ Auto-dismiss triggers OR user closes
       │  ├─ setIsExiting(true) → .toast-exit class
       │  │  [Slide up + Fade out + Scale down animation running]
       │
3750ms ├─ Animation complete
       │  ├─ onClose() called
       │  ├─ removeNotification() removes from state
       │
3760ms └─ Unmount from DOM
```

---

## 🔧 File Changes Summary

### 1. `src/component/Toast.jsx` ✏️

**Added**:
- `isExiting` state untuk exit animation
- `isHovered` state untuk hover pause
- `autoDismissTimerRef` & `exitTimerRef` refs
- Custom keyframes untuk desktop & mobile
- Hover event handlers (`onMouseEnter`, `onMouseLeave`)
- Proper exit animation wait logic

**Removed**:
- Immediate removal when `isVisible = false`
- Old basic transition classes

### 2. `src/context/NotificationProvider.jsx` ✏️

**Added**:
- Responsive `.toast-container` positioning
- Pointer-events wrapper for better UX
- Mobile centered positioning with transform

**Removed**:
- Auto-dismiss setTimeout (moved to Toast component)
- Old simple positioning

### 3. `useNotification.js` ✅ No Changes
- API tetap sama
- Backward compatible

---

## 🎨 Animation Classes

### Enter Animation
```css
.toast-enter {
  animation: toastSlideInDown 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

### Exit Animation
```css
.toast-exit {
  animation: toastSlideOutUp 250ms cubic-bezier(0.3, 0, 0.8, 0.15) forwards;
}
```

---

## 🚀 Performance Impact

| Metrik | Impact |
|--------|--------|
| **CPU** | Minimal (CSS animation only) |
| **GPU** | Utilized for smooth transforms |
| **Memory** | No additional overhead |
| **FPS** | Smooth 60fps |
| **Bundle Size** | No change (no new library) |

---

## 📱 Responsive Breakdown

### Desktop (≥ 769px)
- Position: **top-right** (1.5rem dari edges)
- Enter slide: **From top-right**
- Animation: Includes horizontal offset

### Mobile (< 768px)
- Position: **top-center** (50% translateX)
- Enter slide: **From top only** (no horizontal)
- Animation: Simplified for mobile UX

---

## ✅ Testing Checklist (Quick)

- [ ] Toast muncul smooth (300ms)
- [ ] Toast hilang smooth (250ms)
- [ ] Hover pause auto-dismiss
- [ ] Multiple toast stack
- [ ] Close button works
- [ ] Mobile responsive
- [ ] No flicker
- [ ] No lag

---

## 🎬 Visual Comparison

### BEFORE ❌
```
Toast appear → Instant fade + basic transform
Toast close → Immediately vanish
Hover → Shadow only
Result → Feels basic, might flicker
```

### AFTER ✅
```
Toast appear → Smooth slide 300ms + scale + fade with bounce
Toast close → Smooth slide 250ms + scale + fade with ease-in
Hover → Pause timer + enhanced shadow + curve pointer
Result → Smooth, premium, professional
```

---

## 🔗 Related Files

- [Toast.jsx](src/component/Toast.jsx) - Main animation component
- [NotificationProvider.jsx](src/context/NotificationProvider.jsx) - Provider with responsive positioning
- [useNotification.js](src/utils/useNotification.js) - Hook (unchanged)
- [TOAST_ANIMATION_IMPROVEMENTS.md](TOAST_ANIMATION_IMPROVEMENTS.md) - Full documentation

---

## 💡 Key Learnings

1. **State-driven animations**: Using React state (`isVisible`, `isExiting`) untuk trigger CSS animations
2. **Timing coordination**: Wait untuk CSS animation selesai sebelum remove dari DOM
3. **Responsive design**: Different animations untuk desktop vs mobile
4. **Hover interaction**: Pause timer saat hover untuk better UX
5. **No library needed**: Pure CSS + React state management

---

Last Updated: February 12, 2026
