import { FileQuestion } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'

export default function NotFoundPage() {
  return (
    <>
      <PageMeta title={zh.notFound.title} description={zh.notFound.description} />
      <section className="page-container py-24 lg:py-32">
        <EmptyState
          icon={<FileQuestion size={48} strokeWidth={1.25} />}
          title={zh.notFound.title}
          description={zh.notFound.description}
          actionLabel={zh.notFound.backHome}
          actionTo="/"
        />
      </section>
    </>
  )
}
