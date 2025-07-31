import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-wide py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It may have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go Back Home
          </Link>
          
          <div className="text-gray-500">
            <p>Or try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link href="/newsletter" className="text-blue-600 hover:text-blue-700">Newsletter</Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact</Link>
              <Link href="/about" className="text-blue-600 hover:text-blue-700">About</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}