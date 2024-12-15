import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="text-center">
                <h1 className="text-4xl mb-8 text-white">Homepage</h1>

                {/* Container surrounding the link buttons */}
                <div className="grid grid-cols-2 gap-4 p-4 items-center justify-center max-w-md">
                    {/* Link to the ArDoCo Website */}
                    <Link href="https://ardoco.de/">
                        <div className="bg-gradient-to-r
                        from-teal-100 to-blue-400 hover:from-gray-50 hover:to-gray-50 hover:outline hover:outline-4 flex items-center rounded-md px-10 py-4 cursor-pointer">
                            About ArDoCo
                        </div>
                    </Link>

                    {/* Link to the upload page */}
                    <Link href="/upload">
                        <div className="bg-gray-50 hover:bg-gray-100 hover:outline-6 flex items-center rounded-md px-10 py-4 border cursor-pointer">
                            <span className="mr-2">Start</span>
                            <ArrowRightIcon height={20} width={20} fill="black" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
