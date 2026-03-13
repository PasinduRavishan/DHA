import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BathroomProductForm from "@/components/admin/BathroomProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AddBathroomFittingPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="bg-background dark:bg-black min-h-screen relative pb-20">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 to-transparent pointer-events-none"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center text-sm font-bold text-secondary-500 hover:text-primary-600 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-foreground dark:text-white tracking-tight">Add Bathroom Fitting</h1>
                    <p className="text-secondary-500 dark:text-zinc-400 mt-2">Create a new listing for the Bathroom collection.</p>
                </div>

                <BathroomProductForm categories={categories} />
            </div>
        </div>
    );
}
