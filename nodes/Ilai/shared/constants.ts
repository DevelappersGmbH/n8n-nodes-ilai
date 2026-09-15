/**
 * The ILAI cockpit is deployed per tenant, so the base URL is part of the credentials.
 * Trailing slashes are stripped to keep the resulting request URLs free of double slashes.
 */
export const BASE_URL_EXPRESSION = '={{ $credentials.baseUrl.replace(/\\/+$/, "") }}';

/** Page size used when "Return All" is enabled on paginated endpoints. */
export const PAGE_SIZE = 250;
