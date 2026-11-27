/** Current time in ms. Server components render per request, so reading the clock here is intentional. */
export const nowMs = () => Date.now();
