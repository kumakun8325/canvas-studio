/**
 * Returns a greeting message
 * @param name - Optional name to greet
 * @returns Greeting message in format "Hello, {name}!" or "Hello, World!" if name is empty/undefined
 */
export function hello(name?: string): string {
  if (name && name.trim() !== '') {
    return `Hello, ${name}!`;
  }
  return 'Hello, World!';
}
