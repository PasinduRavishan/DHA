import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage({
    searchParams,
}: {
    searchParams: { id: string };
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                Thank you for your order. We have received it and will start processing it soon.
                Your order ID is <span className="font-mono font-medium text-gray-900">{searchParams.id}</span>.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200"
                >
                    Return Home
                </Link>
                <Link
                    href="/orders"
                    className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
                >
                    View Orders
                </Link>
            </div>
        </div>
    );
}
