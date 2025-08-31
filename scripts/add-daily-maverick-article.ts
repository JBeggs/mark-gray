import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface DailyMaverickArticle {
  title: string
  content: string
  excerpt: string
  author: string
  published_at: string
  featured_image_url?: string
}

async function scrapeDailyMaverickArticle(url: string): Promise<DailyMaverickArticle> {
  console.log(`Scraping Daily Maverick article: ${url}`)
  
  // Use proper headers to avoid being blocked
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const html = await response.text()
  console.log(`📄 HTML length: ${html.length} characters`)
  
  // Check if we got actual content or just scripts
  if (html.length < 5000 || !html.includes('<body')) {
    console.log('⚠️  Warning: Got minimal HTML, likely blocked or JavaScript-rendered content')
    console.log(`📄 HTML preview: ${html.substring(0, 500)}...`)
  }
  
  // Extract title - Daily Maverick has multiple title patterns
  const titlePatterns = [
    /<h1[^>]*class="[^"]*headline[^"]*"[^>]*>(.*?)<\/h1>/i,
    /<h1[^>]*>(.*?)<\/h1>/i,
    /<title[^>]*>(.*?)<\/title>/i
  ]
  
  let rawTitle = 'Untitled Article'
  for (const pattern of titlePatterns) {
    const match = html.match(pattern)
    if (match) {
      rawTitle = match[1].replace(/<[^>]*>/g, '').replace(/\s*\|\s*Daily Maverick\s*$/i, '').trim()
      if (rawTitle && rawTitle !== 'Daily Maverick') break
    }
  }
  
  // Clean and decode HTML entities in title
  const title = rawTitle
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()

  // Extract author - Daily Maverick specific patterns
  const authorPatterns = [
    /By\s+([A-Za-z\s]+?)\s+Follow/i,
    /By\s+<[^>]*>([^<]+)<\/[^>]*>/i,
    /By\s+([A-Za-z\s]+?)(?:\s|<)/i,
    /"author"[^>]*>([^<]+)<\/[^>]*>/i,
    /class="[^"]*author[^"]*"[^>]*>([^<]+)</i
  ]
  
  let author = 'Daily Maverick Staff'
  for (const pattern of authorPatterns) {
    const match = html.match(pattern)
    if (match) {
      const extractedAuthor = match[1].replace(/<[^>]*>/g, '').trim()
      // Filter out common false matches
      if (extractedAuthor && 
          extractedAuthor !== 'Follow' && 
          extractedAuthor.length > 3 && 
          !extractedAuthor.includes('fontawesome') &&
          !extractedAuthor.includes('License') &&
          !extractedAuthor.includes('http')) {
        author = extractedAuthor
        break
      }
    }
  }

  // Extract published date - look for date patterns
  const datePatterns = [
    /(\d{1,2}\s+\w+\s+\d{4})/,
    /"datePublished"[^>]*"([^"]+)"/,
    /"publishedTime"[^>]*"([^"]+)"/,
    /published[^>]*>([^<]+)</i
  ]
  
  let publishedDate = new Date().toISOString()
  for (const pattern of datePatterns) {
    const match = html.match(pattern)
    if (match) {
      try {
        const parsed = new Date(match[1])
        if (!isNaN(parsed.getTime())) {
          publishedDate = parsed.toISOString()
          break
        }
      } catch (e) {
        // Continue to next pattern if parsing fails
      }
    }
  }

  // Extract main content - Daily Maverick specific patterns based on actual HTML structure
  const contentPatterns = [
    // Daily Maverick 2025 current structure - the CORRECT content div
    /<div[^>]*class="[^"]*mode-content article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gim,
    // Tab panel structure (more specific)
    /<div[^>]*id="long-form"[^>]*>([\s\S]*?)<div[^>]*id="post-article-footer"/gim,
    /<div[^>]*id="long-form"[^>]*>([\s\S]*?)<\/div>/gim,
    // Try the tab content wrapper
    /<div[^>]*class="[^"]*tab-content[^"]*"[^>]*>.*?<div[^>]*class="[^"]*mode-content article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Fallback patterns - put the wrong one last
    /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*content-area[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<main[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/main>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi
  ]
  
  let rawContent = ''
  let usedPattern = 'none'
  
  for (const pattern of contentPatterns) {
    const match = html.match(pattern)
    if (match) {
      rawContent = match[1]
      usedPattern = pattern.toString()
      console.log(`   📄 Found content using pattern: ${usedPattern.substring(0, 50)}...`)
      console.log(`   📄 Raw content length: ${rawContent.length} characters`)
      console.log(`   📄 Raw content preview: "${rawContent.substring(0, 300).replace(/\s+/g, ' ').trim()}..."`)
      break
    }
  }
  
  // If no content container found, try to extract clean paragraphs
  if (!rawContent) {
    console.log('   📄 No content container found, extracting paragraphs...')
    
    // Look for paragraphs that are likely article content
    const allParagraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || []
    console.log(`   📄 Found ${allParagraphs.length} total paragraphs`)
    
    const cleanParagraphs = allParagraphs.filter(p => {
      const text = p.replace(/<[^>]*>/g, '').trim()
      // Filter out likely non-content paragraphs
      const isValid = text.length > 30 && 
             !text.includes('code has been sent') &&
             !text.includes('Open in Gmail') &&
             !text.includes('Continue with') &&
             !text.includes('Remember Me') &&
             !text.includes('Forgot Password') &&
             !text.includes('Remove ads') &&
             !text.includes('Don\'t want to see this') &&
             !text.includes('Subscribe to') &&
             !text.includes('Follow us') &&
             !text.includes('Share this') &&
             !text.includes('SPOTLIGHT OP-ED') &&
             !text.match(/^\s*By\s+[\w\s-]+\s*$/) &&
             !text.match(/advertisement/i) &&
             !text.match(/^[\w\s-]+\s+By\s+[\w\s-]+\s+[\w\s-]+$/i) // Title + By + Author + Title again
      
      if (!isValid && text.length > 20) {
        console.log(`   🗑️  Filtered out: "${text.substring(0, 60)}..."`)
      }
      
      return isValid
    })
    
    console.log(`   📄 After filtering: ${cleanParagraphs.length} clean paragraphs`)
    
    if (cleanParagraphs.length > 0) {
      rawContent = cleanParagraphs.slice(0, 15).join('\n')
      console.log(`   📄 Using first paragraph content: "${cleanParagraphs[0].replace(/<[^>]*>/g, '').substring(0, 100)}..."`)
    }
  }
  
  // Clean content and decode HTML entities - Daily Maverick specific cleaning
  console.log(`   🧹 Starting cleanup of ${rawContent.length} chars...`)
  const content = rawContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // Daily Maverick specific ad removal
    .replace(/<div[^>]*class="[^"]*dm_add_wrapper[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*ad-control-link[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*advertisement[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="[^"]*DM-GAM[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/Don't want to see this\?\s*<a[^>]*>Remove ads<\/a>/gi, '')
    // Comments section removal
    .replace(/<div[^>]*class="[^"]*comments_template[^"]*"[^>]*>[\s\S]*$/gi, '')
    .replace(/<div[^>]*class="[^"]*comment-form-holder[^"]*"[^>]*>[\s\S]*$/gi, '')
    .replace(/<ul[^>]*class="[^"]*comment-list[^"]*"[^>]*>[\s\S]*$/gi, '')
    // Gallery and post footer removal
    .replace(/<div[^>]*class="[^"]*post_gallery[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="post-article-footer"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*article-tags[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Auth and form cleanup
    .replace(/<div[^>]*class="[^"]*auth[^"]*"[^>]*>.*?<\/div>/gi, '')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[^>]*>.*?<\/button>/gi, '')
    // Social and navigation cleanup
    .replace(/A code has been sent to[^.]*\./gi, '')
    .replace(/Please check your email and enter your one time pin below:/gi, '')
    .replace(/Open in Gmail/gi, '')
    .replace(/Continue with Facebook/gi, '')
    .replace(/Continue with Google/gi, '')
    .replace(/Remember Me/gi, '')
    .replace(/Forgot Password\?/gi, '')
    .replace(/Sorry there was an error loading the audio\./gi, '')
    .replace(/advertisement\s*Don't want to see this\?\s*Remove ads/gi, '')
    .replace(/Don't want to see this\?\s*Remove ads/gi, '')
    .replace(/&nbsp;/gi, ' ')
    // Clean HTML tags while preserving paragraph structure temporarily
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    // Decode HTML entities
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()

  console.log(`   🧹 After HTML cleanup: ${content.length} chars`)
  console.log(`   📄 After cleanup preview: "${content.substring(0, 200)}..."`)

  // Final cleanup - remove any remaining junk patterns at start of content
  console.log(`   🧹 Starting final line filtering...`)
  const lines = content.split('\n')
  console.log(`   📄 Total lines to filter: ${lines.length}`)
  
  const cleanedContent = lines
    .filter((line, index) => {
      const trimmed = line.trim()
      
      // Skip empty or very short lines
      if (trimmed.length <= 10) {
        return false
      }
      
      // Remove obvious junk patterns (be more conservative)
      const isJunk = trimmed.includes('A code has been sent') ||
             trimmed.includes('Please check your email') ||
             trimmed.includes('Open in Gmail') ||
             trimmed.includes('Continue with Facebook') ||
             trimmed.includes('Continue with Google') ||
             trimmed.includes('Remember Me') ||
             trimmed.includes('Forgot Password') ||
             trimmed.includes('Sorry there was an error loading') ||
             trimmed.includes('SPOTLIGHT OP-ED') ||
             // Only filter standalone bylines, not content with bylines
             trimmed.match(/^By\s+[\w\s-]+\s*$/i) ||
             // Only filter obvious ads
             trimmed.match(/^advertisement$/i) ||
             trimmed.includes("Don't want to see this") ||
             trimmed.includes("Remove ads")
      
      if (isJunk && trimmed.length > 20) {
        console.log(`   🗑️  Filtered junk: "${trimmed.substring(0, 60)}..."`)
      }
      
      return !isJunk
    })
    .join('\n')
    .trim()
    
  console.log(`   📄 Lines after filtering: ${cleanedContent.split('\n').length}`)
    
  console.log(`   📄 Final content length: ${cleanedContent.length} characters`)
  if (cleanedContent.length < 100) {
    console.log(`   ⚠️  Warning: Very short content extracted!`)
    console.log(`   📄 Content preview: "${cleanedContent.substring(0, 200)}"`)
    
    // If we got almost no content, throw an error with helpful info
    if (cleanedContent.length < 50) {
      console.error('❌ Failed to extract meaningful content from Daily Maverick')
      console.error('💡 This could happen because:')
      console.error('   - Daily Maverick is blocking scrapers')
      console.error('   - Content is loaded dynamically with JavaScript')
      console.error('   - URL is incorrect or article is behind paywall')
      console.error('   - Article has been moved or deleted')
      console.error('')
      console.error('🔧 Try these solutions:')
      console.error('   1. Verify the URL in a browser first')
      console.error('   2. Check if article requires subscription')
      console.error('   3. Try copying and pasting article content manually')
      
      throw new Error(`Unable to extract content from Daily Maverick article. Got only ${cleanedContent.length} characters of text.`)
    }
  }

  // Create excerpt from cleaned content
  const excerpt = cleanedContent.substring(0, 200).trim() + (cleanedContent.length > 200 ? '...' : '')

  // Extract featured image
  const imagePatterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
    /<meta[^>]*property="twitter:image"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"[^>]*>/i
  ]
  
  let featuredImageUrl: string | undefined
  for (const pattern of imagePatterns) {
    const match = html.match(pattern)
    if (match && match[1] && !match[1].includes('logo') && !match[1].includes('icon')) {
      featuredImageUrl = match[1].startsWith('http') ? match[1] : `https://www.dailymaverick.co.za${match[1]}`
      break
    }
  }

  return {
    title,
    content: cleanedContent,
    excerpt,
    author,
    published_at: publishedDate,
    featured_image_url: featuredImageUrl
  }
}

async function addDailyMaverickArticle(articleData: DailyMaverickArticle, sourceUrl: string) {
  console.log(`Adding article: ${articleData.title}`)
  
  // Get Mark Grey as the article author (admin who can author articles)
  const { data: markGrey } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', 'mark.grey@example.com')
    .single()

  if (!markGrey) {
    console.error('❌ Mark Grey (mark.grey@example.com) not found.')
    console.error('   Please run: npx tsx scripts/add-test-users.ts first')
    throw new Error('Mark Grey not found')
  }

  console.log(`👤 Using author: ${markGrey.full_name} (${markGrey.email})`)
  const authorId = markGrey.id

  // Get Politics category (or create if it doesn't exist)
  let categoryId: string
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'politics')
    .single()

  if (existingCategory) {
    categoryId = existingCategory.id
  } else {
    const { data: newCategory, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: 'Politics',
        slug: 'politics',
        description: 'Political news and analysis'
      })
      .select('id')
      .single()

    if (categoryError) {
      console.error('Error creating category:', categoryError)
      throw categoryError
    }
    
    categoryId = newCategory.id
  }

  // Create article slug from title
  const slug = articleData.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)

  // Preserve original author in content
  const contentWithByline = `By ${articleData.author}\n\n${articleData.content}`

  // Insert article
  const articlePayload = {
    title: articleData.title,
    slug,
    content: contentWithByline,
    excerpt: articleData.excerpt,
    author_id: authorId,
    category_id: categoryId,
    published_at: articleData.published_at,
    status: 'published',
    featured_image_url: articleData.featured_image_url || null,
    views: 0
  }

  const { data: article, error: articleError } = await supabase
    .from('articles')
    .insert(articlePayload)
    .select()
    .single()

  if (articleError) {
    console.error('Error creating article:', articleError)
    throw articleError
  }

  console.log(`✅ Successfully added Daily Maverick article: "${articleData.title}"`)
  console.log(`   Original Author: ${articleData.author}`)
  console.log(`   Published: ${new Date(articleData.published_at).toLocaleDateString()}`)
  console.log(`   Slug: ${slug}`)
  if (articleData.featured_image_url) {
    console.log(`   Featured Image: ${articleData.featured_image_url}`)
  }
  console.log(`   Note: Article byline preserved in content, but database author is Mark Grey`)
  
  return article
}

async function main() {
  try {
    // Get URLs from command line arguments or use default
    const urls = process.argv.slice(2)
    
    if (urls.length === 0) {
      console.log('No URLs provided. Usage: npx tsx scripts/add-daily-maverick-article.ts <url1> [url2] [url3] ...')
      console.log('Example: npx tsx scripts/add-daily-maverick-article.ts "https://www.dailymaverick.co.za/article/2025-07-31-cachalia-to-be-sworn-in-as-police-minister-after-concourt-dismisses-zuma-and-mks-application/"')
      return
    }

    console.log(`Processing ${urls.length} Daily Maverick article(s)...`)
    
    for (const url of urls) {
      try {
        const articleData = await scrapeDailyMaverickArticle(url)
        await addDailyMaverickArticle(articleData, url)
        
        // Add a small delay between requests to be respectful
        if (urls.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`Failed to process ${url}:`, error)
      }
    }
    
    console.log('✅ Daily Maverick article processing complete!')
    
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  }
}

main()