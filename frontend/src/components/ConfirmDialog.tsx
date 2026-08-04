import styles from './ConfirmDialog.module.css';
export const ConfirmDialog = ({
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
    <div
      className={styles.dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className={styles.mark}>!</span>
      <h2 id="confirm-title">{title}</h2>
      <p>{body}</p>
      <div>
        <button className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
