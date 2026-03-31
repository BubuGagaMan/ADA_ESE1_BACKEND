export function getErrorReturn(err: unknown, unknownErrMessage: string) {
    const status = (err instanceof Error && (err.cause as any)?.status) || 500
    const message = err instanceof Error ? err.message : unknownErrMessage

    return {
        data: null,
        status,
        message,
    }
}
