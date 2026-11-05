import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }}
      className="w-[min(92vw,26rem)] rounded-2xl border border-garis bg-white p-6 text-tinta backdrop:bg-tinta/40">
      <p className="text-base">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onCancel} autoFocus>{cancelLabel}</button>
        <button className="btn bg-red-700 text-white hover:bg-red-800" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
