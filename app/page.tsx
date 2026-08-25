import PageContent from "./PageContent";
import { DEFAULT_PAGE_CONTENT } from "./lib/pageContent";

// Add dynamic rendering to test graphQL call is being made on page load
export const dynamic = "force-dynamic";

export default function Home() {
  return <PageContent config={DEFAULT_PAGE_CONTENT} />;
}
