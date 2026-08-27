import { useState, type FormEvent } from 'react'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { inboxForInterest, projectInterests, siteConfig } from '@/data/site'

type FormState = { name: string; email: string; company: string; interest: string; context: string }
const initial: FormState = { name: '', email: '', company: '', interest: '', context: '' }

export function ContactPage() {
  const [form, setForm] = useState<FormState>(initial)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [destination, setDestination] = useState<string>(siteConfig.email)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((prev) => ({ ...prev, [key]: value })) }

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setStatus('submitting')
    try {
      if (!form.name.trim() || !form.email.trim() || !form.interest) { setStatus('error'); return }
      const inbox = inboxForInterest(form.interest); setDestination(inbox)
      const subject = encodeURIComponent(`[1DevTeam] ${form.interest}`)
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nCompany or role: ${form.company || 'Not provided'}\nInterest: ${form.interest}\n\nContext:\n${form.context || 'Not provided'}`)
      window.location.href = `mailto:${inbox}?subject=${subject}&body=${body}`
      setStatus('success'); setForm(initial)
    } catch { setStatus('error') }
  }

  return (
    <>
      <Seo title="Contact" description="Start a conversation with 1DevTeam about software, systems, products, existing-system remediation, AI-enabled development, or applied R&D." path="/contact" />
      <PageHero eyebrow="Contact" title="Bring us the problem" description="Tell us what you are trying to build, fix, understand, or explore. A useful first conversation starts with the problem and the surrounding system, not a predetermined technology stack." />

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            {status === 'success' ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--success)]/30 bg-white p-6" role="status">
                <h2 className="text-xl font-semibold">Email draft opened</h2>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]">Your email application should contain the prepared message. Review and send it there; the website does not claim receipt until your email provider sends it.</p>
                <p className="mt-2 text-sm text-[var(--text-subtle)]">Destination: <a href={`mailto:${destination}`} className="font-medium text-[var(--brand)] hover:underline">{destination}</a></p>
                <Button type="button" variant="outline" className="mt-5" onClick={() => setStatus('idle')}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-sm md:p-8" data-analytics="contact-form" noValidate>
                <div className="space-y-2"><Label htmlFor="name">Name <span className="text-[var(--danger)]">*</span></Label><Input id="name" name="name" autoComplete="name" required value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="email">Work email <span className="text-[var(--danger)]">*</span></Label><Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="company">Company or role</Label><Input id="company" name="company" autoComplete="organization" value={form.company} onChange={(e) => update('company', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="interest">Project interest <span className="text-[var(--danger)]">*</span></Label><select id="interest" name="interest" required value={form.interest} onChange={(e) => update('interest', e.target.value)} className="flex h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-3.5 text-[15px] text-[var(--text)] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-bright)]"><option value="" disabled>Select an option</option>{projectInterests.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="context">Context (optional)</Label><Textarea id="context" name="context" rows={5} placeholder="What are you trying to build, fix, understand, or explore?" value={form.context} onChange={(e) => update('context', e.target.value)} /></div>
                {status === 'error' && <p className="text-sm text-[var(--danger)]" role="alert">Please complete the required fields.</p>}
                <Button type="submit" size="lg" disabled={status === 'submitting'}>{status === 'submitting' ? 'Opening…' : 'Open email draft'}</Button>
              </form>
            )}
          </div>
          <aside className="space-y-6">
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6"><h2 className="text-lg font-semibold">Direct email</h2><p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]"><a href={`mailto:${siteConfig.email}`} className="font-medium text-[var(--brand)] hover:underline">{siteConfig.email}</a><br />Ajenda: <a href={`mailto:${siteConfig.productEmail}`} className="font-medium text-[var(--brand)] hover:underline">{siteConfig.productEmail}</a></p></div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6"><h2 className="text-lg font-semibold">A useful first message</h2><p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]">Describe the problem, the system around it, what already exists, and what would make the work successful. Uncertainty is fine; we would rather identify missing information than invent it.</p></div>
          </aside>
        </div>
      </section>
    </>
  )
}
