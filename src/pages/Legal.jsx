import { Link } from 'react-router-dom';
import { useLangStore } from '../store';
import { useBreakpoint } from '../hooks';
import { t } from '../utils/i18n';

const SECTIONS = {
  fr: [
    {
      id: 'identite',
      title: 'Identité de l\u2019élevage',
      content: `ANIMAL CONCEPT SRL
Rue Fût Voie 216, 4683 Oupeye, Belgique
TVA : BE0871.492.738
Agrément élevage n° BE0871.492.738
Registre BCE : 0871.492.738

Dirigeants : — (voir registre BCE)
Forme juridique : Société à responsabilité limitée (SRL)
Activité NACEBEL : 01.480 (Élevage d'autres animaux)

Contact : contact@animalconceptsrl.com
Hébergeur : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA`,
    },
    {
      id: 'privacy',
      title: 'Politique de confidentialité (RGPD)',
      sections: [
        {
          sub: '1. Responsable du traitement',
          text: 'Le responsable du traitement des données est ANIMAL CONCEPT SRL, Rue Fût Voie 216, 4683 Oupeye, Belgique. Pour toute question concernant vos données, contactez-nous à contact@animalconceptsrl.com.',
        },
        {
          sub: '2. Données collectées',
          text: 'Nous collectons uniquement les données nécessaires à la gestion des réservations : nom, prénom, adresse email, numéro de téléphone et éventuellement les notes que vous nous communiquez volontairement. Nous ne collectons aucune donnée sensible (origine, santé, etc.).',
        },
        {
          sub: '3. Finalités du traitement',
          text: 'Vos données sont utilisées pour : (a) la gestion et le suivi de votre réservation ; (b) la communication relative à votre futur compagnon ; (c) le respect de nos obligations légales (registre d\'élevage, facturation).',
        },
        {
          sub: '4. Base légale',
          text: 'Le traitement repose sur l\'exécution d\'un contrat (réservation) et le respect d\'obligations légales. Le consentement est recueilli pour les cookies non essentiels via notre bannière.',
        },
        {
          sub: '5. Durée de conservation',
          text: 'Vos données sont conservées pendant toute la durée de la relation contractuelle, puis archivées 5 ans pour les obligations fiscales et légales (registre d\'élevage belge).',
        },
        {
          sub: '6. Destinataires des données',
          text: 'Vos données ne sont jamais cédées à des tiers. Elles sont accessibles uniquement à l\'équipe d\'ANIMAL CONCEPT SRL. Les données de paiement sont traitées via notre prestataire bancaire sécurisé.',
        },
        {
          sub: '7. Transferts hors UE',
          text: 'Nos serveurs sont hébergés en Europe (Belgique/UE). Aucun transfert de données hors de l\'Espace Économique Européen n\'est effectué.',
        },
        {
          sub: '8. Vos droits',
          text: 'Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement, limitation, portabilité et opposition. Pour les exercer, contactez-nous par email. Nous répondons sous 30 jours maximum.',
        },
        {
          sub: '9. Cookies',
          text: 'Notre site utilise uniquement des cookies techniques nécessaires au fonctionnement du site (session, authentification admin). Aucun cookie de tracking ou publicitaire n\'est utilisé. Une bannière vous informe lors de votre première visite.',
        },
        {
          sub: '10. Réclamation',
          text: 'Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l\'Autorité de protection des données belge : Rue de la Presse 35, 1000 Bruxelles — contact@apd-gba.be — +32 (0)2 274 48 00.',
        },
      ],
    },
    {
      id: 'terms',
      title: 'Conditions Générales de Vente',
      sections: [
        {
          sub: '1. Objet',
          text: 'Les présentes CGV régissent la réservation et l\'achat de chiots auprès d\'ANIMAL CONCEPT SRL, élevage familial situé à Oupeye, Belgique. Elles s\'appliquent à toute réservation effectuée via le site animalconceptsrl.com.',
        },
        {
          sub: '2. Réservation',
          text: 'La réservation est effectuée via le formulaire en ligne. Elle est confirmée après validation par ANIMAL CONCEPT SRL et paiement d\'un acompte de 30% du prix du chiot. Le numéro de réservation unique est communiqué par email et permet le suivi en ligne.',
        },
        {
          sub: '3. Prix et modalités de paiement',
          text: 'Les prix sont indiqués en euros (€), TVA non applicable (éleveur particulier, art. 44 du Code TVA). L\'acompte de 30% est à verser à la confirmation. Le solde de 70% est dû au moment de la remise du chiot, en espèces ou par virement bancaire.',
        },
        {
          sub: '4. Délai de rétractation',
          text: 'Conformément à la législation belge, le délai de rétractation de 14 jours prévu pour les ventes à distance ne s\'applique pas aux animaux vivants (art. VI.53, 4° du Code de droit économique belge). La réservation est donc ferme dès confirmation.',
        },
        {
          sub: '5. Annulation par le client',
          text: 'Tout acompte versé reste acquis à ANIMAL CONCEPT SRL en cas d\'annulation par le client, à quelque stade que ce soit. Cette clause couvre les frais de gestion, de vaccination, de vermifugation et de soins déjà engagés.',
        },
        {
          sub: '6. Annulation par l\'élevage',
          text: 'ANIMAL CONCEPT SRL se réserve le droit d\'annuler une réservation en cas de : problème de santé vétérinaire du chiot, décès du chiot, ou non-conformité avant le départ. Dans ces seuls cas, l\'acompte est intégralement remboursé.',
        },
        {
          sub: '7. Remise du chiot',
          text: 'Le chiot est remis à partir de l\'âge de 8 semaines révolues, conformément à la législation belge sur la protection animale (loi du 14 août 1986). La remise a lieu de préférence sur place à Oupeye. Un carnet de santé, les vaccins à jour, la puce électronique et le certificat de bonne santé vétérinaire sont fournis.',
        },
        {
          sub: '8. Santé et garantie',
          text: 'ANIMAL CONCEPT SRL garantit que le chiot est en bonne santé au moment de la remise, vacciné, vermifugé et identifié par puce électronique. Un certificat vétérinaire est remis. Aucune garantie n\'est donnée quant aux maladies non décelables au moment de la vente (période d\'incubation). L\'acquéreur s\'engage à faire examiner le chiot par un vétérinaire dans les 7 jours suivant la remise.',
        },
        {
          sub: '9. Transport',
          text: 'Le transport du chiot est sous l\'entière responsabilité de l\'acquéreur. ANIMAL CONCEPT SRL peut recommander un transporteur agréé mais décline toute responsabilité en cas de problème pendant le transport.',
        },
        {
          sub: '10. Litiges',
          text: 'Tout litige relève du droit belge et de la compétence exclusive des tribunaux de l\'arrondissement de Luxembourg (Belgique). En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.',
        },
        {
          sub: '11. Données personnelles',
          text: 'Voir notre Politique de confidentialité ci-dessus pour le traitement de vos données personnelles.',
        },
      ],
    },
  ],
  nl: [
    {
      id: 'identite',
      title: 'Identiteit van de fokkerij',
      content: `ANIMAL CONCEPT SRL
Rue Fût Voie 216, 4683 Oupeye, België
BTW : BE0871.492.738
Fokkerijvergunning nr. BE0871.492.738
KBO-register : 0871.492.738

Bestuurders : — (zie KBO-register)
Rechtsvorm : Besloten vennootschap (BV)
NACEBEL-activiteit : 01.480 (Fokken van andere dieren)

Contact : contact@animalconceptsrl.com
Hosting : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, VS`,
    },
    {
      id: 'privacy',
      title: 'Privacybeleid (AVG)',
      sections: [
        { sub: '1. Verwerkingsverantwoordelijke', text: 'De verwerkingsverantwoordelijke is ANIMAL CONCEPT SRL, Rue Fût Voie 216, 4683 Oupeye, België. Neem contact met ons op via contact@animalconceptsrl.com voor vragen over uw gegevens.' },
        { sub: '2. Verzamelde gegevens', text: 'We verzamelen alleen de gegevens die nodig zijn voor reserveringen: naam, e-mailadres, telefoonnummer en eventuele notities die u vrijwillig verstrekt. We verzamelen geen gevoelige gegevens.' },
        { sub: '3. Doeleinden van verwerking', text: 'Uw gegevens worden gebruikt voor: (a) het beheer en de opvolging van uw reservering; (b) communicatie over uw toekomstige metgezel; (c) naleving van wettelijke verplichtingen (fokregister, facturatie).' },
        { sub: '4. Rechtsgrond', text: 'De verwerking is gebaseerd op de uitvoering van een overeenkomst (reservering) en wettelijke verplichtingen. Toestemming wordt gevraagd voor niet-essentiële cookies via onze banner.' },
        { sub: '5. Bewaartermijn', text: 'Uw gegevens worden bewaard tijdens de contractuele relatie en vervolgens 5 jaar gearchiveerd voor fiscale en wettelijke verplichtingen (Belgisch fokregister).' },
        { sub: '6. Ontvangers van gegevens', text: 'Uw gegevens worden nooit aan derden verstrekt. Ze zijn alleen toegankelijk voor het ANIMAL CONCEPT SRL-team. Betalingsgegevens worden verwerkt via onze beveiligde bankpartner.' },
        { sub: '7. Doorgifte buiten EU', text: 'Onze servers worden gehost in Europa (België/EU). Er vindt geen doorgifte van gegevens buiten de Europese Economische Ruimte plaats.' },
        { sub: '8. Uw rechten', text: 'Overeenkomstig de AVG heeft u recht op toegang, rectificatie, wissen, beperking, overdraagbaarheid en bezwaar. Neem per e-mail contact met ons op om deze rechten uit te oefenen. We reageren binnen maximaal 30 dagen.' },
        { sub: '9. Cookies', text: 'Onze site gebruikt alleen technische cookies die nodig zijn voor de werking (sessie, admin-authenticatie). Er worden geen tracking- of advertentiecookies gebruikt. Een banner informeert u bij uw eerste bezoek.' },
        { sub: '10. Klacht', text: 'Als u van mening bent dat uw rechten niet worden gerespecteerd, kunt u een klacht indienen bij de Belgische Gegevensbeschermingsautoriteit: Drukpersstraat 35, 1000 Brussel — contact@apd-gba.be — +32 (0)2 274 48 00.' },
      ],
    },
    {
      id: 'terms',
      title: 'Algemene Verkoopvoorwaarden',
      sections: [
        { sub: '1. Toepasselijkheid', text: 'Deze voorwaarden regelen de reservering en aankoop van puppy\'s bij ANIMAL CONCEPT SRL, een familiale fokkerij in Oupeye, België. Ze zijn van toepassing op elke reservering via animalconceptsrl.com.' },
        { sub: '2. Reservering', text: 'De reservering wordt gemaakt via het online formulier. Ze wordt bevestigd na goedkeuring door ANIMAL CONCEPT SRL en betaling van een aanbetaling van 30% van de prijs van de puppy. Het unieke reserveringsnummer wordt per e-mail verstrekt voor online opvolging.' },
        { sub: '3. Prijs en betaling', text: 'Prijzen zijn in euro (€), BTW niet van toepassing (particuliere fokker, art. 44 BTW-code). De aanbetaling van 30% is verschuldigd bij bevestiging. Het saldo van 70% is verschuldigd bij levering van de puppy, contant of per overschrijving.' },
        { sub: '4. Herroepingsrecht', text: 'Overeenkomstig de Belgische wetgeving is het herroepingsrecht van 14 dagen voor afstandsverkopen niet van toepassing op levende dieren (art. VI.53, 4° Wetboek economisch recht). De reservering is daarom definitief vanaf bevestiging.' },
        { sub: '5. Annulering door klant', text: 'Eventuele aanbetalingen blijven eigendom van ANIMAL CONCEPT SRL bij annulering door de klant, in elk stadium. Deze clausule dekt de kosten van beheer, vaccinatie, ontworming en reeds gemaakte zorgkosten.' },
        { sub: '6. Annulering door fokker', text: 'ANIMAL CONCEPT SRL behoudt zich het recht voor een reservering te annuleren bij: veterinair gezondheidsprobleem van de puppy, overlijden van de puppy, of non-conformiteit voor vertrek. In deze gevallen wordt de aanbetaling volledig terugbetaald.' },
        { sub: '7. Levering van de puppy', text: 'De puppy wordt geleverd vanaf de leeftijd van 8 weken, overeenkomstig de Belgische dierenwelzijnswetgeving (wet van 14 augustus 1986). Levering vindt bij voorkeur plaats op locatie in Oupeye. Een gezondheidsboekje, up-to-date vaccinaties, microchip en veterinair gezondheidscertificaat worden meegegeven.' },
        { sub: '8. Gezondheid en garantie', text: 'ANIMAL CONCEPT SRL garandeert dat de puppy bij levering in goede gezondheid verkeert, gevaccineerd, ontwormd en geïdentificeerd is met een microchip. Een veterinair certificaat wordt overhandigd. Er wordt geen garantie gegeven voor niet-detecteerbare ziekten op het moment van verkoop (incubatieperiode). De koper moet de puppy binnen 7 dagen na levering door een dierenarts laten onderzoeken.' },
        { sub: '9. Vervoer', text: 'Het vervoer van de puppy is volledig de verantwoordelijkheid van de koper. ANIMAL CONCEPT SRL kan een erkende vervoerder aanbevelen maar is niet aansprakelijk voor problemen tijdens het vervoer.' },
        { sub: '10. Geschillen', text: 'Geschillen vallen onder het Belgisch recht en de exclusieve bevoegdheid van de rechtbanken van het arrondissement Luxemburg (België). Bij een geschil wordt eerst een minnelijke schikking gezocht.' },
        { sub: '11. Privacy', text: 'Zie ons Privacybeleid hierboven voor de verwerking van uw persoonsgegevens.' },
      ],
    },
  ],
  en: [
    {
      id: 'identite',
      title: 'Breeding Identity',
      content: `ANIMAL CONCEPT SRL
Rue Fût Voie 216, 4683 Oupeye, Belgium
VAT : BE0871.492.738
Breeding license n° BE0871.492.738
BCE Register : 0871.492.738

Directors : — (see BCE register)
Legal form : Private Limited Liability Company
NACEBEL activity : 01.480 (Raising of other animals)

Contact : contact@animalconceptsrl.com
Hosting : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA`,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy (GDPR)',
      sections: [
        { sub: '1. Data Controller', text: 'The data controller is ANIMAL CONCEPT SRL, Rue Fût Voie 216, 4683 Oupeye, Belgium. For any questions regarding your data, contact us at contact@animalconceptsrl.com.' },
        { sub: '2. Data Collected', text: 'We only collect data necessary for reservation management: name, email address, phone number, and any notes you voluntarily provide. We do not collect any sensitive data.' },
        { sub: '3. Purposes of Processing', text: 'Your data is used for: (a) managing and tracking your reservation; (b) communication regarding your future companion; (c) compliance with our legal obligations (breeding register, invoicing).' },
        { sub: '4. Legal Basis', text: 'Processing is based on contract execution (reservation) and legal obligations. Consent is obtained for non-essential cookies via our banner.' },
        { sub: '5. Retention Period', text: 'Your data is kept for the duration of the contractual relationship, then archived for 5 years for tax and legal obligations (Belgian breeding register).' },
        { sub: '6. Data Recipients', text: 'Your data is never shared with third parties. It is only accessible to the ANIMAL CONCEPT SRL team. Payment data is processed through our secure banking partner.' },
        { sub: '7. International Transfers', text: 'Our servers are hosted in Europe (Belgium/EU). No data transfer outside the European Economic Area occurs.' },
        { sub: '8. Your Rights', text: 'Under GDPR, you have the right to access, rectify, erase, restrict, port, and object. To exercise these rights, email us. We respond within 30 days maximum.' },
        { sub: '9. Cookies', text: 'Our site only uses technical cookies necessary for operation (session, admin authentication). No tracking or advertising cookies are used. A banner informs you on your first visit.' },
        { sub: '10. Complaint', text: 'If you believe your rights are not respected, you can file a complaint with the Belgian Data Protection Authority: Rue de la Presse 35, 1000 Brussels — contact@apd-gba.be — +32 (0)2 274 48 00.' },
      ],
    },
    {
      id: 'terms',
      title: 'Terms and Conditions of Sale',
      sections: [
        { sub: '1. Scope', text: 'These terms govern the reservation and purchase of puppies from ANIMAL CONCEPT SRL, a family kennel in Oupeye, Belgium. They apply to any reservation made via animalconceptsrl.com.' },
        { sub: '2. Reservation', text: 'Reservations are made via the online form. They are confirmed after validation by ANIMAL CONCEPT SRL and payment of a 30% deposit of the puppy price. A unique reservation number is provided by email for online tracking.' },
        { sub: '3. Price and Payment', text: 'Prices are in euros (€), VAT not applicable (private breeder, art. 44 VAT Code). The 30% deposit is due upon confirmation. The 70% balance is due upon puppy handover, in cash or by bank transfer.' },
        { sub: '4. Withdrawal Right', text: 'Under Belgian law, the 14-day withdrawal right for distance sales does not apply to live animals (art. VI.53, 4° Belgian Economic Law Code). The reservation is therefore firm upon confirmation.' },
        { sub: '5. Cancellation by Client', text: 'Any deposit paid is retained by ANIMAL CONCEPT SRL in case of cancellation by the client, at any stage. This clause covers management, vaccination, deworming, and care costs already incurred.' },
        { sub: '6. Cancellation by Kennel', text: 'ANIMAL CONCEPT SRL reserves the right to cancel a reservation in case of: veterinary health issue of the puppy, death of the puppy, or non-compliance before departure. In these cases only, the deposit is fully refunded.' },
        { sub: '7. Puppy Handover', text: 'The puppy is handed over at a minimum of 8 weeks of age, in accordance with Belgian animal welfare legislation (law of August 14, 1986). Handover preferably takes place on-site in Oupeye. A health record, up-to-date vaccinations, microchip, and veterinary health certificate are provided.' },
        { sub: '8. Health and Warranty', text: 'ANIMAL CONCEPT SRL guarantees the puppy is in good health at handover, vaccinated, dewormed, and identified by microchip. A veterinary certificate is provided. No warranty is given for diseases undetectable at the time of sale (incubation period). The buyer must have the puppy examined by a veterinarian within 7 days of handover.' },
        { sub: '9. Transport', text: 'Puppy transport is entirely the buyer\'s responsibility. ANIMAL CONCEPT SRL may recommend an approved transporter but declines any liability for issues during transport.' },
        { sub: '10. Disputes', text: 'Any dispute falls under Belgian law and the exclusive jurisdiction of the courts of the Luxembourg district (Belgium). An amicable solution will be sought before any legal action.' },
        { sub: '11. Privacy', text: 'See our Privacy Policy above regarding the processing of your personal data.' },
      ],
    },
  ],
};

function Section({ title, content, subs }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(20px,3vw,32px)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(18px,2.5vw,26px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:18 }}>
        {title}
      </h2>
      {content && <pre style={{ fontFamily:'Nunito,Outfit,sans-serif', fontSize:14, color:'var(--text-2)', lineHeight:1.75, whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>{content}</pre>}
      {subs && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {subs.map((s, i) => (
            <div key={i}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:'var(--text)', marginBottom:6, lineHeight:1.3 }}>{s.sub}</h3>
              <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.75 }}>{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Legal() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';
  const sections = SECTIONS[l] || SECTIONS.fr;

  const title = l === 'fr' ? 'Mentions légales' : l === 'nl' ? 'Wettelijke vermeldingen' : 'Legal Notices';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 76 }}>
      <div style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)', padding: isMobile ? '36px 4% 28px' : '56px 6% 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="section-eyebrow">{l === 'fr' ? 'Informations légales' : l === 'nl' ? 'Juridische informatie' : 'Legal information'}</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(32px,5vw,64px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:12, lineHeight:1.05 }}>
            {title}
          </h1>
          <p style={{ fontSize:16, color:'var(--text-3)', maxWidth:520, lineHeight:1.65 }}>
            {l === 'fr' ? 'Conformité légale, protection de vos données et conditions de réservation.' :
             l === 'nl' ? 'Wettelijke conformiteit, gegevensbescherming en reserveringsvoorwaarden.' :
             'Legal compliance, data protection and reservation terms.'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '24px 4% 60px' : '40px 6% 80px', display:'flex', flexDirection:'column', gap:20 }}>
        {sections.map(section => (
          <Section key={section.id} title={section.title} content={section.content} subs={section.sections} />
        ))}
      </div>
    </div>
  );
}
