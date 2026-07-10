import { Link } from 'react-router-dom';
import { useLangStore } from '../store';
import { useBreakpoint } from '../hooks';
import { t } from '../utils/i18n';

const SECTIONS = {
  fr: [
    {
      id: 'identite',
      title: 'Identité de la société',
      content: `AIR ECO CLIM
288 Chemin du Cavin
38320 Brié-et-Angonnes — France
SIREN : 844 859 413
SIRET : 844 859 413 00024
TVA : FR67844859413
RCS : 844 859 413 R.C.S. Grenoble
Forme juridique : EURL (Entreprise unipersonnelle à responsabilité limitée)
Date de création : 02/01/2019
Code APE : 43.22B (Travaux d'installation d'équipements thermiques et de climatisation)
Dirigeant : Brice CHAGAS

Contact : nous contacter par email
Hébergeur : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA`,
    },
    {
      id: 'privacy',
      title: 'Politique de confidentialité (RGPD)',
      sections: [
        {
          sub: '1. Responsable du traitement',
          text: 'Le responsable du traitement des données est AIR ECO CLIM, Brié-et-Angonnes, France. Pour toute question concernant vos données, contactez-nous par email.',
        },
        {
          sub: '2. Données collectées',
          text: 'Nous collectons uniquement les données nécessaires à la gestion des commandes : nom, prénom, adresse email, numéro de téléphone, adresse de livraison et éventuellement les notes que vous nous communiquez volontairement. Nous ne collectons aucune donnée sensible.',
        },
        {
          sub: '3. Finalités du traitement',
          text: 'Vos données sont utilisées pour : (a) la gestion et le suivi de votre commande ; (b) la communication relative à votre achat et sa livraison ; (c) le respect de nos obligations légales et fiscales (facturation).',
        },
        {
          sub: '4. Base légale',
          text: 'Le traitement repose sur l\'exécution d\'un contrat (commande) et le respect d\'obligations légales. Le consentement est recueilli pour les cookies non essentiels via notre bannière.',
        },
        {
          sub: '5. Durée de conservation',
          text: 'Vos données sont conservées pendant toute la durée de la relation contractuelle, puis archivées 5 ans pour les obligations fiscales et légales.',
        },
        {
          sub: '6. Destinataires des données',
          text: 'Vos données ne sont jamais cédées à des tiers. Elles sont accessibles uniquement à l\'équipe d\'AIR ECO CLIM. Les données de paiement sont traitées via notre prestataire bancaire sécurisé.',
        },
        {
          sub: '7. Transferts hors UE',
          text: 'Nos serveurs sont hébergés en Europe (France/UE). Aucun transfert de données hors de l\'Espace Économique Européen n\'est effectué.',
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
          text: 'Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l\'Autorité de protection des données française : 3 place de Fontenoy, 75007 Paris.',
        },
      ],
    },
    {
      id: 'terms',
      title: 'Conditions Générales de Vente',
      sections: [
        {
          sub: '1. Objet',
          text: 'Les présentes CGV régissent la vente de climatiseurs, pompes à chaleur et accessoires par AIR ECO CLIM, société basée à Brié-et-Angonnes, France. Elles s\'appliquent à toute commande effectuée via le site airecoclim.com.',
        },
        {
          sub: '2. Commande',
          text: 'La commande est effectuée via le formulaire en ligne. Elle est confirmée après validation par AIR ECO CLIM. Un numéro de commande unique est communiqué par email et permet le suivi en ligne.',
        },
        {
          sub: '3. Prix et modalités de paiement',
          text: 'Les prix sont indiqués en euros (€), TVA comprise au taux en vigueur (20%). Le paiement est exigible à la commande, par virement bancaire ou par carte de crédit via notre prestataire sécurisé.',
        },
        {
          sub: '4. Livraison',
          text: 'La livraison est effectuée à l\'adresse indiquée par le client, dans toute la France. Les délais de livraison sont communiqués avant validation de la commande. En cas de retard, le client en est informé dans les plus brefs délais.',
        },
        {
          sub: '5. Délai de rétractation',
          text: 'Conformément à la législation française, le client dispose d\'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans motif. Les produits doivent être retournés dans leur emballage d\'origine, complets et en parfait état. Les frais de retour sont à la charge du client.',
        },
        {
          sub: '6. Garantie',
          text: 'Tous nos produits bénéficient de la garantie légale de conformité de 2 ans. Les garanties constructeur supplémentaires peuvent s\'appliquer selon les marques. L\'installation par nos techniciens agréés est recommandée pour préserver la garantie.',
        },
        {
          sub: '7. Installation',
          text: 'Les services d\'installation proposés sont réalisés par nos techniciens certifiés. Un devis gratuit est établi avant toute intervention. Les conditions d\'intervention sont détaillées dans le devis.',
        },
        {
          sub: '8. Service après-vente',
          text: 'Notre service après-vente est joignable par email pour toute question relative à l\'utilisation, l\'entretien ou la maintenance de vos appareils. Une intervention technique peut être organisée sous 48h ouvrées.',
        },
        {
          sub: '9. Litiges',
          text: 'Tout litige relève du droit français et de la compétence exclusive des tribunaux de Grenoble (France). En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.',
        },
        {
          sub: '10. Données personnelles',
          text: 'Voir notre Politique de confidentialité ci-dessus pour le traitement de vos données personnelles.',
        },
      ],
    },
  ],
  nl: [
    {
      id: 'identite',
      title: 'Identiteit van het bedrijf',
      content: `AIR ECO CLIM
288 Chemin du Cavin
38320 Brié-et-Angonnes — Frankrijk
SIREN : 844 859 413
SIRET : 844 859 413 00024
BTW : FR67844859413
RCS : 844 859 413 R.C.S. Grenoble
Rechtsvorm : EURL (Eenpersoons BV)
Opgericht : 02/01/2019
APE-code : 43.22B (Installatie van thermische en airconditioningapparatuur)
Directeur : Brice CHAGAS

Contact : neem contact op per e-mail
Hosting : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, VS`,
    },
    {
      id: 'privacy',
      title: 'Privacybeleid (AVG)',
      sections: [
        { sub: '1. Verwerkingsverantwoordelijke', text: 'De verwerkingsverantwoordelijke is AIR ECO CLIM, Brié-et-Angonnes, Frankrijk. Neem per e-mail contact met ons op voor vragen over uw gegevens.' },
        { sub: '2. Verzamelde gegevens', text: 'We verzamelen alleen de gegevens die nodig zijn voor bestellingen: naam, e-mailadres, telefoonnummer, leveringsadres en eventuele notities die u vrijwillig verstrekt. We verzamelen geen gevoelige gegevens.' },
        { sub: '3. Doeleinden van verwerking', text: 'Uw gegevens worden gebruikt voor: (a) het beheer en de opvolging van uw bestelling; (b) communicatie over uw aankoop en levering; (c) naleving van wettelijke en fiscale verplichtingen (facturatie).' },
        { sub: '4. Rechtsgrond', text: 'De verwerking is gebaseerd op de uitvoering van een overeenkomst (bestelling) en wettelijke verplichtingen. Toestemming wordt gevraagd voor niet-essentiële cookies via onze banner.' },
        { sub: '5. Bewaartermijn', text: 'Uw gegevens worden bewaard tijdens de contractuele relatie en vervolgens 5 jaar gearchiveerd voor fiscale en wettelijke verplichtingen.' },
        { sub: '6. Ontvangers van gegevens', text: 'Uw gegevens worden nooit aan derden verstrekt. Ze zijn alleen toegankelijk voor het AIR ECO CLIM-team. Betalingsgegevens worden verwerkt via onze beveiligde bankpartner.' },
        { sub: '7. Doorgifte buiten EU', text: 'Onze servers worden gehost in Europa (Frankrijk/EU). Er vindt geen doorgifte van gegevens buiten de Europese Economische Ruimte plaats.' },
        { sub: '8. Uw rechten', text: 'Overeenkomstig de AVG heeft u recht op toegang, rectificatie, wissen, beperking, overdraagbaarheid en bezwaar. Neem per e-mail contact met ons op om deze rechten uit te oefenen. We reageren binnen maximaal 30 dagen.' },
        { sub: '9. Cookies', text: 'Onze site gebruikt alleen technische cookies die nodig zijn voor de werking (sessie, admin-authenticatie). Er worden geen tracking- of advertentiecookies gebruikt. Een banner informeert u bij uw eerste bezoek.' },
        { sub: '10. Klacht', text: 'Als u van mening bent dat uw rechten niet worden gerespecteerd, kunt u een klacht indienen bij de CNIL (Commission Nationale de l\u2019Informatique et des Libert\u00e9s): 3 place de Fontenoy, 75007 Paris.' },
      ],
    },
    {
      id: 'terms',
      title: 'Algemene Verkoopvoorwaarden',
      sections: [
        { sub: '1. Toepasselijkheid', text: 'Deze voorwaarden regelen de verkoop van airconditioners, warmtepompen en accessoires door AIR ECO CLIM, gevestigd in Brié-et-Angonnes, Frankrijk. Ze zijn van toepassing op elke bestelling via airecoclim.com.' },
        { sub: '2. Bestelling', text: 'De bestelling wordt geplaatst via het online formulier. Ze wordt bevestigd na goedkeuring door AIR ECO CLIM. Een uniek bestelnummer wordt per e-mail verstrekt voor online opvolging.' },
        { sub: '3. Prijs en betaling', text: 'Prijzen zijn in euro (€), inclusief BTW tegen het geldende tarief (20%). Betaling is verschuldigd bij bestelling, per overschrijving of creditcard via onze beveiligde partner.' },
        { sub: '4. Levering', text: 'Levering vindt plaats op het door de klant opgegeven adres, in heel Frankrijk. Levertijden worden gecommuniceerd vóór orderbevestiging. Bij vertraging wordt de klant zo snel mogelijk geïnformeerd.' },
        { sub: '5. Herroepingsrecht', text: 'Overeenkomstig de Franse wetgeving heeft de klant 14 dagen na ontvangst van de producten om zonder opgave van redenen de koop te herroepen. Producten moeten worden teruggezonden in originele verpakking, volledig en in perfecte staat. Retourkosten zijn voor de klant.' },
        { sub: '6. Garantie', text: 'Al onze producten vallen onder de wettelijke conformiteitsgarantie van 2 jaar. Aanvullende fabrieksgaranties kunnen gelden per merk. Installatie door erkende technici wordt aanbevolen om de garantie te behouden.' },
        { sub: '7. Installatie', text: 'Installatiediensten worden uitgevoerd door onze gecertificeerde technici. Een gratis offerte wordt opgesteld vóór elke interventie. De voorwaarden worden gespecificeerd in de offerte.' },
        { sub: '8. After-sales service', text: 'Onze after-sales service is per e-mail bereikbaar voor vragen over gebruik, onderhoud of service van uw apparaten. Technische interventie kan binnen 48 werkuren worden georganiseerd.' },
        { sub: '9. Geschillen', text: 'Geschillen vallen onder het Frans recht en de exclusieve bevoegdheid van de rechtbanken van Grenoble (Frankrijk). Bij een geschil wordt eerst een minnelijke schikking gezocht.' },
        { sub: '10. Privacy', text: 'Zie ons Privacybeleid hierboven voor de verwerking van uw persoonsgegevens.' },
      ],
    },
  ],
  en: [
    {
      id: 'identite',
      title: 'Company Identity',
      content: `AIR ECO CLIM
288 Chemin du Cavin
38320 Brié-et-Angonnes — France
SIREN : 844 859 413
SIRET : 844 859 413 00024
VAT : FR67844859413
RCS : 844 859 413 R.C.S. Grenoble
Legal form : EURL (Single-member limited liability company)
Founded : 02/01/2019
APE code : 43.22B (Installation of thermal and air conditioning equipment)
Director : Brice CHAGAS

Contact : contact us by email
Hosting : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA`,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy (GDPR)',
      sections: [
        { sub: '1. Data Controller', text: 'The data controller is AIR ECO CLIM, Brié-et-Angonnes, France. For any questions regarding your data, contact us by email.' },
        { sub: '2. Data Collected', text: 'We only collect data necessary for order management: name, email address, phone number, delivery address, and any notes you voluntarily provide. We do not collect any sensitive data.' },
        { sub: '3. Purposes of Processing', text: 'Your data is used for: (a) managing and tracking your order; (b) communication regarding your purchase and delivery; (c) compliance with our legal and tax obligations (invoicing).' },
        { sub: '4. Legal Basis', text: 'Processing is based on contract execution (order) and legal obligations. Consent is obtained for non-essential cookies via our banner.' },
        { sub: '5. Retention Period', text: 'Your data is kept for the duration of the contractual relationship, then archived for 5 years for tax and legal obligations.' },
        { sub: '6. Data Recipients', text: 'Your data is never shared with third parties. It is only accessible to the AIR ECO CLIM team. Payment data is processed through our secure banking partner.' },
        { sub: '7. International Transfers', text: 'Our servers are hosted in Europe (France/EU). No data transfer outside the European Economic Area occurs.' },
        { sub: '8. Your Rights', text: 'Under GDPR, you have the right to access, rectify, erase, restrict, port, and object. To exercise these rights, email us. We respond within 30 days maximum.' },
        { sub: '9. Cookies', text: 'Our site only uses technical cookies necessary for operation (session, admin authentication). No tracking or advertising cookies are used. A banner informs you on your first visit.' },
        { sub: '10. Complaint', text: 'If you believe your rights are not respected, you can file a complaint with the CNIL (French Data Protection Authority): 3 place de Fontenoy, 75007 Paris.' },
      ],
    },
    {
      id: 'terms',
      title: 'Terms and Conditions of Sale',
      sections: [
        { sub: '1. Scope', text: 'These terms govern the sale of air conditioners, heat pumps and accessories by AIR ECO CLIM, based in Brié-et-Angonnes, France. They apply to any order placed via airecoclim.com.' },
        { sub: '2. Order', text: 'Orders are placed via the online form. They are confirmed after validation by AIR ECO CLIM. A unique order number is provided by email for online tracking.' },
        { sub: '3. Price and Payment', text: 'Prices are in euros (€), VAT included at the applicable rate (20%). Payment is due upon ordering, by bank transfer or credit card via our secure payment provider.' },
        { sub: '4. Delivery', text: 'Delivery is made to the address indicated by the customer, throughout France. Delivery times are communicated before order confirmation. In case of delay, the customer is informed as soon as possible.' },
        { sub: '5. Withdrawal Right', text: 'Under French law, the customer has 14 days from receipt of products to exercise the right of withdrawal without giving any reason. Products must be returned in original packaging, complete and in perfect condition. Return costs are borne by the customer.' },
        { sub: '6. Warranty', text: 'All our products benefit from the legal 2-year conformity warranty. Additional manufacturer warranties may apply depending on the brand. Installation by our certified technicians is recommended to maintain warranty coverage.' },
        { sub: '7. Installation', text: 'Installation services are carried out by our certified technicians. A free quote is provided before any intervention. Terms of intervention are detailed in the quote.' },
        { sub: '8. After-Sales Service', text: 'Our after-sales service is reachable by email for any questions regarding use, maintenance or servicing of your appliances. Technical intervention can be arranged within 48 business hours.' },
        { sub: '9. Disputes', text: 'Any dispute falls under French law and the exclusive jurisdiction of the courts of Grenoble (France). An amicable solution will be sought before any legal action.' },
        { sub: '10. Privacy', text: 'See our Privacy Policy above regarding the processing of your personal data.' },
      ],
    },
  ],
};

function Section({ title, content, subs }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(20px,3vw,32px)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:'clamp(18px,2.5vw,26px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:18 }}>
        {title}
      </h2>
      {content && <pre style={{ fontFamily:'Nunito,Inter,sans-serif', fontSize:14, color:'var(--text-2)', lineHeight:1.75, whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>{content}</pre>}
      {subs && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {subs.map((s, i) => (
            <div key={i}>
              <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:15, color:'var(--text)', marginBottom:6, lineHeight:1.3 }}>{s.sub}</h3>
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
          <h1 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:'clamp(32px,5vw,64px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:12, lineHeight:1.05 }}>
            {title}
          </h1>
          <p style={{ fontSize:16, color:'var(--text-3)', maxWidth:520, lineHeight:1.65 }}>
            {l === 'fr' ? 'Conformité légale, protection de vos données et conditions de vente.' :
             l === 'nl' ? 'Wettelijke conformiteit, gegevensbescherming en verkoopvoorwaarden.' :
             'Legal compliance, data protection and terms of sale.'}
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
