import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "../styles/global.css";

function useFocusTrap(ref, isOpen) {
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const node = ref.current;
    const focusable = node.querySelectorAll(
      "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
    );
    if (focusable.length) focusable[0].focus();
    const handleTab = e => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    node.addEventListener("keydown", handleTab);
    return () => node.removeEventListener("keydown", handleTab);
  }, [isOpen, ref]);
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = 540,
  height = 640,
  hideClose = false,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useFocusTrap(modalRef, isOpen);

  if (!isOpen) return null;

  const modalJSX = (
    <div
      className="synergy-modal-overlay"
      onClick={onClose}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="synergy-modal"
        ref={modalRef}
        style={{
          width: width,
          height: height,
          maxWidth: "98vw",
          maxHeight: "99vh",
        }}
        onClick={e => e.stopPropagation()}
        tabIndex={0}
      >
        <div className="synergy-modal-header">
          {!hideClose && (
            <button
              className="synergy-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>
        <div className="synergy-modal-content">
          {title && (
            <h3 className="synergy-modal-title">{title}</h3>
          )}
          {children}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalJSX, document.body);
}
