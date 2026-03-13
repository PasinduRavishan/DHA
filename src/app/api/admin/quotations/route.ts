import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Create a new quotation
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            subtotal,
            discount,
            discountType,
            totalAmount,
            notes,
            validUntil
        } = body;

        if (!customerName || !items || items.length === 0) {
            return new NextResponse("Customer name and items are required", { status: 400 });
        }

        // Generate quotation number
        const quotationNumber = `QT-${Date.now().toString(36).toUpperCase()}`;

        const quotation = await prisma.quotation.create({
            data: {
                quotationNumber,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                customerAddress: customerAddress || null,
                subtotal,
                discount: discount || 0,
                discountType: discountType || 'fixed',
                totalAmount,
                notes: notes || null,
                validUntil: validUntil ? new Date(validUntil) : null,
                createdById: session.user.id,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId || null,
                        productName: item.productName,
                        description: item.description || null,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        variants: item.variants || null,
                        isCustomItem: item.isCustomItem || false
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(quotation);
    } catch (error) {
        console.log('[QUOTATIONS_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Get all quotations
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const quotations = await prisma.quotation.findMany({
            where: {
                ...(status && status !== 'all' && { status: status as any }),
                ...(search && {
                    OR: [
                        { quotationNumber: { contains: search, mode: 'insensitive' } },
                        { customerName: { contains: search, mode: 'insensitive' } },
                        { customerEmail: { contains: search, mode: 'insensitive' } }
                    ]
                })
            },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(quotations);
    } catch (error) {
        console.log('[QUOTATIONS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
