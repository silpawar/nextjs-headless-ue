import PageContent from "./PageContent";
import { DEFAULT_PAGE_CONTENT } from "./lib/pageContent";

export default function Home() {
  return <PageContent config={DEFAULT_PAGE_CONTENT} />;
}
