import { useEffect, useMemo, useState } from 'react'
import {
  ImagePlus,
  Loader2,
  Lock,
  Music2,
  Palette,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react'
import { uploadApi, userApi } from '@/api'
import CompanionAvatar from '@/components/companion/CompanionAvatar'
import SimpleModeToggle from '@/components/common/SimpleModeToggle'
import CursorStylePicker from '@/components/interactive/CursorStylePicker'
import PageMeta from '@/components/seo/PageMeta'
import {
  useAuthStore,
  useSimpleModeStore,
  useSoundStore,
  useThemeStore,
  useUserPrefsStore,
} from '@/store'
import { zh } from '@/locales/zh'
import { syncUserPrefsToCloud } from '@/utils/syncUserPrefs'
import { resolveAssetUrl } from '@/utils/user'

type SettingsTab = 'profile' | 'companion' | 'music' | 'appearance' | 'security'

const tabs: { id: SettingsTab; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: zh.settings.tabs.profile, icon: UserRound },
  { id: 'companion', label: zh.settings.tabs.companion, icon: Sparkles },
  { id: 'music', label: zh.settings.tabs.music, icon: Music2 },
  { id: 'appearance', label: zh.settings.tabs.appearance, icon: Palette },
  { id: 'security', label: zh.settings.tabs.security, icon: Lock },
]

function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, '')
}

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const soundEnabled = useSoundStore((s) => s.enabled)
  const toggleSound = useSoundStore((s) => s.toggle)
  const simpleMode = useSimpleModeStore((s) => s.simpleMode)

  const {
    companionCallName,
    customQuotes,
    customTracks,
    setCompanionCallName,
    setCustomQuotes,
    addCustomTrack,
    updateCustomTrack,
    removeCustomTrack,
  } = useUserPrefsStore()

  const [tab, setTab] = useState<SettingsTab>('profile')
  const [profile, setProfile] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [quotesText, setQuotesText] = useState(customQuotes.join('\n'))
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [prefsMsg, setPrefsMsg] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingMusic, setUploadingMusic] = useState(false)

  const displayName = profile.nickname || user?.username || '你'

  useEffect(() => {
    setQuotesText(customQuotes.join('\n'))
  }, [user?.id, customQuotes])
  const previewQuotes = useMemo(
    () => customQuotes.map((q) => q.trim()).filter(Boolean),
    [customQuotes],
  )

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    setProfileError(false)
    try {
      const updated = await userApi.updateProfile(profile)
      const token = localStorage.getItem('iume_atelier_token') || ''
      const refresh = localStorage.getItem('iume_atelier_refresh') || undefined
      setAuth(token, updated, refresh)
      setProfileMsg(zh.settings.profileSaved)
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : zh.settings.saveFailed)
      setProfileError(true)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg(zh.settings.passwordMismatch)
      setPasswordError(true)
      return
    }
    setSavingPassword(true)
    setPasswordMsg('')
    setPasswordError(false)
    try {
      await userApi.changePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '', confirm: '' })
      setPasswordMsg(zh.settings.passwordSaved)
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : zh.settings.passwordFailed)
      setPasswordError(true)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadApi.uploadImage(file)
      setProfile({ ...profile, avatar: url })
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMusic(true)
    try {
      const { url, filename } = await uploadApi.uploadAudio(file)
      addCustomTrack({
        id: `custom-${Date.now()}`,
        title: stripExt(filename || file.name),
        artist: displayName,
        src: url,
        createdAt: new Date().toISOString(),
      })
      await syncUserPrefsToCloud()
      setPrefsMsg(zh.settings.musicUploaded)
    } catch (err) {
      setPrefsMsg(err instanceof Error ? err.message : zh.settings.musicUploadFailed)
    } finally {
      setUploadingMusic(false)
      e.target.value = ''
    }
  }

  const saveCompanionPrefs = async () => {
    setCustomQuotes(
      quotesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 8),
    )
    try {
      await syncUserPrefsToCloud()
      setPrefsMsg(zh.settings.companionSaved)
    } catch {
      setPrefsMsg(zh.settings.prefsSyncFailed)
    }
  }

  const saveMusicPrefs = async () => {
    try {
      await syncUserPrefsToCloud()
      setPrefsMsg(zh.settings.musicSaved)
    } catch {
      setPrefsMsg(zh.settings.prefsSyncFailed)
    }
  }

  const handleRemoveTrack = async (id: string) => {
    removeCustomTrack(id)
    try {
      await syncUserPrefsToCloud()
      setPrefsMsg(zh.settings.musicSaved)
    } catch {
      setPrefsMsg(zh.settings.prefsSyncFailed)
    }
  }

  return (
    <>
      <PageMeta title={zh.settings.title} description={zh.settings.subtitle} />
      <section className="settings-page page-container py-10 lg:py-14">
        <header className="settings-page__hero">
          <div>
            <h1 className="font-display text-4xl mb-2">{zh.settings.title}</h1>
            <p className="text-secondary">{zh.settings.subtitle}</p>
          </div>
          <div className="settings-page__hero-card">
            <CompanionAvatar
              avatarUrl={profile.avatar}
              displayName={displayName}
              mood="idle"
              playing={false}
            />
            <div>
              <p className="settings-page__hero-name">{displayName}</p>
              <p className="settings-page__hero-hint">{zh.settings.livePreview}</p>
            </div>
          </div>
        </header>

        <div className="settings-page__layout">
          <nav className="settings-page__nav" aria-label={zh.settings.title}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`settings-page__nav-btn cursor-pointer ${tab === id ? 'settings-page__nav-btn--active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-page__panel">
            {tab === 'profile' && (
              <form onSubmit={handleProfileSave} className="settings-page__section">
                <h2>{zh.settings.profile}</h2>
                <p className="settings-page__desc">{zh.settings.profileDesc}</p>

                <div className="settings-page__avatar-row">
                  {resolveAssetUrl(profile.avatar) ? (
                    <img
                      src={resolveAssetUrl(profile.avatar)!}
                      alt=""
                      className="settings-page__avatar-img"
                    />
                  ) : (
                    <div className="settings-page__avatar-fallback">{displayName[0]}</div>
                  )}
                  <div className="settings-page__avatar-actions">
                    <label className="btn-ghost inline-flex items-center gap-2 cursor-pointer text-sm">
                      {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                      {zh.settings.uploadAvatar}
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </label>
                    <p className="settings-page__hint">{zh.settings.avatarHint}</p>
                  </div>
                </div>

                <label className="settings-page__field">
                  <span>{zh.auth.nickname}</span>
                  <input
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    placeholder={zh.auth.nickname}
                  />
                </label>
                <label className="settings-page__field">
                  <span>{zh.auth.email}</span>
                  <input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder={zh.auth.email}
                    type="email"
                  />
                </label>
                <label className="settings-page__field">
                  <span>{zh.settings.avatarUrl}</span>
                  <input
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    placeholder={zh.settings.avatarUrl}
                    className="font-mono"
                  />
                </label>

                <div className="settings-page__actions">
                  <button type="submit" disabled={savingProfile} className="btn-primary cursor-pointer">
                    {savingProfile ? zh.settings.saving : zh.settings.saveProfile}
                  </button>
                  {profileMsg && (
                    <span className={`text-sm ${profileError ? 'text-red-500' : 'text-green-600'}`}>{profileMsg}</span>
                  )}
                </div>
              </form>
            )}

            {tab === 'companion' && (
              <div className="settings-page__section">
                <h2>{zh.settings.companionTitle}</h2>
                <p className="settings-page__desc">{zh.settings.companionDesc}</p>

                <div className="settings-page__preview">
                  <CompanionAvatar avatarUrl={profile.avatar} displayName={displayName} mood="happy" playing />
                  <div className="settings-page__preview-bubble">
                    {previewQuotes[0] || zh.settings.companionPreviewQuote}
                  </div>
                </div>

                <label className="settings-page__field">
                  <span>{zh.settings.companionCallName}</span>
                  <input
                    value={companionCallName}
                    onChange={(e) => setCompanionCallName(e.target.value)}
                    placeholder={zh.settings.companionCallNamePlaceholder}
                  />
                </label>

                <label className="settings-page__field">
                  <span>{zh.settings.customQuotes}</span>
                  <textarea
                    value={quotesText}
                    onChange={(e) => setQuotesText(e.target.value)}
                    placeholder={zh.settings.customQuotesPlaceholder}
                    rows={5}
                  />
                  <span className="settings-page__hint">{zh.settings.customQuotesHint}</span>
                </label>

                <div className="settings-page__actions">
                  <button type="button" className="btn-primary cursor-pointer" onClick={saveCompanionPrefs}>
                    {zh.settings.saveCompanion}
                  </button>
                  {prefsMsg && <span className="text-sm text-green-600">{prefsMsg}</span>}
                </div>
              </div>
            )}

            {tab === 'music' && (
              <div className="settings-page__section">
                <h2>{zh.settings.musicTitle}</h2>
                <p className="settings-page__desc">{zh.settings.musicDesc}</p>

                <label className="settings-page__upload-card cursor-pointer">
                  {uploadingMusic ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                  <div>
                    <p className="settings-page__upload-title">{zh.settings.uploadMusic}</p>
                    <p className="settings-page__hint">{zh.settings.uploadMusicHint}</p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                    className="hidden"
                    onChange={handleMusicUpload}
                    disabled={uploadingMusic}
                  />
                </label>

                {customTracks.length === 0 ? (
                  <p className="settings-page__empty">{zh.settings.noCustomMusic}</p>
                ) : (
                  <ul className="settings-page__music-list">
                    {customTracks.map((track) => (
                      <li key={track.id} className="settings-page__music-item">
                        <div className="settings-page__music-fields">
                          <input
                            value={track.title}
                            onChange={(e) => updateCustomTrack(track.id, { title: e.target.value })}
                            aria-label={zh.settings.trackTitle}
                          />
                          <input
                            value={track.artist}
                            onChange={(e) => updateCustomTrack(track.id, { artist: e.target.value })}
                            aria-label={zh.settings.trackArtist}
                          />
                        </div>
                        <button
                          type="button"
                          className="settings-page__icon-btn cursor-pointer"
                          onClick={() => handleRemoveTrack(track.id)}
                          aria-label={zh.settings.removeTrack}
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {customTracks.length > 0 && (
                  <div className="settings-page__actions">
                    <button type="button" className="btn-primary cursor-pointer" onClick={saveMusicPrefs}>
                      {zh.settings.saveMusic}
                    </button>
                  </div>
                )}

                {prefsMsg && <p className="text-sm text-green-600">{prefsMsg}</p>}
              </div>
            )}

            {tab === 'appearance' && (
              <div className="settings-page__section">
                <h2>{zh.settings.appearanceTitle}</h2>
                <p className="settings-page__desc">{zh.settings.appearanceDesc}</p>

                <div className="settings-page__toggle-grid">
                  <div className="settings-page__toggle-card">
                    <div>
                      <p className="settings-page__toggle-label">{zh.settings.theme}</p>
                      <p className="settings-page__hint">{theme === 'dark' ? zh.settings.themeDark : zh.settings.themeLight}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost cursor-pointer"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? zh.settings.themeLight : zh.settings.themeDark}
                    </button>
                  </div>

                  <div className="settings-page__toggle-card">
                    <div>
                      <p className="settings-page__toggle-label">{zh.sound.unmute}</p>
                      <p className="settings-page__hint">{soundEnabled ? zh.settings.soundOn : zh.settings.soundOff}</p>
                    </div>
                    <button type="button" className="btn-ghost cursor-pointer" onClick={toggleSound}>
                      {soundEnabled ? zh.sound.mute : zh.sound.unmute}
                    </button>
                  </div>

                  <div className="settings-page__toggle-card">
                    <div>
                      <p className="settings-page__toggle-label">{simpleMode ? zh.simpleMode.on : zh.simpleMode.off}</p>
                      <p className="settings-page__hint">{zh.settings.simpleModeHint}</p>
                    </div>
                    <SimpleModeToggle />
                  </div>
                </div>

                <CursorStylePicker />
              </div>
            )}

            {tab === 'security' && (
              <form onSubmit={handlePasswordSave} className="settings-page__section">
                <h2>{zh.settings.changePassword}</h2>
                <p className="settings-page__desc">{zh.settings.securityDesc}</p>

                <label className="settings-page__field">
                  <span>{zh.settings.currentPassword}</span>
                  <input
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder={zh.settings.currentPassword}
                    type="password"
                  />
                </label>
                <label className="settings-page__field">
                  <span>{zh.settings.newPassword}</span>
                  <input
                    value={passwords.next}
                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                    placeholder={zh.settings.newPassword}
                    type="password"
                  />
                </label>
                <label className="settings-page__field">
                  <span>{zh.settings.confirmPassword}</span>
                  <input
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder={zh.settings.confirmPassword}
                    type="password"
                  />
                </label>

                <div className="settings-page__actions">
                  <button type="submit" disabled={savingPassword} className="btn-primary cursor-pointer">
                    {savingPassword ? zh.settings.saving : zh.settings.updatePassword}
                  </button>
                  {passwordMsg && (
                    <span className={`text-sm ${passwordError ? 'text-red-500' : 'text-green-600'}`}>{passwordMsg}</span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
