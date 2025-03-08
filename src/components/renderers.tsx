/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { jsx } from 'hono/jsx'
import { LoginPage } from './LoginPage.js'
import { GuildErrorPage } from './GuildErrorPage.js'
import { HomePage } from './HomePage.js'
import { MessagePage } from './MessagePage.js'
import { ReblogListPage } from './ReblogListPage.js'
import { ReblogDetailPage } from './ReblogDetailPage.js'
import type { User } from '../types.js'
import type { DiscordChannel, DiscordMessage } from '../discord/message.js'
import type { ReblogEntry } from '../firestore/index.js'

export function renderLoginPage(authUrl: string) {
  return <LoginPage authUrl={authUrl} />
}

export function renderGuildErrorPage() {
  return <GuildErrorPage />
}

export function renderHomePage(user: User, channels: DiscordChannel[], error?: string) {
  return <HomePage user={user} channels={channels} error={error} />
}

export function renderMessagePage(user: User, messages: DiscordMessage[], channelId: string, messageId: string) {
  return <MessagePage user={user} messages={messages} channelId={channelId} messageId={messageId} />
}

export function renderReblogListPage(user: User, entries: ReblogEntry[], error?: string) {
  return <ReblogListPage user={user} entries={entries} error={error} />
}

export function renderReblogDetailPage(user: User, entry: ReblogEntry) {
  return <ReblogDetailPage user={user} entry={entry} />
}
