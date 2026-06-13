/** Shared ops → Heroku API settings (NEXT_PUBLIC_* inlined at build time). */
export const OPS_API_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://nexrena-api-5dc54effaa9f.herokuapp.com').replace(
    /\/$/,
    '',
  )

export const OPS_API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
