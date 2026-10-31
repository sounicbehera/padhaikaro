import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-lg overflow-hidden border border-gray-700/60 bg-gray-950 shadow-md text-xs w-full max-w-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 text-gray-300">
        <span className="font-mono text-[11px] font-medium text-emerald-400 lowercase tracking-wider">
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed text-gray-100 bg-[#0d1117]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const renderInline = (str, keyPrefix = '') => {
  if (!str) return null;

  // Regex to match inline code `code`, bold+italic ***text***, bold **text** or __text__, italic *text* or _text_, and links [text](url)
  const regex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
  const elements = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <React.Fragment key={`${keyPrefix}-txt-${idx++}`}>
          {str.slice(lastIndex, match.index)}
        </React.Fragment>
      );
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      elements.push(
        <code
          key={`${keyPrefix}-code-${idx++}`}
          className="bg-black/8 text-brand-900 px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs font-semibold border border-black/5"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('***') && token.endsWith('***')) {
      elements.push(
        <strong key={`${keyPrefix}-bi-${idx++}`} className="font-bold italic text-gray-900">
          {token.slice(3, -3)}
        </strong>
      );
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      elements.push(
        <strong key={`${keyPrefix}-b-${idx++}`} className="font-bold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      elements.push(
        <em key={`${keyPrefix}-i-${idx++}`} className="italic text-gray-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (match[2] && match[3]) {
      elements.push(
        <a
          key={`${keyPrefix}-link-${idx++}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline font-medium hover:text-brand-700"
        >
          {match[2]}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < str.length) {
    elements.push(
      <React.Fragment key={`${keyPrefix}-txt-${idx++}`}>
        {str.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return elements;
};

const parseBlocks = (text) => {
  if (!text) return [];
  const lines = text.split('\n');
  const rawBlocks = [];
  let inCode = false;
  let codeLang = '';
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        codeLines = [];
      } else {
        inCode = false;
        rawBlocks.push({ type: 'code_block', lang: codeLang, code: codeLines.join('\n') });
        codeLang = '';
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Heading (# to ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      rawBlocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      continue;
    }

    // Bullet item (- , * , • )
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.*)$/);
    if (bulletMatch) {
      rawBlocks.push({
        type: 'bullet',
        text: bulletMatch[3],
        indent: bulletMatch[1].length
      });
      continue;
    }

    // Numbered item (1. , 2. )
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numMatch) {
      rawBlocks.push({
        type: 'number',
        num: numMatch[2],
        text: numMatch[3],
        indent: numMatch[1].length
      });
      continue;
    }

    // Empty line
    if (!trimmed) {
      rawBlocks.push({ type: 'break' });
      continue;
    }

    rawBlocks.push({ type: 'paragraph', text: line });
  }

  if (inCode && codeLines.length > 0) {
    rawBlocks.push({ type: 'code_block', lang: codeLang, code: codeLines.join('\n') });
  }

  // Group consecutive list items
  const grouped = [];
  let currentList = null;

  for (const block of rawBlocks) {
    if (block.type === 'bullet') {
      if (!currentList || currentList.type !== 'bullet_list') {
        currentList = { type: 'bullet_list', items: [] };
        grouped.push(currentList);
      }
      currentList.items.push(block);
    } else if (block.type === 'number') {
      if (!currentList || currentList.type !== 'number_list') {
        currentList = { type: 'number_list', items: [] };
        grouped.push(currentList);
      }
      currentList.items.push(block);
    } else {
      currentList = null;
      grouped.push(block);
    }
  }

  // Deduplicate consecutive breaks
  const filtered = [];
  for (let i = 0; i < grouped.length; i++) {
    const item = grouped[i];
    if (item.type === 'break') {
      if (filtered.length === 0 || filtered[filtered.length - 1].type === 'break') {
        continue;
      }
      if (i === grouped.length - 1) {
        continue;
      }
    }
    filtered.push(item);
  }

  return filtered;
};

const ChatMessageContent = ({ content, isBot }) => {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-1 text-sm text-gray-800 break-words leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="my-0.5">
              {renderInline(block.text, `p-${idx}`)}
            </p>
          );
        }

        if (block.type === 'bullet_list') {
          return (
            <ul key={idx} className="my-1.5 space-y-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold leading-5 select-none shrink-0">•</span>
                  <span className="flex-1">{renderInline(item.text, `b-${idx}-${itemIdx}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'number_list') {
          return (
            <ol key={idx} className="my-1.5 space-y-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-semibold text-xs leading-5 select-none shrink-0 min-w-[1rem]">
                    {item.num}.
                  </span>
                  <span className="flex-1">{renderInline(item.text, `n-${idx}-${itemIdx}`)}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'heading') {
          return (
            <div key={idx} className="font-bold text-gray-900 text-sm mt-2 mb-1">
              {renderInline(block.text, `h-${idx}`)}
            </div>
          );
        }

        if (block.type === 'code_block') {
          return <CodeBlock key={idx} code={block.code} lang={block.lang} />;
        }

        if (block.type === 'break') {
          return <div key={idx} className="h-1" />;
        }

        return null;
      })}
    </div>
  );
};

export default ChatMessageContent;

