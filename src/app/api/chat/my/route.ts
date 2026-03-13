import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chat = await prisma.chat.findFirst({
            where: {
                customerId: session.user.id,
                status: "ACTIVE"
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        return NextResponse.json(chat || null);
    } catch (error) {
        console.log('[MY_CHAT_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
