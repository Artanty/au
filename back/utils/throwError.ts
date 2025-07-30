export const err = (error: unknown) => {
	const errorText = ensureErr(error)
	throw new Error(errorText)
}

export const ensureErr = (error: unknown): string => {
	return error instanceof Error 
		? error.message 
		: String(error)
}