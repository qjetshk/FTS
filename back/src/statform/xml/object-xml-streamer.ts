import * as fs from 'fs';
import { PassThrough } from 'stream';

// ─── Типы ────────────────────────────────────────────────────────────────────

type Primitive = string | number | boolean;
export type XmlValue = Primitive | null | undefined | XmlNode | XmlNode[];

export type XmlNode = {
  [key: string]: XmlValue;
};

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function escapeXml(v: Primitive): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || v === '';
}

function extractAttrs(obj: XmlNode): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('@') && !isEmpty(v)) {
      parts.push(`${k.slice(1)}="${escapeXml(v as Primitive)}"`);
    }
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

// ─── Стример ─────────────────────────────────────────────────────────────────

export class ObjectXmlStreamer {
  private stream: fs.WriteStream | PassThrough;
  private indent = 0;

  /** Запись в файл */
  constructor(path: string);
  /** Запись в PassThrough (для получения строки/буфера в памяти) */
  constructor(stream: PassThrough);
  constructor(target: string | PassThrough) {
    this.stream =
      typeof target === 'string' ? fs.createWriteStream(target) : target;
    this.stream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  }

  // ─── Публичный API ──────────────────────────────────────────────────────────

  build(obj: XmlNode): this {
    this.writeObject(obj);
    return this;
  }

  /** Закрывает стрим, резолвит промис когда всё записано */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.on('error', reject);
      this.stream.end(resolve);
    });
  }

  // ─── Внутренние методы ──────────────────────────────────────────────────────

  private pad(): string {
    return '  '.repeat(this.indent);
  }

  private write(line: string): void {
    this.stream.write(this.pad() + line + '\n');
  }

  private isDeepEmpty(value: XmlValue): boolean {
    if (isEmpty(value)) return true;
    if (Array.isArray(value)) {
      if (value.length === 0) return true; // ← добавить эту строку
      return value.every((v) => this.isDeepEmpty(v));
    }
    if (typeof value === 'object') {
      const node = value as XmlNode;
      // Есть #text — не пустой
      if (!isEmpty(node['#text'])) return false;
      // Есть атрибуты — не пустой
      if (Object.keys(node).some((k) => k.startsWith('@') && !isEmpty(node[k])))
        return false;
      // Рекурсивно проверяем всё остальное
      return Object.keys(node)
        .filter((k) => !k.startsWith('@') && k !== '#text')
        .every((k) => this.isDeepEmpty(node[k]));
    }
    return false; // примитив — не пустой
  }

  private writeObject(obj: XmlNode): void {
    for (const [key, value] of Object.entries(obj)) {
      // Атрибуты и #text обрабатываются внутри writeNode родительского объекта
      if (key.startsWith('@') || key === '#text') continue;
      this.writeNode(key, value);
    }
  }

  private writeNode(key: string, value: XmlValue): void {
    if (this.isDeepEmpty(value)) return;

    // Массив → повторяем тег для каждого элемента
    if (Array.isArray(value)) {
      for (const item of value) {
        this.writeNode(key, item);
      }
      return;
    }

    // Объект
    if (typeof value === 'object') {
      const node = value as XmlNode;
      const attrs = extractAttrs(node);

      // Mixed-content: <TAG attr="x">text</TAG>
      if (!isEmpty(node['#text'])) {
        this.write(
          `<${key}${attrs}>${escapeXml(node['#text'] as Primitive)}</${key}>`,
        );
        return;
      }

      // Проверяем что объект не пустой (только атрибуты без тела — пропускаем)
      const hasContent = Object.keys(node).some(
        (k) => !k.startsWith('@') && k !== '#text' && !isEmpty(node[k]),
      );
      const hasAttrs = attrs.length > 0;

      if (!hasContent && !hasAttrs) return;

      // Самозакрывающийся тег если нет дочерних элементов
      if (!hasContent && hasAttrs) {
        this.write(`<${key}${attrs}/>`);
        return;
      }

      this.write(`<${key}${attrs}>`);
      this.indent++;
      this.writeObject(node);
      this.indent--;
      this.write(`</${key}>`);
      return;
    }

    // Примитив
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      this.write(`<${key}>${escapeXml(value)}</${key}>`);
      return;
    }
  }
}

// ─── Хелпер: получить XML строку в памяти (без файла) ────────────────────────

export async function buildXmlString(obj: XmlNode): Promise<string> {
  const chunks: Buffer[] = [];
  const pass = new PassThrough();

  pass.on('data', (chunk: Buffer) => chunks.push(chunk));

  const streamer = new ObjectXmlStreamer(pass);
  streamer.build(obj);
  await streamer.close();

  return Buffer.concat(chunks).toString('utf8');
}
