import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────
// FONT
// ─────────────────────────────

const ORBITRON_FONT = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

body{
  margin:0;
  background:#050816;
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

const STORAGE_KEY = "carwashRecords_v9";

const CHEMICAL_PRESETS = [
  {
    label: "3pH",
    chemicals: ["PRIMUS 2.0", "PURIFICA", "SEMPER"],
  },
  {
    label: "2pH",
    chemicals: ["NEVE", "SEMPER"],
  },
  {
    label: "ホイール",
    chemicals: ["BLAZE", "AQUA"],
  },
];

const PROTECTION_LIST = [
  "NATIVE クリーナーワックス",
  "NATIVE ペーストワックス",
  "NATIVE スプレーワックス",
  "BLEND スプレーワックス",
  "PERFECTA 2.0",
];

// ─────────────────────────────
// STYLES
// ─────────────────────────────

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#050816 0%,#0b1120 50%,#111827 100%)",
    color: "white",
    padding: "20px",
    fontFamily: "sans-serif",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
    backgroundColor: "rgba(17,24,39,0.92)",
    border: "1px solid #1f2937",
    borderRadius: "20px",
    padding: "18px",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #374151",
    backgroundColor: "#0f172a",
    color: "white",
    fontSize: "16px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #374151",
    backgroundColor: "#0f172a",
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
    backgroundColor: selected ? "#2563eb" : "#1e293b",
    color: "white",
    border: selected
      ? "1px solid #7dd3fc"
      : "1px solid #334155",
    padding: "10px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: selected ? "bold" : "normal",
  }),

  addButton: (disabled) => ({
    background: disabled
      ? "#374151"
      : "linear-gradient(90deg,#2563eb,#0891b2)",
    color: disabled ? "#9ca3af" : "white",
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  }),

  recordsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
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
    background:
      "linear-gradient(180deg,#dc2626,#7f1d1d)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    background: "transparent",
    border: "none",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },

  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "16px",
    position: "relative",
    zIndex: 2,
    transition: "transform 0.2s ease",
    touchAction: "pan-y",
  },

  badge: (type) => ({
    display: "inline-block",
    backgroundColor:
      type === "本洗車"
        ? "#2563eb"
        : "#059669",
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
    color: "#94a3b8",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },

  sideButton: (selected) => ({
    backgroundColor: selected ? "#2563eb" : "#1e293b",
    color: "white",
    border: selected
      ? "1px solid #7dd3fc"
      : "1px solid #334155",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: selected ? "bold" : "normal",
  }),

  saveProtectionButton: {
    background:
      "linear-gradient(90deg,#2563eb,#0891b2)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    marginTop: "12px",
    width: "100%",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },
};

// ─────────────────────────────
// HELPERS
// ─────────────────────────────

function normalizeChemicals(list) {
  return [...new Set(list.map((v) => v.trim()).filter(Boolean))];
}

function createRecord({
  type,
  washChemicals,
  protections,
  memo,
}) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    washChemicals,
    protections,
    memo,
    date: new Date().toLocaleDateString(),
  };
}

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────
// APP
// ─────────────────────────────

function App() {
  const [records, setRecords] = useState(loadRecords);

  const [washType, setWashType] =
    useState("本洗車");

  const [memo, setMemo] = useState("");

  const [chemicalText, setChemicalText] =
    useState("");

  const [error, setError] = useState("");

  // swipe

  const [swipedId, setSwipedId] =
    useState(null);

  const [touchStartX, setTouchStartX] =
    useState(null);

  const [touchEndX, setTouchEndX] =
    useState(null);

  // 保護剤選択

  const [pendingProtections, setPendingProtections] =
    useState({});

  const selectedChemicals = useMemo(
    () => normalizeChemicals(chemicalText.split(",")),
    [chemicalText]
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records)
    );
  }, [records]);

  const togglePreset = (preset) => {
    const current = [...selectedChemicals];

    const allIncluded = preset.chemicals.every((c) =>
      current.includes(c)
    );

    const updated = allIncluded
      ? current.filter(
          (c) => !preset.chemicals.includes(c)
        )
      : normalizeChemicals([
          ...current,
          ...preset.chemicals,
        ]);

    setChemicalText(updated.join(", "));
  };

  const addRecord = () => {
    if (selectedChemicals.length === 0) {
      setError("ケミカルを入力してください");
      return;
    }

    const newRecord = createRecord({
      type: washType,
      washChemicals: selectedChemicals,
      protections: [],
      memo,
    });

    setRecords((prev) => [newRecord, ...prev]);

    setChemicalText("");
    setMemo("");
    setError("");
  };

  // 保護剤選択

  const toggleProtection = (recordId, protection) => {
    setPendingProtections((prev) => {
      const current = prev[recordId] || [];

      const exists = current.includes(protection);

      return {
        ...prev,
        [recordId]: exists
          ? current.filter((p) => p !== protection)
          : [...current, protection],
      };
    });
  };

  // 保護剤保存

  const saveProtections = (recordId) => {
    const selected =
      pendingProtections[recordId] || [];

    if (selected.length === 0) return;

    setRecords((prev) =>
      prev.map((record) => {
        if (record.id !== recordId) return record;

        return {
          ...record,
          protections: [
            ...new Set([
              ...record.protections,
              ...selected,
            ]),
          ],
        };
      })
    );

    // 選択リセット

    setPendingProtections((prev) => ({
      ...prev,
      [recordId]: [],
    }));
  };

  // 削除

  const deleteRecord = (id) => {
    const ok = window.confirm(
      "この記録を削除しますか？"
    );

    if (!ok) return;

    setRecords((prev) =>
      prev.filter((record) => record.id !== id)
    );

    setSwipedId(null);
  };

  // swipe

  const handleTouchStart = (e) => {
    setTouchStartX(
      e.changedTouches[0].screenX
    );

    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(
      e.changedTouches[0].screenX
    );
  };

  const handleTouchEnd = (recordId) => {
    if (
      touchStartX === null ||
      touchEndX === null
    ) {
      return;
    }

    const distance =
      touchStartX - touchEndX;

    if (distance > 80) {
      setSwipedId(recordId);
    } else if (distance < -30) {
      setSwipedId(null);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div style={styles.container}>
      <style>{ORBITRON_FONT}</style>

      <div>
        <div className="neon-title">
          Car Wash Record
        </div>

        <div className="neon-scan" />

        <div className="neon-sub">
          // Detailing Log System
        </div>
      </div>

      {/* FORM */}

      <div style={styles.form}>
        <select
          value={washType}
          onChange={(e) =>
            setWashType(e.target.value)
          }
          style={styles.input}
        >
          <option>本洗車</option>
          <option>メンテ洗車</option>
        </select>

        <input
          type="text"
          placeholder="ケミカルを入力（カンマ区切り）"
          value={chemicalText}
          onChange={(e) => {
            setChemicalText(e.target.value);
            setError("");
          }}
          style={styles.input}
        />

        <div style={styles.chips}>
          {CHEMICAL_PRESETS.map((preset) => {
            const selected =
              preset.chemicals.every((c) =>
                selectedChemicals.includes(c)
              );

            return (
              <button
                type="button"
                key={preset.label}
                onClick={() =>
                  togglePreset(preset)
                }
                style={styles.chip(selected)}
              >
                {selected
                  ? `✓ ${preset.label}`
                  : preset.label}
              </button>
            );
          })}
        </div>

        <textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) =>
            setMemo(e.target.value)
          }
          style={styles.textarea}
        />

        {error && (
          <div style={{ color: "#f87171" }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          onClick={addRecord}
          disabled={
            selectedChemicals.length === 0
          }
          style={styles.addButton(
            selectedChemicals.length === 0
          )}
        >
          記録を追加
        </button>
      </div>

      {/* RECORDS */}

      <div style={styles.recordsBox}>
        {records.length === 0 && (
          <div style={styles.emptyText}>
            記録がありません
          </div>
        )}

        {records.map((record) => {
          const selected =
            pendingProtections[record.id] || [];

          const hasSelection =
            selected.length > 0;

          // 保護剤保存済みならロック

          const isLocked =
            record.protections.length > 0;

          return (
            <div
              key={record.id}
              style={styles.swipeWrapper}
            >
              {/* 削除背景 */}

              <div style={styles.deleteBackground}>
                <button
                  type="button"
                  onClick={() =>
                    deleteRecord(record.id)
                  }
                  style={styles.deleteButton}
                >
                  削除
                </button>
              </div>

              {/* CARD */}

              <div
                style={{
                  ...styles.card,
                  transform:
                    swipedId === record.id
                      ? "translateX(-90px)"
                      : "translateX(0)",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() =>
                  handleTouchEnd(record.id)
                }
              >
                <div>{record.date}</div>

                <div style={styles.badge(record.type)}>
                  {record.type}
                </div>

                <div style={styles.sectionTitle}>
                  洗浄ケミカル
                </div>

                <div>
                  {record.washChemicals.join(
                    " / "
                  )}
                </div>

                <div style={styles.sectionTitle}>
                  保護剤
                </div>

                <div>
                  {record.protections.length > 0
                    ? record.protections.join(
                        " / "
                      )
                    : "なし"}
                </div>

                <div style={styles.sectionTitle}>
                  メモ
                </div>

                <div>
                  {record.memo || "なし"}
                </div>

                {!isLocked && (
                  <>
                    <div style={styles.buttonRow}>
                      {PROTECTION_LIST.map(
                        (protection) => {
                          const isSelected =
                            selected.includes(
                              protection
                            );

                          return (
                            <button
                              type="button"
                              key={protection}
                              onClick={() =>
                                toggleProtection(
                                  record.id,
                                  protection
                                )
                              }
                              style={styles.sideButton(
                                isSelected
                              )}
                            >
                              {isSelected
                                ? `✓ ${protection}`
                                : `+ ${protection}`}
                            </button>
                          );
                        }
                      )}
                    </div>

                    {hasSelection && (
                      <button
                        type="button"
                        onClick={() =>
                          saveProtections(record.id)
                        }
                        style={
                          styles.saveProtectionButton
                        }
                      >
                        保護剤を保存
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;