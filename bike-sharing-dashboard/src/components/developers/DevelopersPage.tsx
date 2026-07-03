import { useMemo, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Copy, Check, Bike, ArrowLeft } from 'lucide-react';

// Content lives in plain markdown files; add or edit a file and redeploy.
const docModules = import.meta.glob('../../content/docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const docs = Object.keys(docModules)
  .sort()
  .map((path) => docModules[path]);

// Mirrors rehype-slug (github-slugger) closely enough for our headings
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');

interface NavItem {
  text: string;
  id: string;
  level: number;
}

const buildNav = (markdown: string): NavItem[] =>
  markdown
    .split('\n')
    .filter((line) => /^#{1,2} /.test(line))
    .map((line) => {
      const level = line.startsWith('##') ? 2 : 1;
      const text = line.replace(/^#{1,2} /, '');
      return { text, id: slugify(text), level };
    });

const extractText = (node: ReactNode): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
};

const CodeBlock = ({ children }: { children?: ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const text = extractText(children).replace(/\n$/, '');

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group relative mb-4">
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm leading-6 text-gray-100">
        {children}
      </pre>
      <button
        onClick={copy}
        aria-label="Copy to clipboard"
        className="absolute right-2 top-2 rounded-md bg-gray-700/80 p-2 text-gray-300 opacity-0 transition-opacity hover:bg-gray-600 hover:text-white focus:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

const markdownComponents = {
  h1: (props: { id?: string; children?: ReactNode }) => (
    <h1 id={props.id} className="mb-4 mt-12 scroll-mt-6 text-3xl font-bold text-gray-900 first:mt-0">
      {props.children}
    </h1>
  ),
  h2: (props: { id?: string; children?: ReactNode }) => (
    <h2 id={props.id} className="group mb-3 mt-10 scroll-mt-6 border-b border-gray-200 pb-2 text-2xl font-semibold text-gray-900">
      {props.children}
      {props.id && (
        <a href={`#${props.id}`} className="ml-2 text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Link to section">
          #
        </a>
      )}
    </h2>
  ),
  h3: (props: { id?: string; children?: ReactNode }) => (
    <h3 id={props.id} className="mb-2 mt-8 scroll-mt-6 font-mono text-lg font-semibold text-gray-800">
      {props.children}
    </h3>
  ),
  p: (props: { children?: ReactNode }) => (
    <p className="mb-4 leading-7 text-gray-600">{props.children}</p>
  ),
  a: (props: { href?: string; children?: ReactNode }) => (
    <a href={props.href} className="text-blue-600 hover:underline" target={props.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {props.children}
    </a>
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-600">{props.children}</ul>
  ),
  table: (props: { children?: ReactNode }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{props.children}</table>
    </div>
  ),
  th: (props: { children?: ReactNode }) => (
    <th className="border border-gray-200 bg-gray-50 p-2 text-left font-semibold text-gray-700">{props.children}</th>
  ),
  td: (props: { children?: ReactNode }) => (
    <td className="border border-gray-200 p-2 text-gray-600">{props.children}</td>
  ),
  pre: (props: { children?: ReactNode }) => <CodeBlock>{props.children}</CodeBlock>,
  code: (props: { children?: ReactNode; className?: string }) =>
    props.className ? (
      <code className={props.className}>{props.children}</code>
    ) : (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800">
        {props.children}
      </code>
    ),
};

const DevelopersPage = () => {
  const nav = useMemo(() => docs.map(buildNav), []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-gray-900">
            <Bike className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">Cycle Tracker</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">Developers</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-8 space-y-1 text-sm">
            {nav.flat().map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block rounded px-2 py-1 hover:bg-gray-100 hover:text-gray-900 ${
                  item.level === 1 ? 'mt-4 font-semibold text-gray-800 first:mt-0' : 'pl-4 text-gray-500'
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 max-w-3xl flex-1">
          {docs.map((markdown, i) => (
            <ReactMarkdown
              key={i}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          ))}
        </main>
      </div>
    </div>
  );
};

export default DevelopersPage;
