'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Bell, 
  Mail, 
  Globe, 
  Save,
  CheckCircle,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react'

// Custom SVG icons for missing lucide-react icons
const Smartphone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
)

const Volume2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
)

const VolumeX = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M23 9l-6 6M17 9l6 6" />
  </svg>
)

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-3-6.943 4 4 0 013 6.943z" />
  </svg>
)

interface NotificationSettingsProps {
  profile: Profile
}

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  browser_notifications: boolean
  newsletter_weekly: boolean
  newsletter_breaking: boolean
  article_comments: boolean
  article_likes: boolean
  new_articles_following: boolean
  business_updates: boolean
  system_updates: boolean
  marketing_updates: boolean
  reminder_notifications: boolean
}

export default function NotificationSettings({ profile }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const { refreshProfile } = useAuth()
  
  // Initialize with default values or from profile preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: profile.preferences?.email_notifications ?? true,
    push_notifications: profile.preferences?.push_notifications ?? false,
    browser_notifications: profile.preferences?.browser_notifications ?? false,
    newsletter_weekly: profile.preferences?.newsletter_weekly ?? true,
    newsletter_breaking: profile.preferences?.newsletter_breaking ?? true,
    article_comments: profile.preferences?.article_comments ?? true,
    article_likes: profile.preferences?.article_likes ?? false,
    new_articles_following: profile.preferences?.new_articles_following ?? true,
    business_updates: profile.preferences?.business_updates ?? false,
    system_updates: profile.preferences?.system_updates ?? true,
    marketing_updates: profile.preferences?.marketing_updates ?? false,
    reminder_notifications: profile.preferences?.reminder_notifications ?? true
  })

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            ...profile.preferences,
            ...preferences
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const notificationGroups = [
    {
      title: 'Delivery Methods',
      description: 'Choose how you want to receive notifications',
      icon: Bell,
      settings: [
        {
          key: 'email_notifications' as keyof NotificationPreferences,
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          icon: Mail
        },
        {
          key: 'push_notifications' as keyof NotificationPreferences,
          label: 'Push Notifications',
          description: 'Receive push notifications on your devices',
          icon: Smartphone
        },
        {
          key: 'browser_notifications' as keyof NotificationPreferences,
          label: 'Browser Notifications',
          description: 'Show browser notification popups',
          icon: Globe
        }
      ]
    },
    {
      title: 'Newsletter & Updates',
      description: 'Stay informed with our regular updates',
      icon: Mail,
      settings: [
        {
          key: 'newsletter_weekly' as keyof NotificationPreferences,
          label: 'Weekly Newsletter',
          description: 'Weekly roundup of top stories and updates',
          icon: Calendar
        },
        {
          key: 'newsletter_breaking' as keyof NotificationPreferences,
          label: 'Breaking News Alerts',
          description: 'Immediate notifications for breaking news',
          icon: AlertTriangle
        },
        {
          key: 'system_updates' as keyof NotificationPreferences,
          label: 'System Updates',
          description: 'Important updates about the platform',
          icon: CheckCircle
        }
      ]
    },
    {
      title: 'Content & Engagement',
      description: 'Notifications about articles and community activity',
      icon: MessageSquare,
      settings: [
        {
          key: 'article_comments' as keyof NotificationPreferences,
          label: 'Article Comments',
          description: 'When someone comments on articles you follow',
          icon: MessageSquare
        },
        {
          key: 'article_likes' as keyof NotificationPreferences,
          label: 'Article Likes',
          description: 'When your articles receive likes',
          icon: TrendingUp
        },
        {
          key: 'new_articles_following' as keyof NotificationPreferences,
          label: 'New Articles from Followed Authors',
          description: 'When authors you follow publish new content',
          icon: Users
        }
      ]
    },
    {
      title: 'Business & Marketing',
      description: 'Business-related updates and promotional content',
      icon: TrendingUp,
      settings: [
        {
          key: 'business_updates' as keyof NotificationPreferences,
          label: 'Business Directory Updates',
          description: 'Updates about business listings you own or follow',
          icon: TrendingUp
        },
        {
          key: 'marketing_updates' as keyof NotificationPreferences,
          label: 'Marketing & Promotions',
          description: 'Special offers, events, and promotional content',
          icon: Volume2
        },
        {
          key: 'reminder_notifications' as keyof NotificationPreferences,
          label: 'Reminder Notifications',
          description: 'Helpful reminders and engagement prompts',
          icon: Bell
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
            <p className="text-gray-600">Customize how and when you receive notifications</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Notification Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-blue-900">Notification Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${preferences.email_notifications ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-blue-800">
              Email: {preferences.email_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${preferences.push_notifications ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-blue-800">
              Push: {preferences.push_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${preferences.browser_notifications ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-blue-800">
              Browser: {preferences.browser_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Groups */}
      {notificationGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon
        return (
          <div key={groupIndex} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <GroupIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{group.title}</h3>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {group.settings.map((setting, settingIndex) => {
                const SettingIcon = setting.icon
                const isEnabled = preferences[setting.key]
                
                return (
                  <div key={settingIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <SettingIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isEnabled}
                        onChange={() => handleToggle(setting.key)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const allEnabled = { ...preferences }
              Object.keys(allEnabled).forEach(key => {
                allEnabled[key as keyof NotificationPreferences] = true
              })
              setPreferences(allEnabled)
              setSaved(false)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Enable All</span>
          </button>
          
          <button
            onClick={() => {
              const allDisabled = { ...preferences }
              Object.keys(allDisabled).forEach(key => {
                allDisabled[key as keyof NotificationPreferences] = false
              })
              setPreferences(allDisabled)
              setSaved(false)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <VolumeX className="w-4 h-4" />
            <span>Disable All</span>
          </button>
          
          <button
            onClick={() => {
              const essentialOnly = {
                email_notifications: true,
                push_notifications: false,
                browser_notifications: false,
                newsletter_weekly: true,
                newsletter_breaking: true,
                article_comments: false,
                article_likes: false,
                new_articles_following: false,
                business_updates: false,
                system_updates: true,
                marketing_updates: false,
                reminder_notifications: false
              }
              setPreferences(essentialOnly)
              setSaved(false)
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Essential Only</span>
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enable browser notifications for real-time breaking news alerts</li>
          <li>• Turn off marketing updates if you prefer only content-related notifications</li>
          <li>• Use "Essential Only" for minimal interruptions while staying informed</li>
          <li>• Your preferences are saved automatically when you click "Save Changes"</li>
        </ul>
      </div>
    </div>
  )
}