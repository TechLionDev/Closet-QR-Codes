const loading = () => {
    return (
        <>
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-sky-600"></div>
                <p className="fixed  text-center font-semibold text-sky-600">Loading...</p>
            </div>
        </>
    );
}

export default loading;