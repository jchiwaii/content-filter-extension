// Run with sharp available on Node's module resolution path.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'assets/safe-browse-logo.svg');

async function main() {
  const svg = await fs.readFile(sourcePath);
  const aliases = [
    'assets/logo.svg', 'assets/images/logo.svg', 'assets/icons/wash-my-eyes-logo.svg',
    'site/assets/logo.svg', 'site/assets/wash-my-eyes-logo.svg'
  ];
  for (const filename of aliases) await fs.writeFile(path.join(root, filename), svg);

  const outputs = [
    ['assets/icons/icon16.png', 16], ['assets/icons/icon48.png', 48],
    ['assets/icons/icon128.png', 128], ['chrome-web-store-assets/store-icon-128x128.png', 128],
    ['assets/images/logo.png', 512], ['site/assets/logo.png', 512],
    ['site/assets/favicon.png', 128]
  ];
  for (const directory of ['assets/favicon_io', 'site/assets/favicon_io']) {
    for (const [name, size] of [
      ['favicon-16x16.png', 16], ['favicon-32x32.png', 32],
      ['apple-touch-icon.png', 180], ['android-chrome-192x192.png', 192],
      ['android-chrome-512x512.png', 512]
    ]) outputs.push([directory + '/' + name, size]);
  }
  const render = size => sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  for (const [filename, size] of outputs) {
    await fs.writeFile(path.join(root, filename), await render(size));
  }

  // ICO supports embedded PNGs; supply all common favicon resolutions.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(render));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  for (let index = 0; index < sizes.length; index++) {
    const entry = 6 + index * 16;
    header[entry] = header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(pngs[index].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += pngs[index].length;
  }
  const ico = Buffer.concat([header, ...pngs]);
  for (const directory of ['assets/favicon_io', 'site/assets/favicon_io']) {
    await fs.writeFile(path.join(root, directory, 'favicon.ico'), ico);
  }
  for (const [filename, size] of outputs) {
    const meta = await sharp(path.join(root, filename)).metadata();
    if (meta.width !== size || meta.height !== size) throw new Error('Incorrect icon size: ' + filename);
  }
  for (const filename of aliases) {
    if (!(await fs.readFile(path.join(root, filename))).equals(svg)) throw new Error('SVG mismatch: ' + filename);
  }
  console.log('Updated and verified ' + aliases.length + ' SVG aliases, ' + outputs.length + ' PNGs and 2 ICOs.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
