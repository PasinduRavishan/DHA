'use server';

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const session = await getServerSession(authOptions);

    // Verify Admin
    if (session?.user?.role !== "ADMIN") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus as any } // Cast to any to avoid enum strictness issues if types aren't perfectly aligned in this context, or import OrderStatus enum
        });

        // Revalidate pages
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        revalidatePath('/admin'); // Update dashboard counts if needed

        return { success: true, message: "Order status updated successfully" };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, message: "Failed to update status" };
    }
}
