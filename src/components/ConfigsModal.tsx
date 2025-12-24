import { type ReactNode } from 'react';

type ConfigsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

function ConfigsModal({ isOpen, children }: ConfigsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

export default ConfigsModal;
