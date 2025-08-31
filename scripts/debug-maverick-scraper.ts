#!/usr/bin/env tsx

/**
 * Debug Daily Maverick Scraper
 * 
 * This script helps debug what content is being extracted from Daily Maverick
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function debugDailyMaverickScraper(url: string) {
  console.log(`🔍 DEBUGGING Daily Maverick scraper: ${url}`)
  
  const response = await fetch(url)
  const html = await response.text()
  
  console.log(`📄 HTML length: ${html.length} characters`)
  
  // Test different content patterns
  const contentPatterns = [
    { name: 'article-content', pattern: /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi },
    { name: 'mode-content article-content', pattern: /<div[^>]*class="[^"]*mode-content article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi },
    { name: 'long-form tab', pattern: /<div[^>]*id="long-form"[^>]*>([\s\S]*?)<\/div>/gi },
    { name: 'tab-content', pattern: /<div[^>]*class="[^"]*tab-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi },
    { name: 'first-paragraph h2', pattern: /<h2[^>]*class="[^"]*first-paragraph[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi },
  ]
  
  console.log('\n🔍 Testing content patterns:')
  
  for (const { name, pattern } of contentPatterns) {
    const match = html.match(pattern)
    if (match) {
      console.log(`✅ ${name}: Found ${match[1].length} chars`)
      console.log(`   Preview: "${match[1].substring(0, 200).replace(/\s+/g, ' ').trim()}..."`)
    } else {
      console.log(`❌ ${name}: No match`)
    }
  }
  
  // Check if basic HTML elements exist
  console.log('\n🔍 Basic HTML elements:')
  console.log(`<p> tags: ${(html.match(/<p[^>]*>/gi) || []).length}`)
  console.log(`<div> tags: ${(html.match(/<div[^>]*>/gi) || []).length}`)
  console.log(`<h2> tags: ${(html.match(/<h2[^>]*>/gi) || []).length}`)
  
  // Look for specific Daily Maverick indicators
  console.log('\n🔍 Daily Maverick indicators:')
  console.log(`"article-content" class: ${html.includes('article-content')}`)
  console.log(`"first-paragraph" class: ${html.includes('first-paragraph')}`)  
  console.log(`"mode-content" class: ${html.includes('mode-content')}`)
  console.log(`"long-form" id: ${html.includes('id="long-form"')}`)
  
  // Sample paragraph extraction
  const paragraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || []
  console.log(`\n📰 Found ${paragraphs.length} paragraphs`)
  
  if (paragraphs.length > 0) {
    console.log('📰 First few paragraphs:')
    for (let i = 0; i < Math.min(5, paragraphs.length); i++) {
      const text = paragraphs[i].replace(/<[^>]*>/g, '').trim()
      if (text.length > 20) {
        console.log(`   ${i + 1}: "${text.substring(0, 100)}..."`)
      }
    }
  }
  
  // Try to find the title
  const titlePatterns = [
    /<h1[^>]*>(.*?)<\/h1>/i,
    /<title[^>]*>(.*?)<\/title>/i
  ]
  
  console.log('\n📰 Title extraction:')
  for (const pattern of titlePatterns) {
    const match = html.match(pattern)
    if (match) {
      const title = match[1].replace(/<[^>]*>/g, '').replace(/\s*\|\s*Daily Maverick\s*$/i, '').trim()
      console.log(`✅ Found title: "${title}"`)
      break
    }
  }
}

async function main() {
  const url = process.argv[2]
  
  if (!url) {
    console.log('Usage: npx tsx scripts/debug-maverick-scraper.ts <url>')
    console.log('Example: npx tsx scripts/debug-maverick-scraper.ts "https://www.dailymaverick.co.za/article/..."')
    return
  }
  
  try {
    await debugDailyMaverickScraper(url)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()