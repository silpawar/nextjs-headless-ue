/** Preview routes: public SSR (no UE referer / iframe gate). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PreviewRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
