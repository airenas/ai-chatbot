import { ExternalLink } from '@/components/external-link'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Jūs sveikina policijos robotas!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Olia, olia, kokios pagalbos reikia šiandien?{' '} 
        </p>
        <p className="leading-normal text-muted-foreground">
          Norite paklausyti {' '}
          <ExternalLink href="https://www.youtube.com/watch?v=EBsgTJQFl9k?autoplay=1">
          Rim Tim Tagi Dim
          </ExternalLink>?
        </p>
      </div>
    </div>
  )
}
