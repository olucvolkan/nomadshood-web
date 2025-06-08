export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function createColivingSlug(name: string, id?: string): string {
  const slug = slugify(name);
  return slug || `coliving-${id}`; // Fallback to ID if name doesn't create valid slug
} 