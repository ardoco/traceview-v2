interface Props {
    message: string;
}

export default function ErrorState({ message }: Props) {
    return (
        <div className="text-center text-red-500 p-8">
            <p className="font-bold">Error loading configuration:</p>
            <p>{message}</p>
            <p className="text-sm text-gray-500 mt-2">Please try again.</p>
        </div>
    );
}
