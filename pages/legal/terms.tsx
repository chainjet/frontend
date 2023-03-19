import { Card } from 'antd'
import { withApollo } from '../../src/apollo'

function TermsPage() {
  const pdf = 'https://chainjet.s3.us-west-2.amazonaws.com/terms.pdf'
  return (
    <Card>
      <div className="h-screen">
        <div className="flex items-center justify-center w-full h-full">
          <object className="w-full h-full" type="application/pdf" data={`${pdf}#toolbar=0&navpanes=0&scrollbar=0`}>
            <p>
              Your web browser does not have a PDF plugin. Instead you can{' '}
              <a href={pdf}>click here to download the PDF file.</a>
            </p>
          </object>
        </div>
      </div>
    </Card>
  )
}

export default withApollo(TermsPage)
