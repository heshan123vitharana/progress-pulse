/**
 * BigInt serialization utilities
 * Handles safe conversion of BigInt values for JSON responses
 */

/**
 * Recursively converts all BigInt values in an object to strings
 * This is the recommended approach for Next.js API routes
 */
export function serializeBigInt<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'bigint') {
        return String(obj) as T;
    }

    if (obj instanceof Date) {
        return obj.toISOString() as any;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => serializeBigInt(item)) as T;
    }

    if (typeof obj === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            serialized[key] = serializeBigInt(value);
        }
        return serialized;
    }

    return obj;
}

/**
 * Alternative: Use JSON.parse/stringify with replacer
 * Less type-safe but more performant for large objects
 */
export function serializeBigIntFast<T>(obj: T): T {
    return JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
}

/**
 * Convert string IDs back to BigInt for database queries
 */
export function parseToBigInt(value: string | number | null | undefined): bigint | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    try {
        return BigInt(value);
    } catch {
        return null;
    }
}

/**
 * Safe BigInt array conversion
 */
export function parseToBigIntArray(values: (string | number)[]): bigint[] {
    return values
        .map(v => parseToBigInt(v))
        .filter((v): v is bigint => v !== null);
}
