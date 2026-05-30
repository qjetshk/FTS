import { AuthVisual } from "@/widgets/auth-visual"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col px-8 py-10 sm:px-12 lg:w-1/2">
        {children}
      </div>
      <div className="sticky top-0 hidden h-screen w-1/2 lg:block">
        <AuthVisual />
      </div>
    </div>
  )
}
