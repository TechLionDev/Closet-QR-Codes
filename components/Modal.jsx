
function Modal({ isVisible, errorMsg, onClose, children }) {
    if (!isVisible) return;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm' id='wrapper'>
            <div className='w-[600px] flex flex-col'>
                <div className='p-2 bg-white rounded-lg'>
                    <div className="p-4">
                        {children}
                    </div>
                    <div id='errorMsg' className={(!errorMsg ? "hidden " : "") + "p-2 bg-red-300 text-red-800 rounded-md"}>
                        <p className='p-4 font-medium'>{errorMsg}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal