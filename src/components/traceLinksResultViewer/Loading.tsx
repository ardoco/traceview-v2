interface LoadingMessageProps {
    title: string;
}

export default function LoadingMessage({title}: LoadingMessageProps) {
    return (
        <div className="flex justify-center items-center h-full text-gray-500">
            {title}
        </div>
    );
}

interface ErrorMessageProps {
    error: string;
}

export function ErrorMessage({error}: ErrorMessageProps) {
    return (
        <div className="flex justify-center items-center h-full text-red-500">
            An error occurred: ${error}
        </div>
    );
}

