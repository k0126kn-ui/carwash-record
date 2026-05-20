import {
  useEffect,
  useMemo,
  useState,
  useReducer,
  useRef,
  memo,
} from "react";

// ─────────────────────────────
// GLOBAL STYLES & NEON FONT
// ─────────────────────────────
const ORBITRON_FONT = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

body{
  margin:0;
  background:#000;
}

.neon-title{
  font-family:'Orbitron',sans-serif;
  font-size:28px;
  font-weight:900;
  color:#00e5ff;
  letter-spacing:3px;
  text-shadow:
    0 0 12px rgba(0,229,255,0.6),
    0 0 30px rgba(0,229,255,0.25);
  margin-bottom:4px;
}

.neon-sub{
  font-family:'Orbitron',sans-serif;
  font-size:10px;
  color:#ff00cc;
  letter-spacing:5px;
  text-shadow:0 0 8px rgba(255,0,204,0.5);
  margin-bottom:20px;
}

.neon-scan{
  height:1px;
  background:linear-gradient(
    90deg,
    transparent,
    rgba(0,229,255,0.5),
    transparent
  );
  animation:scanAnim 2s linear infinite;
  margin:6px 0 16px;
}

@keyframes scanAnim{
  0%{opacity:0.3;}
  50%{opacity:1;}
  100%{opacity:0.3;}
}
`;

// ─────────────────────────────
// CONSTANTS
// ─────────────────────────────
const STORAGE_KEY = "carwashRecords_v12";

const WASH_TYPES = ["本洗車", "メンテ洗車"];

const PROTECTION_LIST = [
  "NATIVE クリーナーワックス",
  "NATIVE ペーストワックス",
  "NATIVE スプレーワックス",
  "BLEND スプレーワックス",
  "PERFECTA 2.0",
];

const CHEMICAL_PRESETS = [
  { label: "3pH",     chemicals: ["PRIMUS 2.0", "PURIFICA", "SEMPER"] },
  { label: "2pH",     chemicals: ["NEVE", "SEMPER"] },
  { label: "ホイール", chemicals: ["BLAZE", "AQUA"] },
];

// ─────────────────────────────
// FSM
// ─────────────────────────────
const UI_STATES = {
  IDLE:    "IDLE",
  SWIPED:  "SWIPED",
  EDITING: "EDITING",
};

// ─────────────────────────────
// STYLES（モノトーン）
// ─────────────────────────────
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#000000 0%,#0d0d0d 50%,#1a1a1a 100%)",
    color: "white",
    padding: "20px",
    fontFamily: "sans-serif",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
    backgroundColor: "rgba(20,20,20,0.95)",
    border: "1px solid #2a2a2a",
    borderRadius: "20px",
    padding: "18px",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #333333",
    backgroundColor: "#111111",
    color: "white",
    fontSize: "16px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #333333",
    backgroundColor: "#111111",
    color: "white",
    fontSize: "16px",
    resize: "vertical",
    outline: "none",
  },

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  chip: (selected) => ({
    backgroundColor: selected ? "#3a3a3a" : "#1c1c1c",
    color: selected ? "#ffffff" : "#aaaaaa",
    border: selected ? "1px solid #ffffff" : "1px solid #333333",
    padding: "10px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: selected ? "bold" : "normal",
  }),

  addButton: (disabled) => ({
    background: disabled ? "#222222" : "#ffffff",
    color: disabled ? "#555555" : "#000000",
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  }),

  backupRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },

  backupButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #333333",
    backgroundColor: "#1c1c1c",
    color: "#aaaaaa",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "center",
  },

  recordsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  emptyText: {
    textAlign: "center",
    color: "#555555",
    padding: "40px 0",
  },

  swipeWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "20px",
  },

  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "90px",
    height: "100%",
    background: "linear-gradient(180deg,#2a2a2a,#111111)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "4px",
  },

  deleteLabel: {
    color: "#ff4444",
    fontSize: "13px",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: "20px",
    padding: "16px",
    position: "relative",
    zIndex: 2,
    transition: "transform 0.2s ease",
    touchAction: "pan-y",
  },

  badge: (type) => ({
    display: "inline-block",
    backgroundColor: type === "本洗車" ? "#ffffff" : "#444444",
    color: type === "本洗車" ? "#000000" : "#ffffff",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "bold",
    marginTop: "8px",
    marginBottom: "10px",
  }),

  sectionTitle: {
    marginTop: "12px",
    marginBottom: "4px",
    fontSize: "13px",
    color: "#666666",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },

  sideButton: (selected) => ({
    backgroundColor: selected ? "#3a3a3a" : "#1c1c1c",
    color: selected ? "#ffffff" : "#aaaaaa",
    border: selected ? "1px solid #ffffff" : "1px solid #333333",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: selected ? "bold" : "normal",
  }),

  saveProtectionButton: (isClear) => ({
    background: isClear ? "#2a2a2a" : "#ffffff",
    color: isClear ? "#ff4444" : "#000000",
    border: isClear ? "1px solid #ff4444" : "none",
    padding: "12px",
    borderRadius: "12px",
    marginTop: "12px",
    width: "100%",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  }),

  editButton: {
    backgroundColor: "transparent",
    color: "#888888",
    border: "none",
    fontSize: "13px",
    cursor: "pointer",
    padding: "0 8px",
    textDecoration: "underline",
  },

  initRegisterButton: {
    background: "#1c1c1c",
    color: "#aaaaaa",
    border: "1px dashed #444444",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "10px",
    width: "100%",
    fontWeight: "bold",
  },

  // アプリ内確認ダイアログ
  dialogOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  dialogBox: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333333",
    borderRadius: "20px",
    padding: "24px",
    width: "100%",
    maxWidth: "360px",
  },

  dialogMessage: {
    fontSize: "15px",
    color: "#ffffff",
    marginBottom: "20px",
    lineHeight: "1.6",
  },

  dialogButtons: {
    display: "flex",
    gap: "12px",
  },

  dialogConfirm: (danger) => ({
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: danger ? "#ff4444" : "#ffffff",
    color: danger ? "#ffffff" : "#000000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  }),

  dialogCancel: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #444444",
    background: "#1c1c1c",
    color: "#aaaaaa",
    cursor: "pointer",
    fontSize: "15px",
  },

  // トースト通知
  toast: (type) => ({
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: type === "error" ? "#2a1010" : "#101a10",
    border: `1px solid ${type === "error" ? "#ff4444" : "#44cc44"}`,
    color: type === "error" ? "#ff8888" : "#88dd88",
    padding: "12px 24px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 200,
    whiteSpace: "nowrap",
  }),
};

// ─────────────────────────────
// SANITIZE
// ─────────────────────────────
function sanitizeChemicals(list) {
  if (!Array.isArray(list)) return [];
  return [
    ...new Set(
      list
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0 && v.length <= 100)
    ),
  ];
}

function sanitizeProtections(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((v) => PROTECTION_LIST.includes(v)))];
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function sanitizeRecord(record) {
  return {
    id:            typeof record.id === "string"   ? record.id            : generateId(),
    type:          WASH_TYPES.includes(record.type) ? record.type          : WASH_TYPES[0],
    washChemicals: sanitizeChemicals(record.washChemicals),
    protections:   sanitizeProtections(record.protections),
    memo:          typeof record.memo === "string"  ? record.memo.slice(0, 1000) : "",
    date:          typeof record.date === "string"  ? record.date          : new Date().toLocaleDateString(),
  };
}

function validateAndSanitizeRecords(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((record) => typeof record === "object" && record !== null)
    .map(sanitizeRecord);
}

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? validateAndSanitizeRecords(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────
// REDUCERS
// ─────────────────────────────
function recordsReducer(state, action) {
  switch (action.type) {
    case "SET_RECORDS":
      return action.payload.map(sanitizeRecord);
    case "ADD_RECORD":
      return [sanitizeRecord(action.payload), ...state];
    case "DELETE_RECORD":
      return state.filter((r) => r.id !== action.payload);
    case "UPDATE_PROTECTIONS":
      return state.map((r) =>
        r.id === action.payload.id
          ? { ...r, protections: sanitizeProtections(action.payload.protections) }
          : r
      );
    default:
      return state;
  }
}

function uiReducer(state, action) {
  switch (action.type) {
    case "RESET":
      return { type: UI_STATES.IDLE };
    case "SWIPED":
      return { type: UI_STATES.SWIPED, recordId: action.payload };
    case "EDITING":
      return {
        type: UI_STATES.EDITING,
        recordId: action.payload.id,
        pendingProtections: [...action.payload.protections],
      };
    case "TOGGLE_PROTECTION":
      if (state.type !== UI_STATES.EDITING) return state;
      return {
        ...state,
        pendingProtections: state.pendingProtections.includes(action.payload)
          ? state.pendingProtections.filter((p) => p !== action.payload)
          : [...state.pendingProtections, action.payload],
      };
    default:
      return state;
  }
}

// ─────────────────────────────
// DIALOG（アプリ内確認UI）
// ─────────────────────────────
function Dialog({ message, confirmLabel = "OK", danger = false, onConfirm, onCancel }) {
  return (
    <div style={styles.dialogOverlay}>
      <div style={styles.dialogBox}>
        <div style={styles.dialogMessage}>{message}</div>
        <div style={styles.dialogButtons}>
          <button onClick={onConfirm} style={styles.dialogConfirm(danger)}>
            {confirmLabel}
          </button>
          {onCancel && (
            <button onClick={onCancel} style={styles.dialogCancel}>
              キャンセル
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────
// RECORD CARD
// ─────────────────────────────
const RecordCard = memo(function RecordCard({
  record, ui, onEdit, onRequestDelete, onSave, onToggleProtection,
  onTouchStart, onTouchMove, onTouchEnd,
}) {
  const isSwiped  = ui.type === UI_STATES.SWIPED  && ui.recordId === record.id;
  const isEditing = ui.type === UI_STATES.EDITING  && ui.recordId === record.id;
  const hasProtections = record.protections.length > 0;
  const pending = isEditing ? ui.pendingProtections : [];

  return (
    <div style={styles.swipeWrapper}>
      {/* 削除背景 */}
      <div style={styles.deleteBackground}>
        <span style={{ fontSize: "20px" }}>🗑</span>
        <span style={styles.deleteLabel}>削除</span>
      </div>

      {/* カード */}
      <div
        style={{
          ...styles.card,
          transform: isSwiped ? "translateX(-90px)" : "translateX(0)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => onTouchEnd(record.id)}
        onClick={() => { if (isSwiped) onRequestDelete(record.id); }}
      >
        <div style={{ fontSize: "13px", color: "#666666" }}>{record.date}</div>

        <div style={styles.badge(record.type)}>{record.type}</div>

        <div style={styles.sectionTitle}>洗浄ケミカル</div>
        <div>{record.washChemicals.join(" / ")}</div>

        <div style={styles.sectionTitle}>
          保護剤
          {!isEditing && hasProtections && (
            <button type="button" onClick={() => onEdit(record)} style={styles.editButton}>
              編集
            </button>
          )}
        </div>
        <div>{hasProtections ? record.protections.join(" / ") : "なし"}</div>

        <div style={styles.sectionTitle}>メモ</div>
        <div>{record.memo || "なし"}</div>

        {/* 保護剤未登録：ボタン表示 */}
        {!isEditing && !hasProtections && (
          <button type="button" onClick={() => onEdit(record)} style={styles.initRegisterButton}>
            + 保護剤を登録
          </button>
        )}

        {/* 編集中：選択UI */}
        {isEditing && (
          <>
            <div style={styles.buttonRow}>
              {PROTECTION_LIST.map((p) => {
                const selected = pending.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => onToggleProtection(p)}
                    style={styles.sideButton(selected)}
                  >
                    {selected ? `✓ ${p}` : `+ ${p}`}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onSave(record.id)}
              style={styles.saveProtectionButton(pending.length === 0)}
            >
              {pending.length > 0 ? "保護剤の選択を確定" : "保護剤を未施工にする（クリア）"}
            </button>
          </>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────
// APP
// ─────────────────────────────
function App() {
  const [records, dispatchRecords] = useReducer(recordsReducer, null, loadRecords);
  const [ui, dispatchUi]           = useReducer(uiReducer, { type: UI_STATES.IDLE });

  const [washType, setWashType]       = useState("本洗車");
  const [memo, setMemo]               = useState("");
  const [chemicalText, setChemicalText] = useState("");
  const [error, setError]             = useState("");

  // アプリ内ダイアログ
  const [dialog, setDialog] = useState(null);
  // { message, confirmLabel, danger, onConfirm, onCancel }

  // トースト通知
  const [toast, setToast] = useState(null);
  // { message, type: 'success' | 'error' }

  const touchRef = useRef({ startX: null, startY: null, endX: null, endY: null });

  // ─── 保存 ───────────────────
  useEffect(() => {
    const save = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(save);
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(save, 300);
    return () => clearTimeout(timer);
  }, [records]);

  // ─── トースト自動消去 ────────
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const selectedChemicals = useMemo(
    () => sanitizeChemicals(chemicalText.split(",")),
    [chemicalText]
  );

  // ─── アプリ内確認ヘルパー ─────
  const showDialog = (options) => setDialog(options);
  const closeDialog = () => setDialog(null);

  // ─── 編集ガード（アプリ内UI）──
  const guardedAction = (nextTargetId, action) => {
    if (ui.type === UI_STATES.EDITING && ui.recordId !== nextTargetId) {
      showDialog({
        message: "保護剤の編集内容が破棄されます。よろしいですか？",
        confirmLabel: "破棄する",
        danger: false,
        onConfirm: () => { closeDialog(); action(); },
        onCancel: closeDialog,
      });
    } else {
      action();
    }
  };

  // ─── 記録追加 ─────────────────
  const handleAddRecord = () => {
    if (selectedChemicals.length === 0) {
      setError("有効なケミカルを入力してください");
      return;
    }
    guardedAction(null, () => {
      dispatchRecords({
        type: "ADD_RECORD",
        payload: {
          id: generateId(),
          type: washType,
          washChemicals: selectedChemicals,
          protections: [],
          memo,
          date: new Date().toLocaleDateString(),
        },
      });
      dispatchUi({ type: "RESET" });
      setChemicalText("");
      setMemo("");
      setError("");
    });
  };

  // ─── 保護剤編集開始 ───────────
  const handleEdit = (record) => {
    guardedAction(record.id, () => {
      dispatchUi({ type: "EDITING", payload: { id: record.id, protections: record.protections } });
    });
  };

  // ─── 保護剤保存 ───────────────
  const handleSave = (recordId) => {
    if (ui.type !== UI_STATES.EDITING) return;
    dispatchRecords({
      type: "UPDATE_PROTECTIONS",
      payload: { id: recordId, protections: ui.pendingProtections },
    });
    dispatchUi({ type: "RESET" });
  };

  // ─── 削除（アプリ内確認）───────
  const handleRequestDelete = (id) => {
    showDialog({
      message: "この記録を削除しますか？",
      confirmLabel: "削除する",
      danger: true,
      onConfirm: () => {
        dispatchRecords({ type: "DELETE_RECORD", payload: id });
        dispatchUi({ type: "RESET" });
        closeDialog();
      },
      onCancel: () => {
        dispatchUi({ type: "RESET" });
        closeDialog();
      },
    });
  };

  // ─── タッチ ───────────────────
  const resetTouch = () => {
    touchRef.current = { startX: null, startY: null, endX: null, endY: null };
  };

  const handleTouchStart = (e) => {
    touchRef.current.startX = e.changedTouches[0].screenX;
    touchRef.current.startY = e.changedTouches[0].screenY;
    touchRef.current.endX   = null;
    touchRef.current.endY   = null;
  };

  const handleTouchMove = (e) => {
    touchRef.current.endX = e.changedTouches[0].screenX;
    touchRef.current.endY = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (recordId) => {
    const { startX, startY, endX, endY } = touchRef.current;
    if (startX === null || endX === null) { resetTouch(); return; }

    const deltaX = startX - endX;
    const deltaY = startY - endY;

    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 30) {
      resetTouch(); return;
    }

    if (deltaX > 80) {
      guardedAction(recordId, () => {
        dispatchUi({ type: "SWIPED", payload: recordId });
      });
    } else if (deltaX < -30) {
      if (ui.type === UI_STATES.SWIPED && ui.recordId === recordId) {
        dispatchUi({ type: "RESET" });
      }
    }
    resetTouch();
  };

  // ─── バックアップ保存 ──────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `carwash-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ─── 復元 ─────────────────────
  const fileInputRef = useRef(null);

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const validated = validateAndSanitizeRecords(JSON.parse(e.target.result));
        if (validated.length === 0) {
          setToast({ message: "有効なデータがありませんでした", type: "error" });
          return;
        }
        // アプリ内で上書き確認
        showDialog({
          message: `${validated.length}件のデータを復元します。現在のデータは上書きされます。`,
          confirmLabel: "復元する",
          danger: false,
          onConfirm: () => {
            dispatchRecords({ type: "SET_RECORDS", payload: validated });
            dispatchUi({ type: "RESET" });
            closeDialog();
            setToast({ message: `${validated.length}件を復元しました`, type: "success" });
          },
          onCancel: closeDialog,
        });
      } catch {
        setToast({ message: "ファイルの読み込みに失敗しました", type: "error" });
      }
    };

    reader.onloadend = () => { event.target.value = ""; };
    reader.readAsText(file);
  };

  return (
    <div style={styles.container}>
      <style>{ORBITRON_FONT}</style>

      {/* アプリ内確認ダイアログ */}
      {dialog && (
        <Dialog
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          danger={dialog.danger}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}

      {/* トースト通知 */}
      {toast && (
        <div style={styles.toast(toast.type)}>{toast.message}</div>
      )}

      {/* HEADER */}
      <div>
        <div className="neon-title">Car Wash Record</div>
        <div className="neon-scan" />
        <div className="neon-sub">// Detailing Log System</div>
      </div>

      {/* FORM */}
      <div style={styles.form}>
        <select
          value={washType}
          onChange={(e) => setWashType(e.target.value)}
          style={styles.input}
        >
          {WASH_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <input
          type="text"
          placeholder="ケミカルを入力（カンマ区切り）"
          value={chemicalText}
          onChange={(e) => { setChemicalText(e.target.value); setError(""); }}
          style={styles.input}
        />

        <div style={styles.chips}>
          {CHEMICAL_PRESETS.map((preset) => {
            const selected = preset.chemicals.every((c) => selectedChemicals.includes(c));
            return (
              <button
                type="button"
                key={preset.label}
                onClick={() => {
                  const current = [...selectedChemicals];
                  const updated = selected
                    ? current.filter((c) => !preset.chemicals.includes(c))
                    : sanitizeChemicals([...current, ...preset.chemicals]);
                  setChemicalText(updated.join(", "));
                }}
                style={styles.chip(selected)}
              >
                {selected ? `✓ ${preset.label}` : preset.label}
              </button>
            );
          })}
        </div>

        <textarea
          placeholder="メモ（1000文字以内）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={1000}
          style={styles.textarea}
        />

        {error && <div style={{ color: "#f87171" }}>⚠️ {error}</div>}

        <button
          type="button"
          onClick={handleAddRecord}
          disabled={selectedChemicals.length === 0}
          style={styles.addButton(selectedChemicals.length === 0)}
        >
          記録を追加
        </button>
      </div>

      {/* BACKUP */}
      <div style={styles.backupRow}>
        <button onClick={handleExport} style={styles.backupButton}>
          💾 バックアップ保存
        </button>
        <label style={styles.backupButton}>
          📂 復元
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* RECORDS */}
      <div style={styles.recordsBox}>
        {records.length === 0 && (
          <div style={styles.emptyText}>記録がありません</div>
        )}

        {records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            ui={ui}
            onEdit={handleEdit}
            onRequestDelete={handleRequestDelete}
            onSave={handleSave}
            onToggleProtection={(p) => dispatchUi({ type: "TOGGLE_PROTECTION", payload: p })}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ))}
      </div>
    </div>
  );
}

export default App;