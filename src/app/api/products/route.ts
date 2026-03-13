import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, description, category, price, stock, images, type, variants } = body;

        // TODO: Add validation with Zod

        const product = await prisma.product.create({
            data: {
                name,
                description,
                category,
                price,
                stock,
                images,
                type,
                variants,
                createdBy: session.user.id
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log('[PRODUCTS_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');

        const products = await prisma.product.findMany({
            where: {
                ...(category && { category }),
                ...(type && {
                    OR: [
                        { type: type as any },
                        { type: 'BOTH' }
                    ]
                }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
