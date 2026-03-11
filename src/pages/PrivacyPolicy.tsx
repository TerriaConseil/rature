import { Footer } from "@/components/home/Footer.tsx";
import { Navbar } from "@/components/Navbar.tsx";

export function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-200 px-6 pt-48 pb-16">
        <h1 className="flex items-baseline justify-center gap-3 text-center text-4xl font-extrabold tracking-tight leading-[1.1] mb-8">
          Politique de confidentialité
        </h1>
        <p className="mb-6 text-fg-muted">
          Dernière mise à jour : 10/03/2026
        </p>
        <h3 className="font-bold text-2xl mb-2">
          1. Présentation
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Rature est un outil permettant d&apos;anonymiser des documents PDF en masquant les informations sensibles avant leur partage.
          </p>
          <p>
            La protection de la vie privée est un principe fondamental du projet. L&apos;outil a été conçu pour fonctionner <span className="font-bold">sans collecte de données personnelles et sans transfert de documents vers un serveur</span>.
          </p>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          2. Traitement des documents
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Tous les documents sont traités <span className="font-bold">localement dans votre navigateur</span>.
          </p>
          <p>
            Cela signifie que :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- Les fichiers PDF <span className="font-bold">ne sont jamais envoyés à un serveur</span>.</li>
            <li>- Aucun document <span className="font-bold">n&apos;est stocké</span>.</li>
            <li>- Aucun contenu de document <span className="font-bold">n&apos;est analysé ou conservé par un serveur</span>.</li>
          </ul>
          <p>
            Le traitement est effectué directement sur votre appareil.
          </p>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          3. Données collectées
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Rature ne collecte <span className="font-bold">aucune donnée personnelle</span>.
          </p>
          <p>
            Aucun élément contenu dans les documents que vous utilisez avec l&apos;outil n&apos;est transmis, enregistré ou analysé par un serveur.
            Le service peut uniquement mesurer <span className="font-bold">des informations techniques anonymes liées au fonctionnement de l&apos;application</span>, telles que :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>
              - Les <span className="font-bold">erreurs techniques</span> (ex. : échec de l&apos;anonymisation, pour le débogage).
            </li>
          </ul>
          <p>
            <span className="font-bold">Ces informations ne permettent en aucun cas d&apos;identifier un utilisateur ou un document.</span>
          </p>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          4. Cookies et traceurs
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Rature <span className="font-bold">n&apos;utilise aucun cookie</span> et n&apos;installe aucun traceur sur votre appareil.
          </p>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          5. Vos droits
        </h3>
        <h4 className="font-bold text-lg mb-2">
          5.1 Engagement de transparence
        </h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Même si Rature ne collecte aucune donnée personnelle identifiable, nous nous engageons à
            respecter les principes du <span className="font-bold">Règlement Général sur la Protection des Données (RGPD)</span> et à vous informer de vos droits.
            Les sections suivantes détaillent ces droits, ainsi que les mesures techniques et organisationnelles mises en place pour protéger vos données.
          </p>
        </div>
        <h4 className="font-bold text-lg mb-2">
          5.2 Vos droits
        </h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Conformément au RGPD et aux autres lois applicables, vous disposez des droits suivants concernant vos données personnelles :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>
              - <span className="font-bold">Droit d&apos;accès</span> : Vous pouvez nous demander si des données vous concernant sont traitées et obtenir une copie de ces données.
            </li>
            <li>
              - <span className="font-bold">Droit de rectification</span> : Vous pouvez demander la correction de données inexactes ou incomplètes.
            </li>
            <li>
              - <span className="font-bold">Droit à l&apos;effacement</span> ("droit à l&apos;oubli") : Vous pouvez demander la suppression de vos données dans certains cas (ex. : données traitées illégalement).
            </li>
            <li>
              - <span className="font-bold">Droit à la limitation du traitement</span> : Vous pouvez demander la suspension du traitement de vos données dans des cas spécifiques.
            </li>
            <li>
              - <span className="font-bold">Droit à la portabilité</span> : Vous pouvez recevoir vos données dans un format structuré et les transmettre à un autre service.
            </li>
            <li>
              - <span className="font-bold">Droit d&apos;opposition</span> : Vous pouvez vous opposer au traitement de vos données pour des motifs légitimes.
            </li>
          </ul>
        </div>
        <h4 className="font-bold text-lg mb-2">
          5.3 Comment exercer vos droits ?
        </h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Bien que Rature ne collecte <span className="font-bold">aucune donnée personnelle identifiable</span>, vous pouvez nous contacter via :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>
              - Le dépôt GitHub du projet : <a href="https://github.com/TerriaConseil/rature" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">github.com/TerriaConseil/rature</a>
            </li>
            <li>
              - L&apos;adresse email dédiée : <a href="mailto:contact@rature.fr" className="underline underline-offset-4">contact@rature.fr</a>
            </li>
          </ul>
          <p>
            Nous nous engageons à répondre à votre demande sous <span className="font-bold">un mois</span> (délai pouvant être prolongé de deux mois en cas de complexité).
          </p>
        </div>
        <h4 className="font-bold text-lg mb-2">
          5.4 Droit d&apos;introduire une réclamation
        </h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <span className="font-bold">CNIL</span> (Commission Nationale de l&apos;Informatique et des Libertés) :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>
              📍 <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">www.cnil.fr</a>
            </li>
            <li>
              📧 <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">www.cnil.fr/fr/plaintes</a>
            </li>
          </ul>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          6. Open source et transparence
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Rature est un projet <span className="font-bold">open source</span>. Le code source est publiquement accessible pour permettre :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- La vérification du traitement des documents.</li>
            <li>- L&apos;audit du fonctionnement de l&apos;application.</li>
            <li>- La contribution au projet.</li>
          </ul>
          <p>
            🔗 <span className="font-bold">Lien vers le dépôt GitHub</span> : <a href="https://github.com/TerriaConseil/rature" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">github.com/TerriaConseil/rature</a>
          </p>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          7. Hébergement
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Rature est un service <span className="font-bold">100% client-side</span> : le traitement des documents s&apos;effectue <span className="font-bold">uniquement dans votre navigateur</span>,
            sans envoi ni stockage sur un serveur. Cependant, pour rendre l&apos;outil accessible en ligne, le site web est hébergé par un <span className="font-bold">prestataire technique tiers</span>.
          </p>
        </div>
        <h4 className="font-bold text-lg mb-2">
          7.1 Prestataire d&apos;hébergement
        </h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Le site est actuellement hébergé par :
          </p>
          <p className="pl-4">
            🏢 <span className="font-bold">OVH Cloud</span>
            <br />
            📍 2 rue Kellermann, 59100 Roubaix, France
            <br />
            🔗 <span className="font-bold">Site web</span> : <a href="https://www.ovhcloud.com/fr/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">www.ovhcloud.com</a>
          </p>
          <p>
            Ce prestataire agit en tant que <span className="font-bold">sous-traitant</span> au sens du RGPD (article 28) et n&apos;a accès{' '}
            <span className="font-bold">qu&apos;aux données techniques minimales</span> nécessaires au fonctionnement du service (voir section 6.2).
          </p>
        </div>
        <h4 className="font-bold text-lg mb-2">
          7.2 Changement de prestataire
        </h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            En cas de changement de prestataire d&apos;hébergement :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- Nous vous en informerons via une mise à jour de cette <span className="font-bold">politique de confidentialité</span>.</li>
            <li>- Les données techniques précédemment collectées seront <span className="font-bold">supprimées</span> chez l&apos;ancien prestataire avant la migration.</li>
          </ul>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          8. Sécurité
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            L&apos;architecture de Rature a été conçue pour limiter les risques liés aux documents sensibles :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- Traitement <span className="font-bold">100% local</span> dans le navigateur.</li>
            <li>- <span className="font-bold">Aucun transfert</span> de fichiers vers un serveur.</li>
            <li>- <span className="font-bold">Aucun stockage</span> de documents.</li>
          </ul>
          <p>
            Recommandations pour une sécurité optimale :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- Utilisez un <span className="font-bold">navigateur à jour</span> (ex. : Firefox, Chrome).</li>
            <li>- Évitez les <span className="font-bold">extensions non vérifiées</span> qui pourraient accéder aux données.</li>
            <li>- Vérifiez le <span className="font-bold">résultat de l&apos;anonymisation</span> avant de partager le document.</li>
          </ul>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          9. Clause de non-responsabilité
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Rature fournit un outil d&apos;anonymisation <span className="font-bold">sans garantie absolue</span>. L&apos;utilisateur reste responsable :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- De la <span className="font-bold">vérification du résultat</span> (ex. : absence de données résiduelles dans le PDF anonymisé).</li>
            <li>- Du <span className="font-bold">respect des lois applicables</span> à ses documents (ex. : droit d&apos;auteur, secret professionnel).</li>
            <li>- De l&apos;utilisation de l&apos;outil dans un <span className="font-bold">environnement sécurisé</span> (ex. : navigateur à jour, réseau non compromis).</li>
          </ul>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          10. Contact
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Pour toute question relative à cette politique ou au fonctionnement de Rature :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>📧 <span className="font-bold">Email</span> : <a href="mailto:contact@rature.fr" className="underline underline-offset-4">contact@rature.fr</a></li>
            <li>🔗 <span className="font-bold">Dépôt GitHub</span> : <a href="https://github.com/TerriaConseil/rature" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">github.com/TerriaConseil/rature</a></li>
          </ul>
        </div>
        <h3 className="font-bold text-2xl mb-2">
          11. Modification et notification des modifications
        </h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>
            Cette politique de confidentialité peut être mise à jour pour refléter :
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- Les évolutions du service.</li>
            <li>- Les changements législatifs ou réglementaires.</li>
            <li>- Les retours des utilisateurs ou des autorités de protection des données.</li>
          </ul>
          <p className="font-bold">
            Comment êtes-vous informé des modifications ?
          </p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- La <span className="font-bold">version en vigueur</span> est toujours disponible sur cette page, avec la date de dernière mise à jour.</li>
            <li>- En cas de <span className="font-bold">modification substantielle</span> (ex. : changement de prestataire d&apos;hébergement, ajout d&apos;une collecte de données), nous vous en informerons via :</li>
            <ul className="pl-4 flex flex-col gap-3">
              <li>• Une <span className="font-bold">bannière sur le site</span> lors de votre prochaine visite.</li>
              <li>• Un <span className="font-bold">email</span> si vous avez fourni une adresse de contact (ex. : pour contribuer au projet).</li>
            </ul>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
