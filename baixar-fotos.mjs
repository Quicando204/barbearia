// Descarrega as fotos do site para a pasta img/.
// Precisa de Node 18 ou mais recente e de internet.
// Uso, dentro desta pasta:  node baixar-fotos.mjs
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'img');

// nome do ficheiro em img/  ->  id da foto no Unsplash (a tabela completa está no README)
const photos = {
  'hero': '1672642150228-3fcd5826ec26',
  'razor': '1599351431202-1e0f0137899a',
  'svc-cut': '1647140655214-e4a2d914971f',
  'svc-fade': '1783908688260-0c47404926f3',
  'svc-beard': '1599011176306-4a96f1516d4d',
  'svc-shave': '1494873446894-adbfecfc407a',
  'svc-style': '1605497788044-5a32c7078486',
  'style-fade': '1593702275687-f8b402bf1fb5',
  'style-classic': '1761931403667-a6753db21f32',
  'style-pomp': '1635273051839-003bf06a8751',
  'style-buzz': '1503951914875-452162b0f3f1',
  'team-1': '1567894340315-735d7c361db0',
  'team-2': '1640301133857-c4bc5789c1bb',
  'team-3': '1648221122323-572c13a31663',
  'g1': '1781455793310-8427c96454c7',
  'g2': '1585747860715-2ba37e788b70',
  'g3': '1773904215697-e6c21fc27ac2',
  'g4': '1621605815971-fbc98d665033',
  'g5': '1536520002442-39764a41e987',
  'g6': '1675599193990-33d71150902b',
  'g7': '1702865272115-5afdbae975af',
  'g8': '1523532931495-f51ebf4bc3a2',
  'visit': '1781768526571-ef9c333279c7',
};

const larga = new Set(['hero', 'visit', 'razor']);
const url = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&w=${w}`;

await mkdir(dir, { recursive: true });
let ok = 0;
const falhas = [];

for (const [nome, id] of Object.entries(photos)) {
  const ficheiro = path.join(dir, `${nome}.jpg`);
  try {
    await access(ficheiro);
    console.log('já existe:', nome);
    ok++;
    continue;
  } catch {}
  try {
    const res = await fetch(url(id, larga.has(nome) ? 2000 : 1400));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    await writeFile(ficheiro, Buffer.from(await res.arrayBuffer()));
    console.log('ok:', nome);
    ok++;
  } catch (e) {
    console.log('falhou:', nome, '-', e.message);
    falhas.push(nome);
  }
}

console.log(`\n${ok} de ${Object.keys(photos).length} fotos em img/.`);
if (falhas.length) {
  console.log('Falharam:', falhas.join(', '), '(corram o comando outra vez)');
  process.exitCode = 1;
} else {
  console.log('Agora, em js/main.js, mudem USE_LOCAL_IMAGES para true.');
}
