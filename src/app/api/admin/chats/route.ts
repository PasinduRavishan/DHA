import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chats = await prisma.chat.findMany({
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(chats);
    } catch (error) {
        console.log('[ADMIN_CHATS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
