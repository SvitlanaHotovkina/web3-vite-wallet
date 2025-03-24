import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Закриття при Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") {
        const btn = modalRef.current?.querySelector<HTMLButtonElement>(
          "button[type='submit']"
        );
        btn?.click();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Автофокус на перший input або кнопку
  useEffect(() => {
    setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        "input, button, textarea, select, [tabindex]:not([tabindex='-1'])"
      );
      firstFocusable?.focus();
    }, 50);
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white text-black rounded-2xl shadow-2xl max-w-xl w-full p-8 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          input[type="text"],
          input[type="number"] {
            color: #3b82f6; /* Tailwind's blue-500, як 🌐 */
          }
        `}</style>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
