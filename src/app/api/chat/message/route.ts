import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // For now, require login. Guest chat can be added later if needed.
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { message, chatId, metadata, attachments } = body;

        if (!message && (!attachments || attachments.length === 0)) {
            return new NextResponse("Message or attachment required", { status: 400 });
        }

        let targetChatId = chatId;

        // If USER (Customer) and no chatId, find/create their active chat
        if (session.user.role !== "ADMIN") {
            if (!targetChatId) {
                // Find existing active chat
                let chat = await prisma.chat.findFirst({
                    where: {
                        customerId: session.user.id,
                        status: "ACTIVE"
                    }
                });

                // Create if none
                if (!chat) {
                    chat = await prisma.chat.create({
                        data: {
                            customerId: session.user.id,
                            status: "ACTIVE"
                        }
                    });
                }
                targetChatId = chat.id;
            } else {
                // Validate ownership
                const chat = await prisma.chat.findUnique({
                    where: { id: targetChatId }
                });
                if (!chat || chat.customerId !== session.user.id) {
                    return new NextResponse("Forbidden", { status: 403 });
                }
            }
        } else {
            // ADMIN must provide chatId
            if (!targetChatId) {
                return new NextResponse("Chat ID required for Admin", { status: 400 });
            }
        }

        const newMessage = await prisma.message.create({
            data: {
                chatId: targetChatId,
                senderId: session.user.id,
                message: message || '',
                isAdmin: session.user.role === "ADMIN",
                ...(metadata && { metadata }),
                ...(attachments && { attachments })
            }
        });

        // Emit real-time event via Socket.io
        try {
            const io = (global as any).io;
            if (io) {
                // Emit to the specific chat room
                io.to(`chat:${targetChatId}`).emit('new-message', newMessage);

                // Notify admin room about new customer messages
                if (session.user.role !== "ADMIN") {
                    io.to('admin-room').emit('chat-updated', {
                        chatId: targetChatId,
                        message: newMessage
                    });
                }
            }
        } catch (socketError) {
            console.error('Socket emit error:', socketError);
            // Don't fail the request if socket fails
        }

        return NextResponse.json(newMessage);

    } catch (error) {
        console.log('[MESSAGE_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
