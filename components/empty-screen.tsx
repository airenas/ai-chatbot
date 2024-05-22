
export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Laba diena!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Aš Policijos departamento Informacijos teikimo skyriaus informavimo robotas <span
            style={{ fontWeight: 'bold' }}> DiPOLIS</span>.
        </p>
        <p className="leading-normal text-muted-foreground">
          Kuo galiu padėti?
        </p>
      </div>
    </div>
  )
}
