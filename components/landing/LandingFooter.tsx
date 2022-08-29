const footerHtml: string = require('../../public/dist/footer.html')

export function LandingFooter() {
  return <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
}
