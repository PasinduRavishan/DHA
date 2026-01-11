import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { items, guestInfo } = body;

        if (!items || items.length === 0) {
            return new NextResponse("No items in cart", { status: 400 });
        }

        const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);

        const orderData: any = {
            orderNumber: `ORD-${Date.now()}`,
            totalAmount,
            status: 'PENDING',
            orderType: 'CART',
            items: {
                create: items.map((item: any) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    variants: item.selectedVariants || undefined
                }))
            }
        };

        if (session?.user?.id) {
            orderData.userId = session.user.id;
        } else {
            // Guest Checkout
            if (!guestInfo?.name || !guestInfo?.email || !guestInfo?.phone) {
                return new NextResponse("Guest details required", { status: 400 });
            }
            orderData.guestName = guestInfo.name;
            orderData.guestEmail = guestInfo.email;
            orderData.guestPhone = guestInfo.phone;
        }

        const order = await prisma.order.create({
            data: orderData
        });

        return NextResponse.json(order);
    } catch (error) {
        console.log('[ORDER_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
