const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function d(day, month, year = 2026) {
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

async function main() {
  console.log('🌱 Seeding Sweet Puppies...');

  const labrador = [
    { name:'Simba',   birthDate:d(4,6),  sex:'Male',   father:'Duke',  mother:'Maya',   pedigree:'LOSH-LAB-2026-0412', microchip:'985 1410 0245 101', desc:'Robuste et gourmand, déjà très attaché à sa mère et ses frères de portée.' },
    { name:'Nala',    birthDate:d(10,6), sex:'Female', father:'Duke',  mother:'Maya',   pedigree:'LOSH-LAB-2026-0413', microchip:'985 1410 0245 102', desc:'Douce et patiente, elle observe beaucoup avant de se lancer dans le jeu.' },
    { name:'Brutus',  birthDate:d(20,4), sex:'Male',   father:'Rocco', mother:'Bella',  pedigree:'LOSH-LAB-2026-0387', microchip:'985 1410 0244 880', desc:'Costaud et énergique, adore patauger et mâchouiller tout ce qu\'il trouve.' },
    { name:'Maggie',  birthDate:d(23,4), sex:'Female', father:'Rocco', mother:'Bella',  pedigree:'LOSH-LAB-2026-0388', microchip:'985 1410 0244 881', desc:'Très sociable, elle réclame des câlins dès qu\'on s\'approche d\'elle.' },
    { name:'Teddy',   birthDate:d(7,6),  sex:'Male',   father:'Duke',  mother:'Bella',  pedigree:'LOSH-LAB-2026-0414', microchip:'985 1410 0245 103', desc:'Calme et affectueux, déjà très à l\'aise avec les humains qui s\'occupent de lui.' },
    { name:'Rex',     birthDate:d(9,6),  sex:'Male',   father:'Rocco', mother:'Maya',   pedigree:'LOSH-LAB-2026-0415', microchip:'985 1410 0245 104', desc:'Joueur et énergique, déjà très à l\'aise dans l\'eau lors des premiers essais.' },
    { name:'Lucky',   birthDate:d(16,4), sex:'Male',   father:'Duke',  mother:'Bella',  pedigree:'LOSH-LAB-2026-0389', microchip:'985 1410 0244 882', desc:'Curieux et affectueux, suit son maître partout dès qu\'il en a l\'occasion.' },
    { name:'Athena',  birthDate:d(19,4), sex:'Female', father:'Rocco', mother:'Maya',   pedigree:'LOSH-LAB-2026-0390', microchip:'985 1410 0244 883', desc:'Calme et douce, elle adore les caresses et les longues siestes au soleil.' },
    { name:'Storm',   birthDate:d(12,6), sex:'Male',   father:'Duke',  mother:'Maya',   pedigree:'LOSH-LAB-2026-0416', microchip:'985 1410 0245 105', desc:'Vif et déterminé, déjà très joueur avec ses frères et sœurs de portée.' },
    { name:'Bonnie',  birthDate:d(22,4), sex:'Female', father:'Rocco', mother:'Bella',  pedigree:'LOSH-LAB-2026-0391', microchip:'985 1410 0244 884', desc:'Douce et sociable, elle aime particulièrement la compagnie des enfants.' },
  ];

  const chihuahua = [
    { name:'Pixel',    birthDate:d(5,6),  sex:'Male',   father:'Pepito',  mother:'Chiquita', pedigree:'LOSH-CHI-2026-0501', microchip:'985 1410 0250 201', desc:'Petit et vif, il observe tout avec de grands yeux curieux.' },
    { name:'Nube',     birthDate:d(9,6),  sex:'Female', father:'Pepito',  mother:'Chiquita', pedigree:'LOSH-CHI-2026-0502', microchip:'985 1410 0250 202', desc:'Très câline, elle adore se réfugier dans les bras dès qu\'elle le peut.' },
    { name:'Coco',     birthDate:d(3,6),  sex:'Female', father:'Toro',    mother:'Princesa', pedigree:'LOSH-CHI-2026-0503', microchip:'985 1410 0250 203', desc:'Espiègle malgré sa petite taille, elle n\'a peur de rien.' },
    { name:'Pico',     birthDate:d(18,4), sex:'Male',   father:'Toro',    mother:'Princesa', pedigree:'LOSH-CHI-2026-0480', microchip:'985 1410 0250 180', desc:'Alerte et énergique, toujours en mouvement dans son enclos.' },
    { name:'Mimi',     birthDate:d(21,4), sex:'Female', father:'Pepito',  mother:'Princesa', pedigree:'LOSH-CHI-2026-0481', microchip:'985 1410 0250 181', desc:'Douce et discrète, elle préfère observer avant de se lancer dans le jeu.' },
    { name:'Chico',    birthDate:d(11,6), sex:'Male',   father:'Toro',    mother:'Chiquita', pedigree:'LOSH-CHI-2026-0504', microchip:'985 1410 0250 204', desc:'Téméraire et joueur, il aime déjà défier ses frères et sœurs.' },
    { name:'Perla',    birthDate:d(26,4), sex:'Female', father:'Pepito',  mother:'Chiquita', pedigree:'LOSH-CHI-2026-0482', microchip:'985 1410 0250 182', desc:'Très affectueuse, elle réclame des câlins dès qu\'on s\'approche.' },
    { name:'Bruno',    birthDate:d(8,6),  sex:'Male',   father:'Toro',    mother:'Princesa', pedigree:'LOSH-CHI-2026-0505', microchip:'985 1410 0250 205', desc:'Petit mais courageux, il n\'hésite pas à explorer les nouveaux objets.' },
    { name:'Lola',     birthDate:d(15,4), sex:'Female', father:'Pepito',  mother:'Princesa', pedigree:'LOSH-CHI-2026-0483', microchip:'985 1410 0250 183', desc:'Calme et attachante, elle adore se lover contre ses proches.' },
    { name:'Tiny',     birthDate:d(6,6),  sex:'Male',   father:'Toro',    mother:'Chiquita', pedigree:'LOSH-CHI-2026-0506', microchip:'985 1410 0250 206', desc:'Le plus petit de la portée mais plein de caractère et de vivacité.' },
  ];

  const yorkshire = [
    { name:'Bijou',     birthDate:d(4,6),  sex:'Female', father:'Bambou', mother:'Fifi',   pedigree:'LOSH-YOR-2026-0601', microchip:'985 1410 0260 301', desc:'Élégante et délicate, déjà très attentive à son entourage.' },
    { name:'Gucci',     birthDate:d(10,6), sex:'Male',   father:'Bambou', mother:'Fifi',   pedigree:'LOSH-YOR-2026-0602', microchip:'985 1410 0260 302', desc:'Vif et coquet, il adore se faire remarquer auprès de ses proches.' },
    { name:'Chanel',    birthDate:d(2,6),  sex:'Female', father:'Théo',   mother:'Rosie',  pedigree:'LOSH-YOR-2026-0603', microchip:'985 1410 0260 303', desc:'Petite et raffinée, elle aime se faire chouchouter au calme.' },
    { name:'Prince',    birthDate:d(19,4), sex:'Male',   father:'Théo',   mother:'Rosie',  pedigree:'LOSH-YOR-2026-0580', microchip:'985 1410 0260 280', desc:'Fier et joueur, il aime déjà se pavaner devant les visiteurs.' },
    { name:'Pearl',     birthDate:d(22,4), sex:'Female', father:'Bambou', mother:'Rosie',  pedigree:'LOSH-YOR-2026-0581', microchip:'985 1410 0260 281', desc:'Douce et sensible, elle s\'attache vite aux personnes qui s\'occupent d\'elle.' },
    { name:'Dolly',     birthDate:d(12,6), sex:'Female', father:'Théo',   mother:'Fifi',   pedigree:'LOSH-YOR-2026-0604', microchip:'985 1410 0260 304', desc:'Petite curieuse, toujours la première à venir renifler les nouveautés.' },
    { name:'Milord',    birthDate:d(25,4), sex:'Male',   father:'Bambou', mother:'Fifi',   pedigree:'LOSH-YOR-2026-0582', microchip:'985 1410 0260 282', desc:'Calme et distingué, il observe son environnement avec beaucoup de sérieux.' },
    { name:'Chérie',    birthDate:d(7,6),  sex:'Female', father:'Théo',   mother:'Rosie',  pedigree:'LOSH-YOR-2026-0605', microchip:'985 1410 0260 305', desc:'Très câline, elle adore se blottir contre ses frères et sœurs.' },
    { name:'Trésor',    birthDate:d(16,4), sex:'Male',   father:'Bambou', mother:'Rosie',  pedigree:'LOSH-YOR-2026-0583', microchip:'985 1410 0260 283', desc:'Petit mais plein d\'assurance, il n\'a pas froid aux yeux.' },
    { name:'Princesse', birthDate:d(9,6),  sex:'Female', father:'Théo',   mother:'Fifi',   pedigree:'LOSH-YOR-2026-0606', microchip:'985 1410 0260 306', desc:'Délicate et affectueuse, elle réclame déjà beaucoup d\'attention.' },
  ];

  const jackrussell = [
    { name:'Rocky',  birthDate:d(5,6),  sex:'Male',   father:'Max',    mother:'Lola', pedigree:'LOSH-JR-2026-0341', microchip:'985 1410 0234 567', desc:'Petit boute-en-train très éveillé, déjà curieux de tout ce qui bouge autour de lui.' },
    { name:'Bella',  birthDate:d(9,6),  sex:'Female', father:'Max',    mother:'Lola', pedigree:'LOSH-JR-2026-0342', microchip:'985 1410 0234 568', desc:'Câline et douce, elle adore se blottir contre ses frères et sœurs pour dormir.' },
    { name:'Charlie',birthDate:d(3,6),  sex:'Male',   father:'Diesel', mother:'Nala', pedigree:'LOSH-JR-2026-0355', microchip:'985 1410 0234 590', desc:'Le plus joueur de la portée, toujours prêt à courir après une balle ou un jouet.' },
    { name:'Milo',   birthDate:d(18,4), sex:'Male',   father:'Diesel', mother:'Nala', pedigree:'LOSH-JR-2026-0298', microchip:'985 1410 0233 871', desc:'Vif et intelligent, il apprend déjà très vite les bases de la propreté.' },
    { name:'Daisy',  birthDate:d(24,4), sex:'Female', father:'Diesel', mother:'Nala', pedigree:'LOSH-JR-2026-0299', microchip:'985 1410 0233 872', desc:'Petite princesse pleine d\'énergie, adore les jeux d\'éveil et les câlins.' },
    { name:'Buddy',  birthDate:d(11,6), sex:'Male',   father:'Jack',   mother:'Ruby', pedigree:'LOSH-JR-2026-0356', microchip:'985 1410 0234 591', desc:'Sociable et confiant, il s\'approche facilement des nouvelles têtes.' },
    { name:'Luna',   birthDate:d(27,4), sex:'Female', father:'Jack',   mother:'Ruby', pedigree:'LOSH-JR-2026-0300', microchip:'985 1410 0233 873', desc:'Espiègle et affectueuse, elle adore explorer chaque coin de son enclos.' },
    { name:'Toby',   birthDate:d(8,6),  sex:'Male',   father:'Max',    mother:'Nala', pedigree:'LOSH-JR-2026-0357', microchip:'985 1410 0234 592', desc:'Calme et observateur, il garde toujours un œil sur ce qui se passe autour de lui.' },
    { name:'Coco',   birthDate:d(15,4), sex:'Female', father:'Diesel', mother:'Ruby', pedigree:'LOSH-JR-2026-0301', microchip:'985 1410 0233 874', desc:'Pleine de vie et déjà très joueuse, elle adore les jouets à grignoter.' },
    { name:'Oscar',  birthDate:d(6,6),  sex:'Male',   father:'Jack',   mother:'Lola', pedigree:'LOSH-JR-2026-0358', microchip:'985 1410 0234 593', desc:'Petit aventurier, le premier à explorer un nouvel objet dans son enclos.' },
  ];

  const berger = [
    { name:'Apollo',   birthDate:d(5,6),  sex:'Male',   father:'Rex',   mother:'Luna', pedigree:'LOSH-BA-2026-0701', microchip:'985 1410 0270 401', desc:'Déjà très éveillé, il observe attentivement tout ce qui se passe autour de lui.' },
    { name:'Athena',   birthDate:d(9,6),  sex:'Female', father:'Rex',   mother:'Luna', pedigree:'LOSH-BA-2026-0702', microchip:'985 1410 0270 402', desc:'Vive et déterminée, elle montre déjà un caractère affirmé.' },
    { name:'Zeus',     birthDate:d(3,6),  sex:'Male',   father:'Thor',  mother:'Maya', pedigree:'LOSH-BA-2026-0703', microchip:'985 1410 0270 403', desc:'Robuste et curieux, il aime déjà explorer chaque recoin de son enclos.' },
    { name:'Freya',    birthDate:d(18,4), sex:'Female', father:'Thor',  mother:'Maya', pedigree:'LOSH-BA-2026-0680', microchip:'985 1410 0270 380', desc:'Intelligente et attentive, elle apprend déjà très vite les règles de base.' },
    { name:'Titan',    birthDate:d(21,4), sex:'Male',   father:'Rex',   mother:'Maya', pedigree:'LOSH-BA-2026-0681', microchip:'985 1410 0270 381', desc:'Costaud et protecteur, il se montre déjà très attentif envers ses frères et sœurs.' },
    { name:'Nina',     birthDate:d(11,6), sex:'Female', father:'Thor',  mother:'Luna', pedigree:'LOSH-BA-2026-0704', microchip:'985 1410 0270 404', desc:'Douce et sociable, elle s\'approche facilement des nouvelles têtes.' },
    { name:'Maximus',  birthDate:d(26,4), sex:'Male',   father:'Rex',   mother:'Luna', pedigree:'LOSH-BA-2026-0682', microchip:'985 1410 0270 382', desc:'Énergique et joueur, toujours prêt à courir dans son enclos.' },
    { name:'Sasha',    birthDate:d(8,6),  sex:'Female', father:'Thor',  mother:'Maya', pedigree:'LOSH-BA-2026-0705', microchip:'985 1410 0270 405', desc:'Calme et attentive, elle observe son environnement avec beaucoup de sérieux.' },
    { name:'Hugo',     birthDate:d(15,4), sex:'Male',   father:'Rex',   mother:'Maya', pedigree:'LOSH-BA-2026-0683', microchip:'985 1410 0270 383', desc:'Confiant et affectueux, il s\'attache vite aux personnes qui s\'occupent de lui.' },
    { name:'Stella',   birthDate:d(6,6),  sex:'Female', father:'Thor',  mother:'Luna', pedigree:'LOSH-BA-2026-0706', microchip:'985 1410 0270 406', desc:'Éveillée et vive, elle est déjà la première à explorer les nouveaux objets.' },
  ];

  const bichon = [
    { name:'Neige',       birthDate:d(5,6),  sex:'Female', father:'Câlin',  mother:'Praline',  pedigree:'LOSH-BIC-2026-0801', microchip:'985 1410 0280 501', desc:'Toute blanche et toute douce, elle adore se blottir contre ses frères et sœurs.' },
    { name:'Nuage',       birthDate:d(9,6),  sex:'Male',   father:'Câlin',  mother:'Praline',  pedigree:'LOSH-BIC-2026-0802', microchip:'985 1410 0280 502', desc:'Joueur et léger comme une plume, il adore bondir partout dans son enclos.' },
    { name:'Pompon',      birthDate:d(3,6),  sex:'Male',   father:'Câlin',  mother:'Choupette',pedigree:'LOSH-BIC-2026-0803', microchip:'985 1410 0280 503', desc:'Petit boule de poils espiègle, toujours prêt à faire des câlins.' },
    { name:'Cookie',      birthDate:d(18,4), sex:'Female', father:'Câlin',  mother:'Choupette',pedigree:'LOSH-BIC-2026-0780', microchip:'985 1410 0280 480', desc:'Douce et affectueuse, elle réclame des caresses dès qu\'on s\'approche.' },
    { name:'Marshmallow', birthDate:d(21,4), sex:'Male',   father:'Bonbon', mother:'Praline',  pedigree:'LOSH-BIC-2026-0781', microchip:'985 1410 0280 481', desc:'Calme et sociable, il s\'adapte très facilement à toutes les situations.' },
    { name:'Câline',      birthDate:d(11,6), sex:'Female', father:'Bonbon', mother:'Choupette',pedigree:'LOSH-BIC-2026-0804', microchip:'985 1410 0280 504', desc:'Très tendre, elle adore se lover dans les bras de ses proches.' },
    { name:'Biscuit',     birthDate:d(26,4), sex:'Male',   father:'Bonbon', mother:'Praline',  pedigree:'LOSH-BIC-2026-0782', microchip:'985 1410 0280 482', desc:'Vif et curieux, il explore déjà chaque coin de son enclos avec entrain.' },
    { name:'Praline',     birthDate:d(8,6),  sex:'Female', father:'Câlin',  mother:'Choupette',pedigree:'LOSH-BIC-2026-0805', microchip:'985 1410 0280 505', desc:'Espiègle et pétillante, elle aime déjà jouer avec ses frères et sœurs.' },
    { name:'Coton',       birthDate:d(15,4), sex:'Male',   father:'Bonbon', mother:'Choupette',pedigree:'LOSH-BIC-2026-0783', microchip:'985 1410 0280 483', desc:'Doux comme son nom l\'indique, il adore les longues siestes au calme.' },
    { name:'Perle',       birthDate:d(6,6),  sex:'Female', father:'Bonbon', mother:'Praline',  pedigree:'LOSH-BIC-2026-0806', microchip:'985 1410 0280 506', desc:'Délicate et attachante, elle réclame déjà beaucoup d\'attention.' },
  ];

  const golden = [
    { name:'Sunny',   birthDate:d(5,6),  sex:'Male',   father:'Goldy',  mother:'Honey', pedigree:'LOSH-GR-2026-1001', microchip:'985 1410 0300 701', desc:'Joyeux et plein d\'énergie, déjà très proche de sa mère et de ses frères de portée.' },
    { name:'Honey',   birthDate:d(9,6),  sex:'Female', father:'Goldy',  mother:'Honey', pedigree:'LOSH-GR-2026-1002', microchip:'985 1410 0300 702', desc:'Douce et câline, elle adore se blottir contre ses proches.' },
    { name:'Bear',    birthDate:d(3,6),  sex:'Male',   father:'Cooper', mother:'Amber', pedigree:'LOSH-GR-2026-1003', microchip:'985 1410 0300 703', desc:'Costaud et joueur, déjà très curieux de tout ce qui l\'entoure.' },
    { name:'Amber',   birthDate:d(18,4), sex:'Female', father:'Cooper', mother:'Amber', pedigree:'LOSH-GR-2026-0980', microchip:'985 1410 0300 680', desc:'Sociable et affectueuse, elle réclame des câlins dès qu\'on s\'approche.' },
    { name:'Cooper',  birthDate:d(21,4), sex:'Male',   father:'Goldy',  mother:'Amber', pedigree:'LOSH-GR-2026-0981', microchip:'985 1410 0300 681', desc:'Vif et intelligent, il apprend déjà très vite les bases de l\'obéissance.' },
    { name:'Maple',   birthDate:d(11,6), sex:'Female', father:'Cooper', mother:'Honey', pedigree:'LOSH-GR-2026-1004', microchip:'985 1410 0300 704', desc:'Calme et patiente, elle observe beaucoup avant de se lancer dans le jeu.' },
    { name:'Duke',    birthDate:d(26,4), sex:'Male',   father:'Goldy',  mother:'Honey', pedigree:'LOSH-GR-2026-0982', microchip:'985 1410 0300 682', desc:'Robuste et confiant, il s\'approche facilement des nouvelles têtes.' },
    { name:'Daisy',   birthDate:d(8,6),  sex:'Female', father:'Cooper', mother:'Amber', pedigree:'LOSH-GR-2026-1005', microchip:'985 1410 0300 705', desc:'Très affectueuse, elle adore les longues siestes au soleil avec ses frères et sœurs.' },
    { name:'Rocky',   birthDate:d(15,4), sex:'Male',   father:'Goldy',  mother:'Amber', pedigree:'LOSH-GR-2026-0983', microchip:'985 1410 0300 683', desc:'Plein d\'énergie, déjà très joueur avec tout ce qu\'il trouve dans son enclos.' },
    { name:'Bella',   birthDate:d(6,6),  sex:'Female', father:'Cooper', mother:'Honey', pedigree:'LOSH-GR-2026-1006', microchip:'985 1410 0300 706', desc:'Douce et sociable, elle aime particulièrement la compagnie des enfants.' },
  ];

  const canis = [
    { name:'Fripon',     birthDate:d(5,6),  sex:'Male',   father:'Rocky',  mother:'Bella',  microchip:'985 1410 0310 801', desc:'Petit débrouillard plein de vie, déjà très curieux de tout ce qui bouge.' },
    { name:'Pitchoune',  birthDate:d(9,6),  sex:'Female', father:'Rocky',  mother:'Bella',  microchip:'985 1410 0310 802', desc:'Douce et joueuse, elle adore se blottir contre ses frères et sœurs.' },
    { name:'Bandit',     birthDate:d(3,6),  sex:'Male',   father:'Max',    mother:'Lola',   microchip:'985 1410 0310 803', desc:'Espiègle et débordant d\'énergie, toujours prêt à faire une bêtise.' },
    { name:'Câline',     birthDate:d(18,4), sex:'Female', father:'Max',    mother:'Lola',   microchip:'985 1410 0310 780', desc:'Très affectueuse, elle réclame des câlins dès qu\'on s\'approche d\'elle.' },
    { name:'Titou',      birthDate:d(21,4), sex:'Male',   father:'Diesel', mother:'Nala',   microchip:'985 1410 0310 781', desc:'Vif et sociable, il s\'approche facilement des nouvelles têtes.' },
    { name:'Noisette',   birthDate:d(11,6), sex:'Female', father:'Diesel', mother:'Nala',   microchip:'985 1410 0310 804', desc:'Calme et observatrice, elle aime déjà beaucoup les caresses.' },
    { name:'Pataud',     birthDate:d(26,4), sex:'Male',   father:'Rocky',  mother:'Nala',   microchip:'985 1410 0310 782', desc:'Maladroit et attendrissant, il trébuche encore un peu en courant.' },
    { name:'Praline',    birthDate:d(8,6),  sex:'Female', father:'Max',    mother:'Bella',  microchip:'985 1410 0310 805', desc:'Joyeuse et pétillante, elle adore jouer avec ses frères et sœurs.' },
    { name:'Gribouille', birthDate:d(15,4), sex:'Male',   father:'Diesel', mother:'Lola',   microchip:'985 1410 0310 783', desc:'Petit aventurier, toujours le premier à explorer les nouveautés.' },
    { name:'Câlinette',  birthDate:d(6,6),  sex:'Female', father:'Rocky',  mother:'Lola',   microchip:'985 1410 0310 806', desc:'Douce et attachante, elle aime particulièrement la compagnie des enfants.' },
  ];

  const seeds = [
    ...labrador.map(p => ({ ...p, breed:'Labrador Retriever',   price:800,  color:'Sable',             vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...chihuahua.map(p => ({ ...p, breed:'Chihuahua',           price:900,  color:'Fauve',             vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...yorkshire.map(p => ({ ...p, breed:'Yorkshire Terrier',   price:1100, color:'Gris acier et feu',  vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...jackrussell.map(p => ({ ...p, breed:'Jack Russell Terrier', price:750, color:'Blanc et feu',     vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...berger.map(p =>     ({ ...p, breed:'Berger Allemand',       price:1180, color:'Noir et feu',     vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...bichon.map(p =>     ({ ...p, breed:'Bichon Maltais',        price:1000, color:'Blanc pur',       vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...golden.map(p =>     ({ ...p, breed:'Golden Retriever',      price:1150, color:'Blond doré',      vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true })),
    ...canis.map(p =>      ({ ...p, breed:'Canis Vulgaris',        price:800,  color:'Doré tacheté',    vaccinationStatus:'1ère injection', dewormingStatus:'À jour', location:'Bastogne', isActive:true, noPedigree:true })),
  ];

  // Supprime les anciens chiots avant de réinsérer
  await prisma.reservation.deleteMany();
  await prisma.puppy.deleteMany();

  for (const puppy of seeds) {
    await prisma.puppy.create({
      data: {
        name: puppy.name,
        breed: puppy.breed,
        sex: puppy.sex,
        birthDate: puppy.birthDate,
        color: puppy.color,
        price: puppy.price,
        microchipNumber: puppy.microchip,
        vaccinationStatus: puppy.vaccinationStatus,
        dewormingStatus: puppy.dewormingStatus,
        description: puppy.desc,
        parentMotherName: puppy.mother,
        parentFatherName: puppy.father,
        pedigreeDocUrl: puppy.noPedigree ? null : `https://sweetpuppies.be/pedigree/${puppy.pedigree}`,
        location: puppy.location,
        isActive: puppy.isActive,
      },
    });
  }

  console.log(`✅ ${seeds.length} chiots créés`);
  console.log('🎉 Seeding terminé !');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
