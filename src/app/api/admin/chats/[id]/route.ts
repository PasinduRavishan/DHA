import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chat = await prisma.chat.findUnique({
            where: { id },
            include: {
                customer: true,
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!chat) {
            return new NextResponse("Chat not found", { status: 404 });
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.log('[ADMIN_CHAT_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
