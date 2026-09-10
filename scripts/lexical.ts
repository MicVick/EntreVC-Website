/**
 * Minimal Lexical document builders for seeding.
 *
 * Payload's rich text fields store Lexical's JSON tree, not HTML. Hand-writing that
 * tree is verbose, so these helpers cover the two shapes the seed needs — paragraphs
 * and headings. Real content is authored in the admin, where the editor produces this
 * structure for you.
 */

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  style: string
  mode: 'normal'
  detail: number
  version: 1
}

type LexicalBlockNode = {
  type: 'paragraph' | 'heading'
  tag?: 'h2' | 'h3'
  children: LexicalTextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

export type LexicalRoot = {
  root: {
    type: 'root'
    children: LexicalBlockNode[]
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
  }
}

function text(value: string): LexicalTextNode {
  return { type: 'text', text: value, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }
}

function block(type: 'paragraph' | 'heading', value: string, tag?: 'h2' | 'h3'): LexicalBlockNode {
  return {
    type,
    ...(tag ? { tag } : {}),
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

/** Build a rich text value from plain paragraphs. Prefix a line with "## " for a heading. */
export function lexical(...paragraphs: string[]): LexicalRoot {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((p) =>
        p.startsWith('## ') ? block('heading', p.slice(3), 'h2') : block('paragraph', p),
      ),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
