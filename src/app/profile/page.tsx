import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ProfilePage from '@/components/profile/ProfilePage'

export default async function Profile() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get additional data based on role
  let additionalData = {}
  
  if (profile?.role === 'author' || profile?.role === 'admin' || profile?.role === 'editor') {
    // Get author's articles
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        status,
        published_at,
        views,
        likes,
        created_at,
        category:categories!category_id(name, color)
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    additionalData = { ...additionalData, articles: articles || [] }
  }

  if (profile?.role === 'admin' || profile?.role === 'editor') {
    // Get system stats for admins/editors
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
    
    additionalData = { 
      ...additionalData, 
      systemStats: {
        totalArticles: totalArticles || 0,
        totalUsers: totalUsers || 0,
        totalBusinesses: totalBusinesses || 0
      }
    }
  }

  // Get user's businesses if they own any
  const { data: ownedBusinesses } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      industry,
      is_verified,
      rating,
      review_count,
      logo_url,
      created_at
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  additionalData = { ...additionalData, ownedBusinesses: ownedBusinesses || [] }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfilePage 
        user={user} 
        profile={profile} 
        additionalData={additionalData}
      />
    </div>
  )
}