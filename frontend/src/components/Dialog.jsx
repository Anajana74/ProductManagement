import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const Ctx = createContext(null);
export const useDialog = () => useContext(Ctx);

export function DialogProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [value, setValue] = useState("");
  const [toasts, setToasts] = useState([]);
  const resolver = useRef();

  const open = useCallback((cfg) => new Promise((res) => {
    resolver.current = res; setValue(cfg.defaultValue || ""); setModal(cfg);
  }), []);
  const close = useCallback((result) => { setModal(null); resolver.current?.(result); }, []);

  const toast = useCallback((message, kind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const api = useMemo(() => ({
    toast,
    confirm: (o) => open({ type: "confirm", ...o }),
    prompt: (o) => open({ type: "prompt", ...o }),
    alert: (o) => open({ type: "alert", ...o }),
  }), [open, toast]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === "Escape" && close(modal.type === "prompt" ? null : false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, close]);

  const isPrompt = modal?.type === "prompt";
  const isAlert = modal?.type === "alert";
  const submit = () => (isPrompt ? value.trim() && close(value.trim()) : close(true));

  return (
    <Ctx.Provider value={api}>
      {children}
      {modal && (
        <div className="overlay" onClick={() => close(isPrompt ? null : false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className={"modal-icon" + (modal.danger || isAlert ? " danger" : "")}>{isAlert ? "⚠️" : modal.danger ? "🗑️" : isPrompt ? "✏️" : "❓"}</div>
            <h3>{modal.title}</h3>
            {modal.message && <p>{modal.message}</p>}
            {isPrompt && (
              <input className="input" autoFocus value={value} placeholder={modal.placeholder}
                     onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            )}
            <div className="modal-actions">
              {!isAlert && <button className="btn" onClick={() => close(isPrompt ? null : false)}>Cancel</button>}
              <button className={"btn " + (modal.danger ? "danger" : "primary")} onClick={submit}>{modal.confirmText || "OK"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={"toast " + t.kind}>
            <span>{t.kind === "success" ? "✅" : "⚠️"}</span>{t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}