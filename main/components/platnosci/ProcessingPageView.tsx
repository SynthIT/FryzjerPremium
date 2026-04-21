import { Loader2 } from "lucide-react";

export default function ProcessingPageView() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Processing</h1>
            <p className="text-gray-500">
                Prosimy o cierpliwość, trwa weryfikacji płatności.
            </p>
            <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 text-gray-900" />
            </div>
        </div>
    )
}