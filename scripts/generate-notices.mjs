import { readFile, readdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));
const sections = [
  'SIGNAL / 03 — third-party runtime notices',
  'Generated from the locked production dependency graph. Some packages are type-only or tree-shaken; their notices are retained conservatively.',
  'Project-authored code and assets use the separate project LICENSE. These notices preserve third-party grants and attributions.',
];

for (const [path, entry] of Object.entries(lock.packages).sort(([a], [b]) => a.localeCompare(b))) {
  if (!path || entry.dev) continue;
  const directory = new URL(`${path}/`, root);
  const metadata = JSON.parse(await readFile(new URL('package.json', directory), 'utf8'));
  const files = (await readdir(directory)).filter(name => /^(licen[sc]e|copying)(\..*)?$/i.test(name));
  let text;
  if (files.length) {
    text = (await Promise.all(files.sort().map(name => readFile(new URL(name, directory), 'utf8')))).join('\n\n');
  } else if (metadata.name === '@pixi/colord') {
    // This npm package omits its license file; preserve the upstream grant locally.
    text = await readFile(new URL('licenses/colord-LICENSE.md', root), 'utf8');
  } else {
    throw new Error(`Missing license text for ${metadata.name}; review it before publishing.`);
  }
  sections.push(`=== ${metadata.name} ${metadata.version} (${metadata.license ?? entry.license}) ===\n\n${text.trim()}`);
}

await writeFile(new URL('public/THIRD_PARTY_NOTICES.txt', root), `${sections.join('\n\n')}\n`);
console.log('Runtime dependency notices generated in public/THIRD_PARTY_NOTICES.txt');
