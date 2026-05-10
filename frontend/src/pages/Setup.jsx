import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || ''
const CONFIG_URL = `${API}/api/dink/config`

function Section({ title, children }) {
  return (
    <section className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm p-6 space-y-4">
      <h2 className="text-lg font-cinzel font-bold text-osrs-gold">{title}</h2>
      {children}
    </section>
  )
}

function Step({ n, children }) {
  return (
    <div className="flex gap-4">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-osrs-gold/15 border border-osrs-gold/30 text-osrs-gold text-sm font-bold font-cinzel flex items-center justify-center">{n}</span>
      <p className="text-white/80 text-sm leading-relaxed pt-0.5">{children}</p>
    </div>
  )
}

function FAQ({ q, children }) {
  return (
    <div className="space-y-1.5">
      <p className="text-white font-semibold text-sm">{q}</p>
      <p className="text-white/60 text-sm leading-relaxed">{children}</p>
    </div>
  )
}

function CodeBlock({ value }) {
  return (
    <code className="block bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-osrs-gold font-mono text-sm break-all select-all">
      {value}
    </code>
  )
}

export default function Setup() {
  return (
    <div className="min-h-screen page-bg text-white">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-cinzel font-bold text-osrs-gold mb-1">Setup Guide</h1>
          <p className="text-white/40 text-sm">Connect Dink for automatic tile tracking — takes about 2 minutes</p>
        </div>

        <Section title="Getting Started">
          <div className="space-y-4">
            <Step n="1">
              Open <span className="text-white font-medium">RuneLite</span> and click the puzzle piece icon to open the{' '}
              <span className="text-white font-medium">Plugin Hub</span>. Search for{' '}
              <span className="text-white font-medium">Dink</span> and install it.
            </Step>
            <Step n="2">
              Open the Dink plugin settings, scroll to the{' '}
              <span className="text-white font-medium">Advanced</span> section, and paste the following URL into the{' '}
              <span className="text-white font-medium">Dynamic Configuration URL</span> field:
            </Step>
            <CodeBlock value={CONFIG_URL} />
            <Step n="3">
              Restart your RuneLite client. Once it reloads, open the Dink settings and confirm that a{' '}
              <span className="text-white font-medium">Webhook URL</span> is now visible at the top of the plugin
              configuration — this means it worked.
            </Step>
          </div>
        </Section>

        <Section title="How It Works">
          <div className="space-y-3 text-sm text-white/70 leading-relaxed">
            <p>
              The Dynamic Configuration URL tells Dink to fetch all its settings automatically — including the webhook
              address and which notification types to send. You don't need to configure anything else manually.
            </p>
            <p>
              When you do something in-game that triggers a configured notification (e.g. receiving a drop, dying,
              gaining a level), Dink sends the event to our server. The server matches your{' '}
              <span className="text-white font-medium">in-game username</span> to your registered player profile and
              checks if the event satisfies any active tile criteria.
            </p>
            <p>
              Matching completions are submitted for admin review and will appear on the{' '}
              <span className="text-white font-medium">Feed</span> once approved.
            </p>
          </div>
        </Section>

        <Section title="FAQ">
          <div className="space-y-5 divide-y divide-white/8">
            <FAQ q="The webhook URL isn't appearing after I restart — what's wrong?">
              Double-check that you pasted the Dynamic Configuration URL into the correct field under the{' '}
              <strong className="text-white/80">Advanced</strong> section of Dink (not the main Webhook URL field at the
              top). Make sure you fully restarted RuneLite, not just reloaded the plugin.
            </FAQ>
            <div className="pt-5">
              <FAQ q="How does the system know who I am?">
                Your in-game username is included in every Dink notification. The server matches it against the player
                list — so make sure the name registered for your account matches your exact OSRS username.
              </FAQ>
            </div>
            <div className="pt-5">
              <FAQ q="I triggered an event but my tile didn't complete — why?">
                The tile criteria must match the event exactly (e.g. the correct item name or event type). Contact your
                event admin — they can manually approve submissions or adjust tile settings from the dashboard.
              </FAQ>
            </div>
            <div className="pt-5">
              <FAQ q="Will Dink send screenshots along with completions?">
                Yes, if the notification type supports it and the option is enabled in the config. Screenshots will
                appear alongside the completion in the Feed.
              </FAQ>
            </div>
            <div className="pt-5">
              <FAQ q="Do I need to update anything when new tiles are added?">
                No. The dynamic configuration is fetched from the server, so any changes to tile tracking or webhook
                settings take effect automatically on your next client restart.
              </FAQ>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
