export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="flex flex-col items-center">
                {/* Moving Wheels */}
                <div className="flex gap-4">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                    <div className="w-12 h-12 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin delay-200"></div>
                    <div className="w-12 h-12 border-4 border-t-red-500 border-gray-200 rounded-full animate-spin delay-400"></div>
                </div>
                {/* Loading Text */}
                <p className="mt-4 text-white text-lg">Loading, this might take a view minutes...</p>
            </div>
        </div>
    );
}