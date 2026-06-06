import AiToolsBrowser from '@/components/ai-tools/AiToolsBrowser'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'

export default function ToolsPage() {
  return (
    <>
      <PageMeta title={zh.tools.title} description={zh.tools.subtitle} />

      <section className="page-container py-10 lg:py-14 max-w-5xl">
        <header className="mb-8 max-w-2xl">
          <h1 className="section-title">{zh.tools.title}</h1>
          <p className="mt-3 text-secondary leading-relaxed">{zh.tools.subtitle}</p>
        </header>

        <AiToolsBrowser />
      </section>
    </>
  )
}
