export function getHeadMetatags({
  path,
  title,
  description,
  image = '/logo.svg',
}: {
  path: string
  title: string
  description: string
  image?: string | null
}) {
  const url = process.env.NEXT_PUBLIC_FRONTEND_ENDPOINT + path
  let imageUrl = image
  if (imageUrl?.startsWith('/')) {
    imageUrl = process.env.NEXT_PUBLIC_FRONTEND_ENDPOINT! + image
  }

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="twitter:title" content={title} />
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta property="twitter:description" content={description} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
    </>
  )
}
