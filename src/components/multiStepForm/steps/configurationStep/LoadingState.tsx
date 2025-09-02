export default function LoadingState() {
    return (
        <div className="text-center text-gray-600 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading TraceLink Configuration...</p>
        </div>
    );
}
