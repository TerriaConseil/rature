import { Moon, PauseCircle, PlayCircle, RefreshCcw, Sun, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { Footer } from "@/components/home/Footer.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTheme } from "@/hooks/useTheme.tsx";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-300 px-6 pt-40 pb-16">
        <h1 className="flex items-baseline justify-center gap-3 text-center text-4xl font-extrabold tracking-tight leading-[1.1] mb-8">
          Paramètres
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-6 border border-border-theme bg-card"
            style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
          >
            <h3 className="text-2xl font-extrabold">Apparence</h3>
            <div className="mt-6">
              <p className="text-md font-bold">Thème</p>
              <p className="mt-1 text-fg-muted">Vous êtes plutôt <span className="font-medium">clair</span> ou <span className="font-medium">obscur</span> ?</p>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="lg"
                  variant={theme === 'light' ? 'primary' : 'secondary'}
                  onClick={toggleTheme}
                  className="w-full flex-1 transition-all"
                >
                  <Sun size={20} />
                  Lumineux
                </Button>
                <Button
                  size="lg"
                  variant={theme === 'dark' ? 'primary' : 'secondary'}
                  onClick={toggleTheme}
                  className="w-full flex-1 transition-all"
                >
                  <Moon size={20} />
                  Sombre
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-md font-bold">Langue (Language)</p>
              <p className="mt-1 text-fg-muted">
                Notre interface est disponible uniquement en Français pour le moment.
                <br />
                <span className="font-medium">Our interface is only available in French for now.</span>
              </p>
              <Button size="lg" variant="secondary" className="mt-4 w-full transition-all">
                <span>🇫🇷</span>
                <span>Français</span>
              </Button>
            </div>
          </div>
          <div
            className="p-6 border border-border-theme bg-card"
            style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
          >
            <h3 className="text-2xl font-bold">Confidentialité</h3>
            <div className="mt-6">
              <p className="text-md font-bold">Statistiques du produit</p>
              <p className="mt-1 text-fg-muted">
                Nous allons mettre en place des statistiques sur l'utilisation du produit Rature.
                <br />
                Ces statistiques seront complètement anonymes et concerneront uniquement l'utilisation des fonctionnalités de Rature,
                conformément à notre <Link to="/privacy-policy" className="underline underline-offset-4">politique de confidentialité</Link>.
                <br />
                Vous pourrez vous désinscrire complètement de ces statistiques depuis cette page.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button size="lg" variant="secondary" className="w-full flex-1 transition-all" disabled>
                  <PlayCircle size={20} />
                  Inscription
                </Button>
                <Button size="lg" variant="primary" className="w-full flex-1 transition-all">
                  <PauseCircle size={20} />
                  Désinscription
                </Button>
              </div>
            </div>
          </div>
          <div
            className="p-6 border border-border-theme bg-card"
            style={{ boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
          >
            <h3 className="text-2xl font-bold">Gestion du cache</h3>
            <div className="mt-6">
              <p className="text-md font-bold">Fichiers mis en cache</p>
              <p className="mt-1 text-fg-muted">
                Rature enregistre dans votre navigateur les outils nécessaires au traitement de vos documents. Cela évite de les télécharger à chaque utilisation.
                <br />
                Lors de votre première utilisation, le chargement peut donc être un peu plus long. Ces fichiers occupent toutefois de l&apos;espace sur votre appareil.
                <br />
                Vous pouvez les supprimer à tout moment si vous ne souhaitez plus utiliser Rature.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-full flex-1 p-4 bg-gray-100">
                  <p className="text-fg-muted font-medium text-sm">Taille totale sur le disque</p>
                  <p className="mt-2 text-fg font-bold text-xl">0 octets</p>
                </div>
                <div className="w-full flex-1 p-4 bg-gray-100">
                  <p className="text-fg-muted font-medium text-sm">Nombre de fichiers</p>
                  <p className="mt-2 text-fg font-bold text-xl">0</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button size="lg" variant="secondary" className="w-full flex-1" disabled>
                  <RefreshCcw size={20} />
                  Rafraîchir le cache
                </Button>
                <Button size="lg" variant="secondary" className="w-full flex-1" disabled>
                  <Trash2 size={20} />
                  Supprimer le cache
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-md font-bold">Données du site</p>
              <p className="mt-1 text-fg-muted">
                Vous pouvez également supprimer toutes les données de Rature, y compris les fichiers en cache et les paramètres du site.
                Cette action aura pour effet de recharger la page et remettra Rature à son état d'origine.
              </p>
              <Button size="lg" variant="secondary" className="mt-4 w-full flex-1" disabled>
                <Trash2 size={20} />
                Supprimer toutes les données
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
