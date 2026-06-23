const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function d(day, month, year = 2026) {
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

const shihTzu = [
  { name:'Bambou',   birthDate:d(3,6),  sex:'Male',   father:'Gizmo',  mother:'Lily',   pedigree:'LOSH-SHI-2026-0901', microchip:'985 1410 0290 601', desc:'Petit boute-en-train au poil soyeux, déjà très attaché à sa mère.' },
  { name:'Praline',  birthDate:d(7,6),  sex:'Female', father:'Gizmo',  mother:'Lily',   pedigree:'LOSH-SHI-2026-0902', microchip:'985 1410 0290 602', desc:'Douce et câline, elle adore se blottir dans les bras pour dormir.' },
  { name:'Mochi',    birthDate:d(5,6),  sex:'Male',   father:'Milo',   mother:'Coco',   pedigree:'LOSH-SHI-2026-0903', microchip:'985 1410 0290 603', desc:'Joueur et espiègle, toujours prêt à explorer son enclos.' },
  { name:'Nuage',    birthDate:d(10,6), sex:'Female', father:'Milo',   mother:'Coco',   pedigree:'LOSH-SHI-2026-0904', microchip:'985 1410 0290 604', desc:'Toute douce et délicate, elle observe le monde avec de grands yeux.' },
  { name:'Tofu',     birthDate:d(18,4), sex:'Male',   father:'Gizmo',  mother:'Coco',   pedigree:'LOSH-SHI-2026-0880', microchip:'985 1410 0290 580', desc:'Calme et réfléchi, il prend son temps avant de se lancer dans le jeu.' },
  { name:'Lotus',    birthDate:d(21,4), sex:'Female', father:'Milo',   mother:'Lily',   pedigree:'LOSH-SHI-2026-0881', microchip:'985 1410 0290 581', desc:'Élégante et affectueuse, elle réclame des caresses dès qu\'on s\'approche.' },
  { name:'Sushi',    birthDate:d(9,6),  sex:'Male',   father:'Gizmo',  mother:'Lily',   pedigree:'LOSH-SHI-2026-0905', microchip:'985 1410 0290 605', desc:'Vif et curieux, il aime déjà suivre les visiteurs du regard.' },
  { name:'Perle',    birthDate:d(15,4), sex:'Female', father:'Milo',   mother:'Coco',   pedigree:'LOSH-SHI-2026-0882', microchip:'985 1410 0290 582', desc:'Petite princesse au caractère bien trempé malgré sa taille.' },
  { name:'Nougat',   birthDate:d(6,6),  sex:'Male',   father:'Gizmo',  mother:'Coco',   pedigree:'LOSH-SHI-2026-0906', microchip:'985 1410 0290 606', desc:'Gourmand et affectueux, il adore les câlins après chaque repas.' },
  { name:'Sakura',   birthDate:d(12,6), sex:'Female', father:'Milo',   mother:'Lily',   pedigree:'LOSH-SHI-2026-0907', microchip:'985 1410 0290 607', desc:'Délicate et joueuse, elle s\'entend déjà très bien avec ses frères et sœurs.' },
];

async function main() {
  for (const p of shihTzu) {
    const exists = await prisma.puppy.findFirst({ where: { microchipNumber: p.microchip } });
    if (exists) {
      console.log(`⏭️  ${p.name} déjà présent (microchip ${p.microchip})`);
      continue;
    }
    await prisma.puppy.create({
      data: {
        name: p.name,
        breed: 'Shih Tzu',
        sex: p.sex,
        birthDate: p.birthDate,
        color: 'Blanc et noir',
        price: 950,
        microchipNumber: p.microchip,
        vaccinationStatus: '1ère injection',
        dewormingStatus: 'À jour',
        description: p.desc,
        parentMotherName: p.mother,
        parentFatherName: p.father,
        pedigreeDocUrl: `https://animalconceptsrl.com/pedigree/${p.pedigree}`,
        location: 'Oupeye',
        isActive: true,
      },
    });
    console.log(`✅ ${p.name} (Shih Tzu) créé`);
  }

  const count = await prisma.puppy.count();
  console.log(`\n📊 Total chiots en base : ${count}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); prisma.$disconnect(); });
