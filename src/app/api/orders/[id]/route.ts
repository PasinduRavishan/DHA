import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                category: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // Security: Only allow user to view their own orders (or admin)
        if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.log('[ORDER_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
