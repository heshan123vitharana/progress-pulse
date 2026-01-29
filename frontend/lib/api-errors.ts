import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
}

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
}

/**
 * Centralized error handler for API routes
 * Handles different error types and returns consistent responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
    // Log error for debugging
    console.error('[API Error]', error);

    // Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                success: false,
                message: 'Validation failed',
                errors: error.flatten().fieldErrors as Record<string, string[]>,
                code: 'VALIDATION_ERROR'
            },
            { status: 422 }
        );
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'A record with this value already exists',
                    code: 'DUPLICATE_RECORD'
                },
                { status: 409 }
            );
        }

        // Foreign key constraint violation
        if (error.code === 'P2003') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid reference to related record',
                    code: 'INVALID_REFERENCE'
                },
                { status: 400 }
            );
        }

        // Record not found
        if (error.code === 'P2025') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Record not found',
                    code: 'NOT_FOUND'
                },
                { status: 404 }
            );
        }
    }

    // Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid data provided to database',
                code: 'DATABASE_VALIDATION_ERROR'
            },
            { status: 400 }
        );
    }

    // Generic errors
    if (error instanceof Error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
                code: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }

    // Unknown error
    return NextResponse.json(
        {
            success: false,
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
        },
        { status: 500 }
    );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
    data: T,
    message?: string,
    status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            ...(message && { message })
        },
        { status }
    );
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
    message: string,
    status: number = 400,
    errors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
        {
            success: false,
            message,
            ...(errors && { errors })
        },
        { status }
    );
}
