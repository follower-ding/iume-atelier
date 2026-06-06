import TaxonomyPanel from '@/components/business/TaxonomyPanel'
import { zh } from '@/locales/zh'

export default function ConsoleTaxonomyPage() {
  return (
    <div className="console-page">
      <header className="console-page__header">
        <h1>{zh.console.taxonomy}</h1>
        <p>{zh.console.taxonomyDesc}</p>
      </header>
      <TaxonomyPanel />
    </div>
  )
}
