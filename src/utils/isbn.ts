
export function cleanIsbn(query: string): string {
    return query.replace(/\D/g, '');
}

export function isIsbn(query: string): boolean {
    const cleaned = cleanIsbn(query);
    return /^(?:\d{10}|\d{13})$/.test(cleaned);
}
