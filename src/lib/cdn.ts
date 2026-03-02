const CDN = import.meta.env.VITE_CDN_URL as string

export const originalUrl = (key: string) => `${CDN}/files/${key}`
export const styledUrl = (slug: string, key: string) => `${CDN}/styles/${slug}/${key}`
export const signedUrl = (token: string, expires: number, key: string) =>
  `${CDN}/secure/${token}/${expires}/${key}`
