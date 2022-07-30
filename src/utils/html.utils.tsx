
export function getHeadMetatags (
  { path, title, description, image = '/logo.svg' }: { path: string; title: string; description: string; image?: string }
) {
  const url = process.env.ENDPOINT + path
  let imageUrl = image
  if (imageUrl?.startsWith('/')) {
    imageUrl = process.env.ENDPOINT + image
  }

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description}/>
      <meta property="og:title" content={title}/>
      <meta property="og:description" content={description}/>
      <meta property="og:image" content={imageUrl}/>
      <link rel="canonical" href={url}/>
      <meta property="og:type" content="website" />
    </>
  )
}
