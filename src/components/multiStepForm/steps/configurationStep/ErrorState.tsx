interface Props {
    message: string;
}

export default function ErrorState({ message }: Props) {
    return (
        <div className="text-center text-red-600 p-8">
            <p className="font-bold">Error loading configuration:</p>
            <p>{message}</p>
            <p className="text-sm text-gray-500 mt-2">Please try again.</p>
        </div>
    );
}

interface DisplayErrorsProps {
    errors: string[];
}

export function DisplayErrors({errors} : DisplayErrorsProps) {
    return (
        errors.map((error, index) => (
                <div key={index} className="text-center text-large text-red-600 p-2 m-1">
                    <p >
                        {error}
                    </p>
                </div>))
    );
}
