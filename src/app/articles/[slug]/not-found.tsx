import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-8">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Article Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          The article you're looking for doesn't exist or may have been removed. 
          It might have been moved or the URL might be incorrect.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/articles"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse All Articles
          </Link>

          <div className="text-gray-500">
            <p>Or try these popular sections:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link href="/category/local-news" className="text-blue-600 hover:text-blue-700">Local News</Link>
              <Link href="/category/business" className="text-blue-600 hover:text-blue-700">Business</Link>
              <Link href="/category/sports" className="text-blue-600 hover:text-blue-700">Sports</Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}