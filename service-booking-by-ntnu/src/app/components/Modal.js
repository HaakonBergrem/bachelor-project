/**
 * Modal component
 * This component is responsible for displaying a modal dialog and is used to confirm a booking.
 * It receives the following props:
 * @param {Object} props - The props object
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - The function to call when the close button is clicked
 * @param {Function} props.onConfirm - The function to call when the confirm button is clicked
 * @param {ReactNode} props.children - The content to be displayed in the modal
 * @returns {ReactNode} - The Modal component
 */
export function Modal({ isOpen, onClose, onConfirm, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white p-4 rounded-lg max-w-md w-full">
                <div className="mb-4">
                    {children}
                </div>
                <div className="flex justify-end gap-2">
                    <button className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded" onClick={onClose}>Avbryt</button>
                    <button className="bg-brand-base-500 hover:bg-brand-base-600 text-white py-2 px-4 rounded" onClick={onConfirm}>Bekreft</button>
                </div>
            </div>
        </div>
    );
}
