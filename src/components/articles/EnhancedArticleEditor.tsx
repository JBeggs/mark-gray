'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Edit3, Save, X, Eye, Loader2, Calendar, Search
} from 'lucide-react'

// Custom icons not available in lucide-react
const Trash2 = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Upload = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const ImageIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const AlertTriangle = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const Zap = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const Settings = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Hash = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
)

const MapPin = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Users = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1a6 6 0 01-6-6V9a6 6 0 1112 0v6a6 6 0 01-6 6v-1z" />
  </svg>
)

const Plus = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const ChevronLeft = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface ArticleEditorProps {
  article: {
    id: string
    title: string
    subtitle?: string
    content: string
    excerpt?: string
    featured_image_url?: string
    author_id: string
    category_id?: string
    status: string
    content_type?: string
    is_premium?: boolean
    is_breaking_news?: boolean
    is_trending?: boolean
    seo_title?: string
    seo_description?: string
    published_at?: string
    scheduled_for?: string
    location_name?: string
    read_time_minutes?: number
  }
}

type EditorStep = 'basic' | 'content' | 'media' | 'settings' | 'seo' | 'publish'

export default function EnhancedArticleEditor({ article }: ArticleEditorProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState<EditorStep>('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  
  const [editData, setEditData] = useState({
    title: article.title,
    subtitle: article.subtitle || '',
    content: article.content,
    excerpt: article.excerpt || '',
    featured_image_url: article.featured_image_url || '',
    category_id: article.category_id || '',
    status: article.status || 'draft',
    content_type: article.content_type || 'article',
    is_premium: article.is_premium || false,
    is_breaking_news: article.is_breaking_news || false,
    is_trending: article.is_trending || false,
    seo_title: article.seo_title || '',
    seo_description: article.seo_description || '',
    published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
    scheduled_for: article.scheduled_for ? new Date(article.scheduled_for).toISOString().slice(0, 16) : '',
    location_name: article.location_name || '',
    read_time_minutes: article.read_time_minutes || null
  })

  // Check if user can edit this article
  const canEdit = user && profile && (
    profile.role === 'admin' || 
    profile.role === 'editor' || 
    profile.id === article.author_id
  )

  // Load categories and tags
  useEffect(() => {
    if (isEditing) {
      loadCategoriesAndTags()
    }
  }, [isEditing])

  const loadCategoriesAndTags = async () => {
    try {
      const supabase = createClient()
      
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug, color')
        .order('name')
      
      if (categoriesData) {
        setCategories(categoriesData)
      }
      
      // Load available tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('id, name, slug')
        .order('name')
      
      if (tagsData) {
        setAvailableTags(tagsData)
      }
      
      // Load article's current tags
      const { data: articleTags } = await supabase
        .from('article_tags')
        .select('tag_id, tags(id, name, slug)')
        .eq('article_id', article.id)
      
      if (articleTags) {
        const currentTags = articleTags.map(at => (at as any).tags).filter(Boolean)
        setSelectedTags(currentTags)
      }
      
    } catch (error) {
      console.error('Error loading categories and tags:', error)
    }
  }

  const steps: { id: EditorStep; label: string; icon: any }[] = [
    { id: 'basic', label: 'Basic Info', icon: Edit3 },
    { id: 'content', label: 'Content', icon: Hash },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'publish', label: 'Publish', icon: Calendar }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const canGoNext = currentStepIndex < steps.length - 1
  const canGoPrev = currentStepIndex > 0

  if (!canEdit) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const supabase = createClient()
      
      // Prepare update data
      const updateData: any = {
        title: editData.title,
        subtitle: editData.subtitle || null,
        content: editData.content,
        excerpt: editData.excerpt || null,
        featured_image_url: editData.featured_image_url || null,
        category_id: editData.category_id || null,
        status: editData.status,
        content_type: editData.content_type,
        is_premium: editData.is_premium,
        is_breaking_news: editData.is_breaking_news,
        is_trending: editData.is_trending,
        seo_title: editData.seo_title || null,
        seo_description: editData.seo_description || null,
        location_name: editData.location_name || null,
        read_time_minutes: editData.read_time_minutes || null,
        updated_at: new Date().toISOString()
      }
      
      // Handle published_at and scheduled_for
      if (editData.published_at) {
        updateData.published_at = new Date(editData.published_at).toISOString()
      }
      if (editData.scheduled_for) {
        updateData.scheduled_for = new Date(editData.scheduled_for).toISOString()
      }

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', article.id)

      if (error) {
        console.error('Error updating article:', error)
        alert('Error saving article. Please try again.')
        return
      }

      // Update article tags
      await updateArticleTags()

      // Refresh the page to show updated content
      window.location.reload()
      
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Error saving article. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateArticleTags = async () => {
    try {
      const supabase = createClient()
      
      // Delete existing tags
      await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', article.id)
      
      // Insert new tags
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tag => ({
          article_id: article.id,
          tag_id: tag.id
        }))
        
        await supabase
          .from('article_tags')
          .insert(tagInserts)
      }
      
    } catch (error) {
      console.error('Error updating article tags:', error)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      excerpt: article.excerpt || '',
      featured_image_url: article.featured_image_url || '',
      category_id: article.category_id || '',
      status: article.status || 'draft',
      content_type: article.content_type || 'article',
      is_premium: article.is_premium || false,
      is_breaking_news: article.is_breaking_news || false,
      is_trending: article.is_trending || false,
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
      scheduled_for: article.scheduled_for ? new Date(article.scheduled_for).toISOString().slice(0, 16) : '',
      location_name: article.location_name || '',
      read_time_minutes: article.read_time_minutes || null
    })
    setCurrentStep('basic')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id)

      if (error) {
        console.error('Error deleting article:', error)
        alert('Error deleting article. Please try again.')
        return
      }

      router.push('/articles')
      
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Error deleting article. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `article-${article.id}-${Date.now()}.${fileExt}`
      const filePath = `articles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        alert('Error uploading image. Please try again.')
        return
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setEditData(prev => ({
        ...prev,
        featured_image_url: data.publicUrl
      }))

    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const addTag = async () => {
    if (!newTagName.trim()) return
    
    try {
      const supabase = createClient()
      const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          slug: slug
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating tag:', error)
        return
      }
      
      const newTag = data as Tag
      setAvailableTags(prev => [...prev, newTag])
      setSelectedTags(prev => [...prev, newTag])
      setNewTagName('')
      
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id)
      if (exists) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  if (!isEditing) {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Article</span>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Article</span>
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Article
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete "{article.title}"? This action cannot be undone.
                </p>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                placeholder="Enter article title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editData.subtitle}
                onChange={(e) => setEditData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter article subtitle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editData.category_id}
                onChange={(e) => setEditData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={editData.content_type}
                onChange={(e) => setEditData(prev => ({ ...prev, content_type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="article">Article</option>
                <option value="gallery">Gallery</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="live_blog">Live Blog</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Excerpt
              </label>
              <textarea
                value={editData.excerpt}
                onChange={(e) => setEditData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Brief summary of the article..."
              />
            </div>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <textarea
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                rows={window.innerWidth < 640 ? 15 : 20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
                placeholder="Write your article content here..."
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt; for formatting.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reading Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={editData.read_time_minutes || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, read_time_minutes: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Estimated reading time..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={editData.location_name}
                onChange={(e) => setEditData(prev => ({ ...prev, location_name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Cape Town, South Africa"
              />
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              
              {editData.featured_image_url && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={editData.featured_image_url}
                      alt="Featured image preview"
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg'
                      }}
                    />
                    <button
                      onClick={() => setEditData(prev => ({ ...prev, featured_image_url: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </>
                  )}
                </button>
                
                <span className="text-sm text-gray-500">or</span>
              </div>

              <input
                type="url"
                value={editData.featured_image_url}
                onChange={(e) => setEditData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL..."
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Article Flags</h3>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editData.is_premium}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_premium: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Premium Content</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editData.is_breaking_news}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_breaking_news: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Breaking News</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editData.is_trending}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_trending: e.target.checked }))}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Trending</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {tag.name}
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Add new tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {availableTags.length > 0 && (
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <div className="flex flex-wrap gap-1">
                    {availableTags.filter(tag => !selectedTags.find(st => st.id === tag.id)).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag)}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'seo':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={editData.seo_title}
                onChange={(e) => setEditData(prev => ({ ...prev, seo_title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Custom title for search engines..."
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty to use article title</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                value={editData.seo_description}
                onChange={(e) => setEditData(prev => ({ ...prev, seo_description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Description for search engine results..."
              />
              <p className="mt-1 text-sm text-gray-500">Recommended: 150-160 characters</p>
            </div>
          </div>
        )

      case 'publish':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={editData.published_at}
                onChange={(e) => setEditData(prev => ({ ...prev, published_at: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty for current date when publishing</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule For Later
              </label>
              <input
                type="datetime-local"
                value={editData.scheduled_for}
                onChange={(e) => setEditData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Set a future date to schedule publishing</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Publishing Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Status:</span> {editData.status}</p>
                <p><span className="font-medium">Category:</span> {categories.find(c => c.id === editData.category_id)?.name || 'None'}</p>
                <p><span className="font-medium">Tags:</span> {selectedTags.length > 0 ? selectedTags.map(t => t.name).join(', ') : 'None'}</p>
                <p><span className="font-medium">Content Type:</span> {editData.content_type}</p>
                {editData.is_premium && <p className="text-amber-600">⭐ Premium Content</p>}
                {editData.is_breaking_news && <p className="text-red-600">🚨 Breaking News</p>}
                {editData.is_trending && <p className="text-orange-600">📈 Trending</p>}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* Mobile-Friendly Edit Mode */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center sm:pt-10 sm:px-4">
        <div className="bg-white w-full h-full sm:rounded-xl sm:shadow-2xl sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Article</h2>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 overflow-x-auto pb-2 sm:pb-0">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = step.id === currentStep
                  const isCompleted = index < currentStepIndex
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : isCompleted 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  )
                })}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex - 1].id)}
                  disabled={!canGoPrev}
                  className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex + 1].id)}
                  disabled={!canGoNext}
                  className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {renderStepContent()}
          </div>
          
          {/* Mobile Navigation Footer */}
          <div className="sm:hidden px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between">
            <button
              onClick={() => canGoPrev && setCurrentStep(steps[currentStepIndex - 1].id)}
              disabled={!canGoPrev}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <span className="flex items-center text-sm text-gray-500">
              {currentStepIndex + 1} of {steps.length}
            </span>
            
            <button
              onClick={() => canGoNext && setCurrentStep(steps[currentStepIndex + 1].id)}
              disabled={!canGoNext}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}