const headerHtml = require('../../public/dist/navbar.html')

export function LandingHeader() {
  return <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
}
