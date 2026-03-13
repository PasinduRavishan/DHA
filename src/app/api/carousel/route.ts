import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET all carousel slides for a specific page
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const pageType = searchParams.get('pageType');

        const where = pageType ? { pageType: pageType as any, isActive: true } : { isActive: true };

        const slides = await prisma.carouselSlide.findMany({
            where,
            orderBy: {
                order: 'asc'
            }
        });

        return NextResponse.json(slides);
    } catch (error) {
        console.error('Error fetching carousel slides:', error);
        return NextResponse.json(
            { error: 'Failed to fetch carousel slides' },
            { status: 500 }
        );
    }
}

// POST create a new carousel slide (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { pageType, title, subtitle, description, imageUrl, order } = body;

        const slide = await prisma.carouselSlide.create({
            data: {
                pageType,
                title,
                subtitle: subtitle || null,
                description: description || null,
                imageUrl,
                order: order || 0
            }
        });

        return NextResponse.json(slide, { status: 201 });
    } catch (error) {
        console.error('Error creating carousel slide:', error);
        return NextResponse.json(
            { error: 'Failed to create carousel slide' },
            { status: 500 }
        );
    }
}

// PATCH update a carousel slide (Admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, ...data } = body;

        const slide = await prisma.carouselSlide.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(slide);
    } catch (error) {
        console.error('Error updating carousel slide:', error);
        return NextResponse.json(
            { error: 'Failed to update carousel slide' },
            { status: 500 }
        );
    }
}

// DELETE a carousel slide (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Slide ID is required' },
                { status: 400 }
            );
        }

        await prisma.carouselSlide.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting carousel slide:', error);
        return NextResponse.json(
            { error: 'Failed to delete carousel slide' },
            { status: 500 }
        );
    }
}
