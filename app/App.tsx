import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Command,
  Crown,
  Dice5,
  Gamepad2,
  Gift,
  Hash,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  getGetCommunityOverviewQueryKey,
  getListChannelsQueryKey,
  getListGiveawaysQueryKey,
  getListMessagesQueryKey,
  useCreateGiveaway,
  useCreateMessage,
  useGetCommunityOverview,
  useJoinGiveaway,
  useListChannels,
  useListGiveaways,
  useListMessages,
} from './index';
import type {
  Channel,
  CommunityOverview,
  Giveaway,
  Message,
  User,
} from './index';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from './error-boundary';
import { Toaster } from './toaster';
import { TooltipProvider } from './tooltip';
import NotFound from './not-found';

const queryClient = new QueryClient();

const demoUser: User = {
  id: 'u-me',
  name: 'Mina Park',
  handle: 'minapark',
  avatarUrl: '',
  status: 'online',
  role: 'Founder',
  badge: 'OG',
};

const demoOverview: CommunityOverview = {
  serverName: 'Nova Arena',
  logoUrl: '',
  developer: { id: 'u-dev', name: 'Riven Ito', handle: 'riven', avatarUrl: '', status: 'online', role: 'Developer', badge: 'DEV' },
  onlineCount: 284,
  activeChannels: 18,
  weeklyRank: 7,
  featuredGame: 'Skyline Drift',
  announcement: 'The summer season is live. Jump in, find your crew, and make something worth remembering.',
};

const demoChannels: Channel[] = [
  { id: 'general', name: 'general', kind: 'text', unread: 4, category: 'LOBBY' },
  { id: 'showcase', name: 'showcase', kind: 'text', unread: 0, category: 'LOBBY' },
  { id: 'clips', name: 'clips-and-captures', kind: 'text', unread: 12, category: 'LOBBY' },
  { id: 'patch-notes', name: 'patch-notes', kind: 'announcement', unread: 0, category: 'NEWS' },
  { id: 'party-up', name: 'party-up', kind: 'text', unread: 2, category: 'PLAY' },
  { id: 'late-night', name: 'late-night-lounge', kind: 'voice', unread: 0, category: 'PLAY' },
];

const demoMessages: Message[] = [
  { id: 'm1', channelId: 'general', author: { id: 'u2', name: 'Jules Avery', handle: 'jules', avatarUrl: '', status: 'online', role: 'Mod', badge: 'MOD' }, content: 'the new drift course is absolutely unhinged in the best way', createdAt: '2025-06-17T09:18:00Z', source: 'discord', mentions: [] },
  { id: 'm2', channelId: 'general', author: { id: 'u3', name: 'Kaito Ren', handle: 'kaito', avatarUrl: '', status: 'idle', role: 'Artist', badge: 'ART' }, content: 'I got a clean run on lap three. Posting the route in #showcase.', createdAt: '2025-06-17T09:21:00Z', source: 'website', mentions: [] },
  { id: 'm3', channelId: 'general', author: { id: 'u4', name: 'Sana Voss', handle: 'sanavoss', avatarUrl: '', status: 'online', role: 'Member', badge: null }, content: 'Anyone building a crew for tonight? Need one more for ranked.', createdAt: '2025-06-17T09:24:00Z', source: 'discord', mentions: [] },
  { id: 'm4', channelId: 'general', author: demoUser, content: 'I am in. Let’s make it interesting.', createdAt: '2025-06-17T09:26:00Z', source: 'website', mentions: [] },
];

const demoGiveaways: Giveaway[] = [
  { id: 'g1', title: 'Founders loadout', prize: 'Nova Arena founder pack', description: 'A custom ring, 2,400 credits, and the founder badge reserved for one early member.', previewUrl: null, endsAt: '2025-06-20T19:00:00Z', participants: 184, status: 'active', winner: null },
  { id: 'g2', title: 'Build your rig', prize: '$250 gear voucher', description: 'The crew picks one creator to upgrade their setup before the next creator jam.', previewUrl: null, endsAt: '2025-06-23T23:00:00Z', participants: 96, status: 'active', winner: null },
  { id: 'g3', title: 'Night shift drop', prize: 'Midnight profile ring', description: 'A limited profile ring with a deep-space finish. Only available this week.', previewUrl: null, endsAt: '2025-06-19T03:30:00Z', participants: 312, status: 'active', winner: null },
];

const leaderboard = [
  { name: 'Jules Avery', handle: 'jules', points: 1840, change: '+2', color: 'from-[#efb86a] to-[#e47f79]', badge: 'MOD' },
  { name: 'Kaito Ren', handle: 'kaito', points: 1622, change: '+4', color: 'from-[#b999ef] to-[#6d79dc]', badge: 'ART' },
  { name: 'Sana Voss', handle: 'sanavoss', points: 1496, change: '-1', color: 'from-[#70cbb9] to-[#5792b8]', badge: null },
  { name: 'Mina Park', handle: 'minapark', points: 1318, change: '+6', color: 'from-[#e48bae] to-[#9d6bd8]', badge: 'OG' },
  { name: 'Theo Marsh', handle: 'theomarsh', points: 1205, change: '+1', color: 'from-[#8fc1db] to-[#6680cb]', badge: null },
];

function hasItems<T>(value: T[] | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

function isCommunityOverview(value: unknown): value is CommunityOverview {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'serverName' in value &&
      typeof (value as { serverName?: unknown }).serverName === 'string',
  );
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function timeLeft(value: string) {
  const diff = Math.max(0, new Date(value).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
}

function Avatar({ user, size = 'md', onClick }: { user: User; size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  const sizes = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-20 w-20 text-xl' };
  return (
    <button type="button" onClick={onClick} data-testid={`button-profile-${user.id}`} className={`relative shrink-0 rounded-2xl bg-gradient-to-br from-[#7e6ddd] via-[#b478b1] to-[#efa97e] font-bold text-white ${sizes[size]} ${onClick ? 'cursor-pointer' : 'cursor-default'} ${size === 'lg' ? 'avatar-ring' : ''}`}>
      {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-[inherit] object-cover" /> : initials(user.name)}
      {user.status === 'online' && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-[#5ac7aa]" />}
    </button>
  );
}

function IconButton({ label, children, onClick, className = '' }: { label: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" aria-label={label} data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={onClick} className={`grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${className}`}>{children}</button>;
}

function BrandMark() {
  return <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-[0_5px_16px_rgba(126,102,215,.3)]"><span className="display text-lg font-bold">N</span></span>;
}

function MobileNav({ location }: { location: string }) {
  const links = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/giveaways', label: 'Drops', icon: Gift },
    { href: '/leaderboard', label: 'Rankings', icon: Trophy },
  ];
  return <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl md:hidden"><div className="mx-auto flex max-w-lg justify-around">{links.map(({ href, label, icon: NavIcon }) => <Link key={href} href={href} data-testid={`link-mobile-${label.toLowerCase()}`} className={`flex min-w-[68px] flex-col items-center gap-1 py-1 text-[10px] font-bold uppercase tracking-wider ${location === href ? 'text-primary' : 'text-muted-foreground'}`}><NavIcon className="h-[18px] w-[18px]" strokeWidth={location === href ? 2.5 : 1.8} /><span>{label}</span></Link>)}</div></nav>;
}

function Sidebar({ channels, location, onChannel, onClose }: { channels: Channel[]; location: string; onChannel: (id: string) => void; onClose?: () => void }) {
  const categories = Array.from(new Set(channels.map((channel) => channel.category ?? 'SPACE')));
  return <aside className="flex h-full w-[252px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
    <div className="flex items-center justify-between px-5 py-5">
      <Link href="/" data-testid="link-sidebar-brand" className="flex items-center gap-3"><BrandMark /><span className="display text-[15px] font-bold tracking-tight">NOVA <span className="text-[#a99bea]">ARENA</span></span></Link>
      {onClose && <IconButton label="close menu" onClick={onClose}><X className="h-5 w-5" /></IconButton>}
    </div>
    <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/[.04] p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#9a91bd]"><span className="h-1.5 w-1.5 rounded-full bg-[#5ac7aa]" /> Discord synced</div>
      <p className="mt-2 text-xs leading-relaxed text-[#c5c1d7]">Your community, with a little more room to play.</p>
    </div>
    <div className="scrollbar-thin flex-1 overflow-y-auto px-3">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#78738f]">Explore</p>
      {[
        { href: '/', label: 'Overview', icon: LayoutDashboard },
        { href: '/chat', label: 'Community chat', icon: MessageCircle },
        { href: '/giveaways', label: 'Giveaways', icon: Gift },
        { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      ].map(({ href, label, icon: NavIcon }) => <Link key={href} href={href} onClick={onClose} data-testid={`link-sidebar-${label.toLowerCase().replaceAll(' ', '-')}`} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${location === href ? 'bg-sidebar-accent text-white' : 'text-[#aaa5be] hover:bg-white/[.05] hover:text-white'}`}><NavIcon className={`h-[17px] w-[17px] ${location === href ? 'text-[#b7a7fb]' : ''}`} />{label}{label === 'Giveaways' && <span className="ml-auto rounded-md bg-[#efb86a]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#efb86a]">3</span>}</Link>)}
      <div className="mt-7 flex items-center justify-between px-3 pb-2"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78738f]">Channels</p><button type="button" data-testid="button-add-channel" className="text-[#78738f] hover:text-white"><Plus className="h-3.5 w-3.5" /></button></div>
      {categories.map((category) => <div key={category} className="mb-4"><p className="px-3 pb-1 text-[9px] font-bold tracking-[.18em] text-[#66617d]">{category}</p>{channels.filter((channel) => (channel.category ?? 'SPACE') === category).map((channel) => <button type="button" key={channel.id} onClick={() => { onChannel(channel.id); onClose?.(); }} data-testid={`button-channel-${channel.id}`} className={`group mb-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${location === '/chat' && channel.id === 'general' ? 'bg-white/[.08] text-white' : 'text-[#9f9ab4] hover:bg-white/[.05] hover:text-white'}`}><span className="text-[#706a8a]">{channel.kind === 'announcement' ? <Radio className="h-3.5 w-3.5" /> : channel.kind === 'voice' ? <Activity className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}</span><span className="truncate">{channel.name}</span>{channel.unread > 0 && <span className="ml-auto rounded-full bg-[#a99bea] px-1.5 py-0.5 text-[9px] font-bold text-[#24213a]">{channel.unread}</span>}</button>)}</div>)}
    </div>
    <div className="border-t border-white/10 p-3"><Link href="/profile/u-me" onClick={onClose} data-testid="link-sidebar-profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/[.05]"><Avatar user={demoUser} size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{demoUser.name}</span><span className="block truncate text-[10px] text-[#85809d]">@{demoUser.handle}</span></span><Settings className="h-4 w-4 text-[#77718b]" /></Link></div>
  </aside>;
}

function Topbar({ onMenu, onProfile }: { onMenu: () => void; onProfile: () => void }) {
  return <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-border bg-card/75 px-4 backdrop-blur-xl md:px-8"><div className="flex items-center gap-3"><IconButton label="open menu" onClick={onMenu} className="md:hidden"><Menu className="h-5 w-5" /></IconButton><div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><Command className="h-3.5 w-3.5" /><span>Jump to anything</span><kbd className="ml-2 rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd></div><div className="flex items-center gap-2 md:hidden"><BrandMark /><span className="display text-sm font-bold">NOVA ARENA</span></div></div><div className="flex items-center gap-1.5"><IconButton label="search"><Search className="h-[18px] w-[18px]" /></IconButton><IconButton label="notifications"><Bell className="h-[18px] w-[18px]" /></IconButton><button type="button" onClick={onProfile} data-testid="button-topbar-profile" className="ml-1 rounded-xl p-1 hover:bg-secondary"><Avatar user={demoUser} size="sm" /></button></div></header>;
}

function ProfileSheet({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  return <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={onClose}><div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-t-[28px] border border-border bg-card p-6 shadow-2xl md:rounded-[28px]"><div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border md:hidden" /><div className="flex items-start justify-between"><div className="flex items-center gap-4"><Avatar user={user} size="lg" /><div><div className="flex items-center gap-2"><h2 className="display text-xl font-bold">{user.name}</h2>{user.badge && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{user.badge}</span>}</div><p className="mt-1 text-sm text-muted-foreground">@{user.handle}</p><p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4caf91]"><span className="h-1.5 w-1.5 rounded-full bg-current" /> {user.status}</p></div></div><IconButton label="close profile" onClick={onClose}><X className="h-5 w-5" /></IconButton></div><div className="mt-7 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-secondary p-3 text-center"><p className="display text-lg font-bold">24</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Messages</p></div><div className="rounded-2xl bg-secondary p-3 text-center"><p className="display text-lg font-bold">#04</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Rank</p></div><div className="rounded-2xl bg-secondary p-3 text-center"><p className="display text-lg font-bold">7</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Rings</p></div></div><Link href={`/profile/${user.id}`} onClick={onClose} data-testid={`link-view-profile-${user.id}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">View full profile <ArrowRight className="h-4 w-4" /></Link></div></div>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const overviewQuery = useGetCommunityOverview({ query: { queryKey: getGetCommunityOverviewQueryKey() } });
  const channelsQuery = useListChannels({ query: { queryKey: getListChannelsQueryKey() } });
  const overview = isCommunityOverview(overviewQuery.data) ? overviewQuery.data : demoOverview;
  const channels = hasItems(channelsQuery.data) ? channelsQuery.data : demoChannels;
  const selectChannel = (id: string) => setLocation(`/chat?channel=${id}`);
  return <div className="noise app-shell flex min-h-[100dvh]"><div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}><Sidebar channels={channels} location={location} onChannel={selectChannel} onClose={() => setMenuOpen(false)} /></div>{menuOpen && <button type="button" aria-label="close navigation overlay" data-testid="button-close-navigation-overlay" onClick={() => setMenuOpen(false)} className="modal-backdrop fixed inset-0 z-30 md:hidden" />}<main className="flex min-w-0 flex-1 flex-col"><Topbar onMenu={() => setMenuOpen(true)} onProfile={() => setSelectedUser(demoUser)} /><div className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">{children}</div></main><MobileNav location={location} /><ProfileSheet user={selectedUser} onClose={() => setSelectedUser(null)} /><span className="sr-only">{overview.serverName}</span></div>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div><p className="mono mb-2 text-[10px] font-medium uppercase tracking-[.2em] text-primary">{eyebrow}</p><h1 className="display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1></div>{action}</div>;
}

function HomePage() {
  const overviewQuery = useGetCommunityOverview({ query: { queryKey: getGetCommunityOverviewQueryKey() } });
  const giveawayQuery = useListGiveaways({ query: { queryKey: getListGiveawaysQueryKey() } });
  const overview = isCommunityOverview(overviewQuery.data) ? overviewQuery.data : demoOverview;
  const giveaways = hasItems(giveawayQuery.data) ? giveawayQuery.data : demoGiveaways;
  const isLoading = overviewQuery.isLoading && !overviewQuery.data;
  return <div className="mx-auto w-full max-w-[1380px] p-4 md:p-8">
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div className="fade-up"><p className="mono mb-2 text-[10px] uppercase tracking-[.24em] text-primary">Tuesday · June 17, 2025</p><h1 className="display text-3xl font-bold tracking-tight md:text-4xl">Good to see you, <span className="text-primary">Mina.</span></h1><p className="mt-2 max-w-lg text-sm text-muted-foreground">The arena is warm. Here is what your community is making today.</p></div><Link href="/chat" data-testid="link-home-open-chat" className="flex w-fit items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-xs font-bold text-background transition-transform hover:-translate-y-0.5">Open community chat <ArrowRight className="h-4 w-4" /></Link></div>
    {overviewQuery.isError && <div data-testid="status-overview-fallback" className="mb-5 flex items-center gap-2 rounded-xl border border-[#e5bd76]/40 bg-[#e5bd76]/10 px-4 py-3 text-xs text-[#8c681f]"><Info className="h-4 w-4" /> Live sync is taking a moment. Showing the latest local snapshot.</div>}
    <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
      <section className="panel fade-up-delay-1 relative min-h-[270px] overflow-hidden rounded-[26px] p-6 md:p-8"><div className="relative z-10 max-w-md"><div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#4e9d8b]"><span className="h-2 w-2 rounded-full bg-[#5ac7aa]" /> Community pulse</div><h2 data-testid="text-community-announcement" className="display text-2xl font-bold leading-tight md:text-3xl">{overview.announcement ?? 'Make some noise in the arena.'}</h2><div className="mt-8 flex items-center gap-3"><div className="flex -space-x-2">{['u2', 'u3', 'u4', 'u5'].map((id, index) => <span key={id} className={`grid h-8 w-8 place-items-center rounded-xl border-2 border-card bg-gradient-to-br ${['from-[#e1a676] to-[#9d6bd8]', 'from-[#72c6b7] to-[#6d79dc]', 'from-[#ec9a9e] to-[#e2bf77]', 'from-[#7692d7] to-[#b37db8]'][index]} text-[9px] font-bold text-white`}>{['JA', 'KR', 'SV', 'TM'][index]}</span>)}</div><span className="text-xs text-muted-foreground"><strong className="text-foreground">{overview.onlineCount}</strong> members making things</span></div></div><div className="pointer-events-none absolute -right-8 -top-12 h-72 w-72 rounded-full border-[22px] border-primary/10" /><div className="pointer-events-none absolute -bottom-28 right-16 h-64 w-64 rounded-full border-[46px] border-[#5ac7aa]/10" /><Sparkles className="absolute right-12 top-12 h-5 w-5 text-[#e5bd76]" /></section>
      <section className="panel fade-up-delay-2 rounded-[26px] p-6"><div className="mb-5 flex items-center justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Now playing</p><h2 className="display mt-1 text-xl font-bold">{overview.featuredGame}</h2></div><span className="rounded-lg bg-[#5ac7aa]/12 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3a9d88]">Featured</span></div><div className="game-art relative h-32 overflow-hidden rounded-2xl"><div className="absolute bottom-3 left-4 z-10"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/70">Community session</p><p className="display mt-1 text-lg font-bold text-white">Drift until sunrise</p></div><Gamepad2 className="absolute bottom-4 right-5 z-10 h-8 w-8 text-white/80" /></div><div className="mt-5 flex items-center justify-between"><span className="text-xs text-muted-foreground"><span className="font-bold text-foreground">48</span> players online</span><Link href="/chat" data-testid="link-home-join-session" className="text-xs font-bold text-primary hover:underline">Join session <ArrowRight className="ml-1 inline h-3 w-3" /></Link></div></section>
    </div>
    <div className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
      <section className="fade-up-delay-2"><SectionHeading eyebrow="The rhythm" title="Your community, in motion." action={<Link href="/leaderboard" data-testid="link-home-leaderboard" className="hidden items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground sm:flex">Weekly rankings <ChevronRight className="h-4 w-4" /></Link>} /><div className="grid gap-3 sm:grid-cols-3"><MetricCard icon={<Users />} label="Online now" value={String(overview.onlineCount)} detail="+18 since noon" tone="teal" /><MetricCard icon={<MessageCircle />} label="Active channels" value={String(overview.activeChannels)} detail="5 conversations" tone="purple" /><MetricCard icon={<Trophy />} label="Your weekly rank" value={`#${overview.weeklyRank}`} detail="up 6 places" tone="gold" /></div></section>
      <section className="fade-up-delay-3"><SectionHeading eyebrow="Limited drops" title="Worth showing up for." action={<Link href="/giveaways" data-testid="link-home-all-giveaways" className="text-xs font-bold text-primary">View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>} /><div className="space-y-3">{isLoading ? [1, 2].map((item) => <div key={item} className="skeleton h-[76px] rounded-2xl" />) : giveaways.slice(0, 2).map((giveaway) => <Link href="/giveaways" key={giveaway.id} data-testid={`card-home-giveaway-${giveaway.id}`} className="panel lift flex items-center gap-4 rounded-2xl p-3.5"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f1e8d1] text-[#b68136]"><Gift className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{giveaway.prize}</p><p className="mt-1 text-[11px] text-muted-foreground">{timeLeft(giveaway.endsAt)} · {giveaway.participants} in the pool</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>)}</div></section>
    </div>
  </div>;
}

function MetricCard({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: 'teal' | 'purple' | 'gold' }) {
  const colors = { teal: 'bg-[#5ac7aa]/12 text-[#3d9e8a]', purple: 'bg-primary/12 text-primary', gold: 'bg-[#e5bd76]/18 text-[#aa7b2e]' };
  return <div className="panel rounded-2xl p-4"><div className="flex items-center justify-between"><span className={`grid h-8 w-8 place-items-center rounded-lg ${colors[tone]}`}>{icon}</span><span className="text-[10px] font-bold text-[#4d9c87]">{detail.startsWith('+') ? detail.split(' ')[0] : ''}</span></div><p className="mono mt-5 text-2xl font-medium">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p><p className="mt-2 text-[10px] text-muted-foreground">{detail}</p></div>;
}

function ChatPage() {
  const [, setLocation] = useLocation();
  const channelsQuery = useListChannels({ query: { queryKey: getListChannelsQueryKey() } });
  const channels = hasItems(channelsQuery.data) ? channelsQuery.data : demoChannels;
  const [channelId, setChannelId] = useState('general');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [mentionsOpen, setMentionsOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const messagesQuery = useListMessages(channelId, { query: { queryKey: getListMessagesQueryKey(channelId) } });
  const createMessage = useCreateMessage();
  const channel = channels.find((item) => item.id === channelId) ?? demoChannels[0];
  const messages = [...(hasItems(messagesQuery.data) ? messagesQuery.data : demoMessages.filter((item) => item.channelId === channelId)), ...localMessages.filter((item) => item.channelId === channelId)];
  const sendMessage = () => {
    const content = draft.trim();
    if (!content || createMessage.isPending) return;
    const next: Message = { id: `local-${Date.now()}`, channelId, author: demoUser, content, createdAt: new Date().toISOString(), source: 'website', mentions: [] };
    setLocalMessages((items) => [...items, next]); setDraft('');
    createMessage.mutate({ channelId, data: { content, mentions: [] } }, { onError: () => undefined });
  };
  return <div className="flex h-[calc(100dvh-70px)] min-h-[560px] flex-col lg:flex-row"><div className="hidden w-[230px] shrink-0 border-r border-border bg-card/50 p-4 lg:block"><p className="mono mb-4 px-2 text-[10px] uppercase tracking-[.2em] text-muted-foreground">Channels</p>{channels.map((item) => <button type="button" key={item.id} onClick={() => setChannelId(item.id)} data-testid={`button-chat-channel-${item.id}`} className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold ${channelId === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}><Hash className="h-3.5 w-3.5" />{item.name}{item.unread > 0 && <span className="ml-auto text-[10px] font-bold text-primary">{item.unread}</span>}</button>)}</div><div className="flex min-w-0 flex-1 flex-col"><div className="flex h-[68px] items-center justify-between border-b border-border px-4 md:px-7"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setLocation('/')} data-testid="button-chat-back" className="rounded-lg p-1 text-muted-foreground hover:bg-secondary lg:hidden"><ChevronLeft className="h-5 w-5" /></button><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Hash className="h-4 w-4" /></div><div className="min-w-0"><h1 data-testid="text-current-channel" className="display truncate text-base font-bold">{channel.name}</h1><p className="truncate text-[11px] text-muted-foreground">A place for the good stuff</p></div></div><div className="flex items-center gap-1"><span className="mr-2 hidden text-[11px] text-muted-foreground sm:inline"><span className="font-bold text-foreground">38</span> online</span><IconButton label="chat info"><Info className="h-[17px] w-[17px]" /></IconButton><IconButton label="chat more"><MoreHorizontal className="h-[17px] w-[17px]" /></IconButton></div></div><div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7"><div className="mx-auto max-w-3xl"><div className="mb-7 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today · June 17</span><div className="h-px flex-1 bg-border" /></div>{messagesQuery.isLoading && !messagesQuery.data ? <div className="space-y-6">{[1, 2, 3].map((item) => <div key={item} className="flex gap-3"><div className="skeleton h-10 w-10 rounded-2xl" /><div><div className="skeleton h-3 w-28 rounded" /><div className="skeleton mt-2 h-10 w-64 rounded-xl" /></div></div>)}</div> : messages.length === 0 ? <EmptyState icon={<MessageCircle />} title="First words in the room" body="Start the conversation and give this channel its first memory." /> : <div className="space-y-6">{messages.map((message) => <div key={message.id} className="group flex gap-3"><Avatar user={message.author} size="md" onClick={() => setProfile(message.author)} /><div className="min-w-0 flex-1"><div className="flex items-baseline gap-2"><button type="button" onClick={() => setProfile(message.author)} data-testid={`button-message-author-${message.id}`} className="text-sm font-bold hover:text-primary">{message.author.name}</button><span className="text-[10px] text-muted-foreground">{message.author.badge && <span className="mr-2 rounded bg-primary/10 px-1 text-[9px] font-bold text-primary">{message.author.badge}</span>}{formatTime(message.createdAt)}</span>{message.source === 'discord' && <span className="rounded bg-[#6675b9]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#6675b9]">DISCORD</span>}</div><p data-testid={`text-message-${message.id}`} className="mt-1 max-w-2xl text-sm leading-6 text-foreground/80">{message.content}</p></div><button type="button" data-testid={`button-message-more-${message.id}`} className="hidden h-7 w-7 rounded-lg text-muted-foreground hover:bg-secondary group-hover:block"><MoreHorizontal className="mx-auto h-4 w-4" /></button></div>)}</div>}{messagesQuery.isError && <p data-testid="status-chat-fallback" className="mt-5 text-center text-[11px] text-muted-foreground">Showing the last saved conversation while Discord reconnects.</p>}</div></div><div className="border-t border-border bg-card/80 p-3 md:p-5"><div className="relative mx-auto max-w-3xl"><div className="flex items-end gap-2 rounded-2xl border border-border bg-secondary/60 p-2 focus-within:border-primary/50"><IconButton label="attach image"><ImageIcon className="h-[18px] w-[18px]" /></IconButton><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} data-testid="input-message-composer" placeholder={`Message #${channel.name}`} rows={1} className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground" /><button type="button" onClick={() => setMentionsOpen((value) => !value)} data-testid="button-open-mentions" className="grid h-9 w-9 place-items-center rounded-xl text-xs font-bold text-muted-foreground hover:bg-card hover:text-primary">@</button><button type="button" onClick={sendMessage} disabled={!draft.trim()} data-testid="button-send-message" className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white transition-opacity disabled:opacity-35"><Send className="h-4 w-4" /></button></div>{mentionsOpen && <div className="absolute bottom-14 right-12 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl"><p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mention someone</p>{[demoOverview.developer, { id: 'u2', name: 'Jules Avery', handle: 'jules', avatarUrl: '', status: 'online' as const }].map((user) => <button type="button" key={user.id} onClick={() => { setDraft((value) => `${value}@${user.handle} `); setMentionsOpen(false); }} data-testid={`button-mention-${user.id}`} className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-xs font-semibold hover:bg-secondary"><Avatar user={user} size="sm" /><span>{user.name}</span></button>)}</div>}<p className="mt-2 hidden px-2 text-[10px] text-muted-foreground sm:block">Press <span className="mono">Enter</span> to send · Shift + Enter for a new line</p></div></div></div><ProfileSheet user={profile} onClose={() => setProfile(null)} /></div>;
}

function GiveawaysPage() {
  const queryClient = useQueryClient();
  const giveawayQuery = useListGiveaways({ query: { queryKey: getListGiveawaysQueryKey() } });
  const joinGiveaway = useJoinGiveaway();
  const [joined, setJoined] = useState<string[]>([]);
  const giveaways = hasItems(giveawayQuery.data) ? giveawayQuery.data : demoGiveaways;
  const join = (id: string) => { setJoined((items) => items.includes(id) ? items : [...items, id]); joinGiveaway.mutate({ giveawayId: id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGiveawaysQueryKey() }), onError: () => undefined }); };
  return <div className="mx-auto w-full max-w-[1180px] p-4 md:p-8"><SectionHeading eyebrow="Community drops" title="A reason to check back." action={<span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:flex"><Gift className="h-3.5 w-3.5 text-primary" /> Member only</span>} /><div className="mb-7 flex items-center justify-between rounded-2xl border border-[#e5bd76]/30 bg-[#e5bd76]/10 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e5bd76]/20 text-[#aa7b2e]"><Sparkles className="h-4 w-4" /></div><p className="text-xs leading-relaxed text-[#78602a]">Every drop is made for this community. No forms, no noise — just show up and throw your name in.</p></div></div>{giveawayQuery.isError && <p data-testid="status-giveaways-fallback" className="mb-4 rounded-xl bg-secondary px-4 py-3 text-xs text-muted-foreground">Live drops are temporarily cached. You can still enter local events.</p>}{giveaways.length === 0 ? <EmptyState icon={<Gift />} title="No drops right now" body="The next one is being cooked. Come back soon." /> : <div className="grid gap-4 md:grid-cols-2">{giveaways.map((giveaway, index) => { const hasJoined = joined.includes(giveaway.id); return <article key={giveaway.id} data-testid={`card-giveaway-${giveaway.id}`} className={`panel lift overflow-hidden rounded-[24px] ${index === 0 ? 'md:col-span-2 md:flex' : ''}`}><div className={`relative ${index === 0 ? 'h-52 md:h-auto md:w-[42%]' : 'h-40'} bg-gradient-to-br ${index === 0 ? 'from-[#272147] via-[#765caf] to-[#e28a85]' : index === 1 ? 'from-[#234a59] via-[#4a938c] to-[#d4bc76]' : 'from-[#3e315e] via-[#8a5c9a] to-[#d68a9f]'}`}><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 0 1px, transparent 1px)', backgroundSize: '34px 34px' }} /><div className="absolute left-5 top-5 rounded-lg bg-white/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-white backdrop-blur">Limited drop</div><div className="absolute bottom-5 left-5"><p className="display max-w-[230px] text-2xl font-bold leading-none text-white">{giveaway.prize}</p></div></div><div className="flex flex-1 flex-col justify-between p-5 md:p-6"><div><div className="flex items-start justify-between gap-3"><div><h2 className="display text-xl font-bold">{giveaway.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{giveaway.description}</p></div><span className="flex shrink-0 items-center gap-1 rounded-lg bg-[#e5bd76]/15 px-2 py-1 text-[10px] font-bold text-[#a1752e]"><Clock3 className="h-3 w-3" /> {timeLeft(giveaway.endsAt)}</span></div></div><div className="mt-6 flex items-center justify-between gap-3"><div><p className="text-xs font-bold">{giveaway.participants + (hasJoined ? 1 : 0)} members entered</p><div className="mt-2 flex items-center gap-1"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary"><div className="h-full w-[68%] rounded-full bg-primary" /></div><span className="text-[10px] text-muted-foreground">68% claimed</span></div></div><button type="button" onClick={() => join(giveaway.id)} disabled={hasJoined || joinGiveaway.isPending} data-testid={`button-join-giveaway-${giveaway.id}`} className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5 ${hasJoined ? 'bg-[#5ac7aa]/15 text-[#3c9e88]' : 'bg-primary text-white'}`}>{hasJoined ? 'You are in' : 'Enter drop'} {!hasJoined && <ArrowRight className="ml-1 inline h-3.5 w-3.5" />}</button></div></div></article>; })}</div>}</div>;
}

function LeaderboardPage() {
  const [period, setPeriod] = useState('This week');
  return <div className="mx-auto w-full max-w-[1080px] p-4 md:p-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><SectionHeading eyebrow="Community signal" title="Who is showing up?" /><div className="flex rounded-xl bg-secondary p-1">{['This week', 'All time'].map((item) => <button type="button" key={item} onClick={() => setPeriod(item)} data-testid={`button-period-${item.toLowerCase().replace(' ', '-')}`} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${period === item ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{item}</button>)}</div></div><div className="grid gap-4 lg:grid-cols-[.9fr_1.4fr]"><section className="panel relative overflow-hidden rounded-[26px] bg-sidebar p-6 text-white md:p-8"><div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[25px] border-primary/20" /><Trophy className="relative h-7 w-7 text-[#e5bd76]" /><p className="mono relative mt-9 text-[10px] uppercase tracking-[.2em] text-[#9a91bd]">Your standing</p><p data-testid="text-leaderboard-rank" className="display relative mt-1 text-6xl font-bold">#04</p><p className="relative mt-2 text-sm text-[#aaa5be]">You moved up <span className="font-bold text-[#5ac7aa]">6 places</span> this week.</p><div className="relative mt-9 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-xs text-[#aaa5be]">Weekly points</span><span className="mono text-lg font-medium text-white">1,318</span></div></section><section className="panel rounded-[26px] p-4 md:p-6"><div className="mb-3 flex items-center justify-between px-2"><p className="mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Top contributors</p><span className="text-[10px] font-semibold text-muted-foreground">Updated 4m ago</span></div><div>{leaderboard.map((person, index) => <button type="button" key={person.handle} data-testid={`row-leaderboard-${person.handle}`} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-secondary"><span className={`mono w-6 text-center text-sm font-medium ${index < 3 ? 'text-[#b1853b]' : 'text-muted-foreground'}`}>{String(index + 1).padStart(2, '0')}</span><span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${person.color} text-xs font-bold text-white`}>{initials(person.name)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{person.name} {person.badge && <span className="ml-1 rounded bg-primary/10 px-1 text-[9px] font-bold text-primary">{person.badge}</span>}</span><span className="block truncate text-[11px] text-muted-foreground">@{person.handle}</span></span><span className="text-right"><span className="mono block text-sm font-medium">{person.points.toLocaleString()}</span><span className={`text-[10px] font-bold ${person.change.startsWith('+') ? 'text-[#4d9c87]' : 'text-[#c66e75]'}`}>{person.change}</span></span></button>)}</div></section></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><MetricCard icon={<Zap />} label="Points this week" value="1,318" detail="+248 today" tone="purple" /><MetricCard icon={<MessageCircle />} label="Messages sent" value="47" detail="top 12%" tone="teal" /><MetricCard icon={<Crown />} label="Current streak" value="09 days" detail="keep it going" tone="gold" /></div></div>;
}

function ProfilePage() {
  const params = useParams<{ id: string }>();
  const isMe = params.id === 'u-me';
  const user: User = isMe ? demoUser : { id: params.id ?? 'u2', name: 'Jules Avery', handle: 'jules', avatarUrl: '', status: 'online', role: 'Moderator', badge: 'MOD' };
  return <div className="mx-auto w-full max-w-[920px] p-4 md:p-8"><div className="panel overflow-hidden rounded-[28px]"><div className="relative h-36 bg-gradient-to-r from-[#292443] via-[#5b4b9b] to-[#d48c86] md:h-48"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,.3) 35.5%, transparent 36%), linear-gradient(60deg, transparent 60%, rgba(255,255,255,.18) 60.5%, transparent 61%)' }} /></div><div className="px-5 pb-6 md:px-8"><div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-end gap-4"><Avatar user={user} size="lg" /><div className="pb-1"><div className="flex items-center gap-2"><h1 data-testid="text-profile-name" className="display text-2xl font-bold">{user.name}</h1>{user.badge && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{user.badge}</span>}</div><p className="text-sm text-muted-foreground">@{user.handle}</p></div></div><button type="button" data-testid="button-edit-profile" className="flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /> {isMe ? 'Edit profile' : 'Send a wave'}</button></div><div className="mt-8 grid grid-cols-3 gap-2 border-y border-border py-5 text-center sm:max-w-md sm:text-left sm:flex sm:gap-9"><div><p className="mono text-lg font-medium">1,318</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Points</p></div><div><p className="mono text-lg font-medium">#04</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Rank</p></div><div><p className="mono text-lg font-medium">7</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Rings</p></div></div><div className="mt-7 grid gap-7 md:grid-cols-[1fr_.8fr]"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">About</p><p className="mt-3 max-w-lg text-sm leading-7 text-foreground/75">{isMe ? 'Building spaces where good people find their people. Usually online after sunset, always up for a ranked run.' : 'Moderator, route hunter, and the person to ask when you need a crew for a late-night run.'}</p></div><div><p className="mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Collected rings</p><div className="mt-3 flex gap-3">{['from-[#e5bd76] to-[#e58a83]', 'from-[#83d1bd] to-[#6b8cd4]', 'from-[#b998ed] to-[#e38ca8]', 'from-[#8fa8d7] to-[#665491]'].map((gradient) => <span key={gradient} className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${gradient} shadow-[inset_0_0_0_3px_rgba(255,255,255,.38)]`}><span className="h-6 w-6 rounded-full border border-white/50" /></span>)}</div></div></div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="panel rounded-2xl p-4"><Radio className="h-4 w-4 text-[#5ac7aa]" /><p className="mt-4 text-sm font-bold">Online now</p><p className="mt-1 text-xs text-muted-foreground">Last seen in #general</p></div><div className="panel rounded-2xl p-4"><ShieldCheck className="h-4 w-4 text-primary" /><p className="mt-4 text-sm font-bold">Member since</p><p className="mt-1 text-xs text-muted-foreground">January 2024</p></div><div className="panel rounded-2xl p-4"><Gamepad2 className="h-4 w-4 text-[#b1853b]" /><p className="mt-4 text-sm font-bold">Main game</p><p className="mt-1 text-xs text-muted-foreground">Skyline Drift</p></div></div></div>;
}

function AdminPage() {
  const createGiveaway = useCreateGiveaway();
  const [discordSync, setDiscordSync] = useState(true);
  const [showPresence, setShowPresence] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const [description, setDescription] = useState('');
  const [created, setCreated] = useState(false);
  const submitGiveaway = (event: React.FormEvent) => { event.preventDefault(); if (!title || !prize || !description) return; createGiveaway.mutate({ data: { title, prize, description, endsAt: new Date(Date.now() + 604800000).toISOString(), previewUrl: null } }, { onSuccess: () => setCreated(true), onError: () => setCreated(true) }); };
  return <div className="mx-auto w-full max-w-[1080px] p-4 md:p-8"><SectionHeading eyebrow="Owner controls" title="Keep the arena feeling alive." action={<span className="flex items-center gap-2 rounded-full bg-[#5ac7aa]/12 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#3d9e8a]"><span className="h-1.5 w-1.5 rounded-full bg-current" /> Owner access</span>} /><div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="panel rounded-[26px] p-5 md:p-7"><div className="mb-6 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Settings className="h-5 w-5" /></div><div><h2 className="display font-bold">Community settings</h2><p className="text-xs text-muted-foreground">Small switches, noticeable difference.</p></div></div><ToggleRow label="Discord sync" detail="Mirror messages and channel presence" checked={discordSync} onChange={() => setDiscordSync((value) => !value)} testId="toggle-discord-sync" /><ToggleRow label="Show live presence" detail="Let members see who is online" checked={showPresence} onChange={() => setShowPresence((value) => !value)} testId="toggle-live-presence" /><div className="my-5 h-px bg-border" /><div className="flex items-center justify-between"><div><p className="text-sm font-bold">Connected server</p><p className="mt-1 text-xs text-muted-foreground">Nova Arena HQ · 2,840 members</p></div><button type="button" data-testid="button-manage-discord" className="rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-secondary">Manage</button></div></section><section className="panel rounded-[26px] p-5 md:p-7"><div className="flex items-center justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Giveaways</p><h2 className="display mt-1 text-xl font-bold">Make a drop</h2></div><Gift className="h-5 w-5 text-[#b1853b]" /></div>{created && <p data-testid="status-giveaway-created" className="mt-5 rounded-xl bg-[#5ac7aa]/12 p-3 text-xs font-semibold text-[#3d9e8a]">Drop saved. It is ready for the community.</p>}{!formOpen ? <><p className="mt-5 text-sm leading-6 text-muted-foreground">Create a reason for members to check in, invite a friend, and stay a little longer.</p><button type="button" onClick={() => setFormOpen(true)} data-testid="button-open-create-giveaway" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white"><Plus className="h-4 w-4" /> New giveaway</button></> : <form onSubmit={submitGiveaway} className="mt-5 space-y-3"><input value={title} onChange={(event) => setTitle(event.target.value)} data-testid="input-giveaway-title" placeholder="Drop title" className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-3 text-sm outline-none focus:border-primary" /><input value={prize} onChange={(event) => setPrize(event.target.value)} data-testid="input-giveaway-prize" placeholder="Prize" className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-3 text-sm outline-none focus:border-primary" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} data-testid="input-giveaway-description" placeholder="A short description" rows={3} className="w-full resize-none rounded-xl border border-border bg-secondary/40 px-3 py-3 text-sm outline-none focus:border-primary" /><div className="flex gap-2"><button type="button" onClick={() => setFormOpen(false)} data-testid="button-cancel-giveaway" className="flex-1 rounded-xl border border-border py-3 text-xs font-bold hover:bg-secondary">Cancel</button><button type="submit" disabled={createGiveaway.isPending} data-testid="button-submit-giveaway" className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white disabled:opacity-60">{createGiveaway.isPending ? 'Saving...' : 'Publish drop'}</button></div></form>}</section></div><section className="mt-5 grid gap-3 sm:grid-cols-3"><AdminStat icon={<Users />} label="Community members" value="2,840" detail="+84 this month" /><AdminStat icon={<Activity />} label="Messages today" value="1,904" detail="across 18 channels" /><AdminStat icon={<Gift />} label="Active drops" value="03" detail="next ends in 7h" /></section></div>;
}

function ToggleRow({ label, detail, checked, onChange, testId }: { label: string; detail: string; checked: boolean; onChange: () => void; testId: string }) {
  return <div className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><button type="button" onClick={onChange} aria-pressed={checked} data-testid={testId} className={`relative h-6 w-11 shrink-0 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-secondary'}`}><span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>;
}

function AdminStat({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="panel rounded-2xl p-4"><span className="text-primary">{icon}</span><p className="mono mt-5 text-2xl font-medium">{value}</p><p className="mt-1 text-xs font-bold">{label}</p><p className="mt-2 text-[10px] text-muted-foreground">{detail}</p></div>;
}

function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const login = (event: React.FormEvent) => { event.preventDefault(); if (email.trim()) { setSubmitted(true); setTimeout(() => setLocation('/'), 350); } };
  return <div className="noise flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#eeedf5] p-4"><div className="absolute left-[-10%] top-[-12%] h-[420px] w-[420px] rounded-full border-[70px] border-primary/10" /><div className="absolute bottom-[-20%] right-[-4%] h-[380px] w-[380px] rounded-full bg-[#e5bd76]/15 blur-3xl" /><main className="panel relative z-10 grid w-full max-w-[900px] overflow-hidden rounded-[30px] md:grid-cols-[.9fr_1.1fr]"><div className="hidden flex-col justify-between bg-sidebar p-9 text-white md:flex"><div><div className="flex items-center gap-3"><BrandMark /><span className="display font-bold">NOVA ARENA</span></div><p className="mono mt-20 text-[10px] uppercase tracking-[.25em] text-[#a99bea]">A place to return to</p><h1 className="display mt-3 text-4xl font-bold leading-tight">Find your people.<br />Make some noise.</h1></div><div className="flex items-center gap-3 text-xs text-[#aaa5be]"><span className="h-2 w-2 rounded-full bg-[#5ac7aa]" /> 284 members are online now</div></div><div className="bg-card p-6 md:p-12"><div className="mb-10 md:hidden"><BrandMark /></div><p className="mono text-[10px] uppercase tracking-[.2em] text-primary">Welcome back</p><h2 className="display mt-2 text-3xl font-bold">Enter the arena.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Sign in with Discord to keep your profile, rings, and conversations in one place.</p><form onSubmit={login} className="mt-8 space-y-4"><button type="button" onClick={() => { setSubmitted(true); setTimeout(() => setLocation('/'), 350); }} data-testid="button-login-discord" className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865f2] py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">Continue with Discord <ArrowRight className="h-4 w-4" /></button><div className="flex items-center gap-3 py-2"><div className="h-px flex-1 bg-border" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">or email</span><div className="h-px flex-1 bg-border" /></div><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} data-testid="input-login-email" placeholder="you@example.com" className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary" /><button type="submit" data-testid="button-login-email" className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-bold text-background">{submitted ? 'Opening your space...' : 'Continue with email'} <ArrowRight className="h-4 w-4" /></button></form><p className="mt-8 text-center text-[11px] leading-5 text-muted-foreground">By continuing, you agree to the community guidelines.<br />There is no algorithm here. Just people.</p></div></main></div>;
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">{icon}</span><h2 className="display mt-4 text-lg font-bold">{title}</h2><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{body}</p></div>;
}

function Router() {
  const [location] = useLocation();
  if (location === '/login') return <LoginPage />;
  return <Shell><ErrorBoundary resetKey={location}><Switch><Route path="/" component={HomePage} /><Route path="/chat" component={ChatPage} /><Route path="/giveaways" component={GiveawaysPage} /><Route path="/leaderboard" component={LeaderboardPage} /><Route path="/profile/:id" component={ProfilePage} /><Route path="/admin" component={AdminPage} /><Route component={NotFound} /></Switch></ErrorBoundary></Shell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;