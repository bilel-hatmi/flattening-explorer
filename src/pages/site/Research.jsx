import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page, PageHeader } from '../../components/site/Section';
import Prose from '../../components/site/Prose';
import parseFrontmatter from '../../utils/frontmatter';
import raw from '../../content/research.md?raw';

const { content } = parseFrontmatter(raw);

export default function Research() {
  useDocumentTitle('Research');
  return (
    <Page>
      <PageHeader kicker="Vision, then what is under way" title="Research" />
      <Prose markdown={content} />
    </Page>
  );
}
