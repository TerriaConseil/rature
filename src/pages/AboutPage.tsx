import { ExternalLink, Upload } from "lucide-react";
import { Link } from "react-router";

import { Footer } from "@/components/home/Footer.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { RatureLogo } from "@/components/RatureLogo.tsx";
import { Button } from "@/components/ui/button.tsx";

export function AboutPage() {
  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-200 px-6 pt-48 pb-16">
        <h1 className="flex items-baseline justify-center gap-3 text-center text-4xl font-extrabold tracking-tight leading-[1.1] mb-8">
          <span>À propos de</span>
          <RatureLogo size="xl" />
        </h1>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2">Le constat</h3>
          <p className="pb-4 pl-4">
            Utiliser des outils IA implique souvent de partager des documents
            contenant des informations sensibles : noms, prénoms, adresses,
            emails ou encore des données client.
          </p>
          <h3 className="font-bold text-2xl mb-2">La solution manuelle</h3>
          <p className="pl-4">
            Une solution consiste à anonymiser les documents <span className="underline underline-offset-4">à la main</span> :
            chercher chaque information sensible, les masquer une par une,
            vérifier et revérifier.
            <br />
            <span className="font-medium">C&apos;est long, fastidieux et source d&apos;erreur.</span>
          </p>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2"><RatureLogo size="lg" /> résoud ce problème</h3>
          <p className="pl-4">
            L&apos;outil détecte et masque <span className="font-medium">automatiquement</span> les données
            sensibles dans vos documents afin que vous puissiez les partager ou les analyser en toute sécurité.
            <br />
            <br />
            Contrairement à de nombreux services en ligne, <RatureLogo /> fonctionne entièrement dans
            votre navigateur : vos fichiers ne sont jamais envoyés à un serveur et ne quittent jamais votre appareil.
            <br />
            <br />
            Le projet suit une philosophie simple : vous devez pouvoir utiliser des outils IA
            sans compromettre la confidentialité de vos données.
          </p>
        </div>
        <div className="mb-6 p-8 text-center font-medium">
          <Link to="/">
            <Button size="lg">
              <Upload size={18} />
              Essayez <RatureLogo /> maintenant !
            </Button>
          </Link>
          <p className="text-xs mt-1">C'est gratuit, illimité et sécurisé.</p>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2">Comment ça marche ?</h3>
          <ol className="flex flex-col gap-4 mb-2 pl-4">
            <li>
              <p className="font-medium">
                1. Importez votre PDF
              </p>
              <p>
                Glissez simplement votre document dans l&apos;application. Le traitement commence immédiatement dans votre navigateur.
              </p>
            </li>

            <li>
              <p className="font-medium">
                2. Détection automatique des données sensibles
              </p>
              <p>
                <RatureLogo />  analyse le document et identifie les informations potentiellement sensibles : noms, adresses, emails, numéros de téléphone, identifiants, etc.
              </p>
            </li>

            <li>
              <p className="font-medium">
                3. Éditez les éléments détectés
              </p>
              <p>
                Les données repérées sont mises en évidence dans le document. Vous pouvez rapidement vérifier et ajuster ce qui doit être anonymisé (Un double-clic pour masquer/ajouter).
              </p>
            </li>

            <li>
              <p className="font-medium">
                4. Vérifier les ratures
              </p>
              <p>
                En un clic, vous pouvez prévisualiser le document anonymisé.
              </p>
            </li>

            <li>
              <p className="font-medium">
                5. Exportez votre PDF anonymisé
              </p>
              <p>
                Téléchargez votre document anonymisé et utilisez-le en toute sécurité : partage, analyse par une IA, archivage, etc.
              </p>
            </li>
          </ol>

          <p className="pt-4 pl-4">
            Tout le processus se déroule <span className="font-medium">100 % localement dans votre navigateur</span>.
            <br />
            Vos fichiers ne quittent jamais votre ordinateur.
          </p>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2">Open source et transparent</h3>
          <p className="mb-4 pl-4">
            <RatureLogo /> est un projet <span className="underline underline-offset-4">open source</span>.
          </p>
          <a
            href="https://github.com/TerriaConseil/rature"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 pl-4"
          >
            <Button variant="secondary">
              <ExternalLink size={16} />
              Consulter le code sur GitHub
            </Button>
          </a>
          <p className="pt-4 pl-4">
            Le code source est public. Il peut être consulté et vérifié. Cette transparence est essentielle pour un outil qui traite des documents potentiellement sensibles.
            <br />
            Vous pouvez consulter la manière dont les fichiers sont analysés, comment les entités sont détectées dans le texte et comment l&apos;anonymisation est appliquée.
            <br />
            <br />
            <span className="font-medium">Vous êtes développeur ?</span> Les contributions au projet sont les bienvenues !
            <br />
            <span className="font-medium">Vous n'êtes pas développeur ?</span> Suggérez-nous des améliorations et nous examinerons la faisabilité !
            <br />
            <br />
            Nous sommes convaincus que les outils de confidentialité doivent être <span className="font-medium">ouverts et vérifiables pour être dignes de confiance</span>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
