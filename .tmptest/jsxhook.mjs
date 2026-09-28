import { transform } from 'sucrase';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export async function load(url, context, next) {
  if (url.endsWith('.jsx')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const { code } = transform(source, { transforms: ['jsx'], filePath: 'x.jsx' });
    return { format: 'module', source: code, shortCircuit: true };
  }
  return next(url, context);
}

export async function resolve(specifier, context, next) {
  if (specifier === 'next/link') {
    return { url: pathToFileURL('/home/joshim/NextApp/radiant-picks/.tmptest/next-link-stub.mjs').href, shortCircuit: true, format: 'module' };
  }
  if (specifier.startsWith('.') && !path.extname(specifier)) {
    const dir = path.dirname(fileURLToPath(context.parentURL));
    for (const ext of ['.js', '.jsx']) {
      const abs = path.resolve(dir, specifier + ext);
      if (existsSync(abs)) return { url: pathToFileURL(abs).href, shortCircuit: true, format: 'module' };
    }
  }
  return next(specifier, context);
}
