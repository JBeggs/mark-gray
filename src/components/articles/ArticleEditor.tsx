'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Edit3, Save, X, Eye, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface ArticleEditorProps {
  article: {
    id: string
    title: string
    subtitle?: string
    content: string
    excerpt?: string
    featured_image_url?: string
    author_id: string
    status: string
  }
}

export default function ArticleEditor({ article }: ArticleEditorProps) {
  const { user, profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState({
    title: article.title,
    subtitle: article.subtitle || '',
    content: article.content,
    excerpt: article.excerpt || '',
    featured_image_url: article.featured_image_url || ''
  })

  // Check if user can edit this article
  const canEdit = user && profile && (
    profile.role === 'admin' || 
    profile.role === 'editor' || 
    profile.id === article.author_id
  )

  if (!canEdit) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('articles')
        .update({
          title: editData.title,
          subtitle: editData.subtitle || null,
          content: editData.content,
          excerpt: editData.excerpt || null,
          featured_image_url: editData.featured_image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id)

      if (error) {
        console.error('Error updating article:', error)
        alert('Error saving article. Please try again.')
        return
      }

      // Refresh the page to show updated content
      window.location.reload()
      
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Error saving article. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      excerpt: article.excerpt || '',
      featured_image_url: article.featured_image_url || ''
    })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
      >
        <Edit3 className="w-4 h-4" />
        <span>Edit Article</span>
      </button>
    )
  }

  return (
    <>
      {/* Edit Mode Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Article</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Edit Form */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                  placeholder="Enter article title..."
                />
              </div>

              {/* Subtitle */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={editData.subtitle}
                  onChange={(e) => setEditData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter article subtitle..."
                />
              </div>

              {/* Featured Image URL */}
              <div>
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL (Optional)
                </label>
                <input
                  id="featured_image"
                  type="url"
                  value={editData.featured_image_url}
                  onChange={(e) => setEditData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Excerpt
                </label>
                <textarea
                  id="excerpt"
                  value={editData.excerpt}
                  onChange={(e) => setEditData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  placeholder="Brief summary of the article..."
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Content
                </label>
                <textarea
                  id="content"
                  value={editData.content}
                  onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
                  placeholder="Write your article content here... You can use HTML tags for formatting."
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 Tip: You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt; for formatting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}