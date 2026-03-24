import { ExternalLink, Upload } from "lucide-react";
import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Footer } from "@/components/home/Footer.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { RatureLogo } from "@/components/RatureLogo.tsx";
import { Button } from "@/components/ui/button.tsx";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-200 px-6 pt-40 pb-16">
        <h1 className="flex items-baseline justify-center gap-3 text-center text-4xl font-extrabold tracking-tight leading-[1.1] mb-8">
          <span>{t('about.title')}</span>
          <RatureLogo size="xl" />
        </h1>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2">{t('about.observation.title')}</h3>
          <p className="pb-4 pl-4">
            {t('about.observation.description')}
          </p>
          <h3 className="font-bold text-2xl mb-2">{t('about.manual.title')}</h3>
          <p className="pl-4">
            <Trans
              i18nKey="about.manual.description"
              components={{ underline: <span className="underline underline-offset-4" /> }}
            />
            <br />
            <span className="font-medium">{t('about.manual.note')}</span>
          </p>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2"><RatureLogo size="lg" /> {t('about.solution.title')}</h3>
          <p className="pl-4">
            <Trans
              i18nKey="about.solution.p1"
              components={{ bold: <span className="font-medium" /> }}
            />
            <br />
            <br />
            <Trans
              i18nKey="about.solution.p2"
              components={{ app: <RatureLogo /> }}
            />
            <br />
            <br />
            {t('about.solution.p3')}
          </p>
        </div>
        <div className="mb-6 p-8 text-center font-medium">
          <Link to="/">
            <Button size="lg">
              <Upload size={18} />
              {t('about.cta.button')} <RatureLogo /> {t('about.cta.buttonSuffix')}
            </Button>
          </Link>
          <p className="text-xs mt-1">{t('about.cta.sub')}</p>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2">{t('about.howItWorks.title')}</h3>
          <ol className="flex flex-col gap-4 mb-2 pl-4">
            <li>
              <p className="font-medium">{t('about.howItWorks.step1.title')}</p>
              <p>{t('about.howItWorks.step1.description')}</p>
            </li>
            <li>
              <p className="font-medium">{t('about.howItWorks.step2.title')}</p>
              <p><RatureLogo /> {t('about.howItWorks.step2.description')}</p>
            </li>
            <li>
              <p className="font-medium">{t('about.howItWorks.step3.title')}</p>
              <p>{t('about.howItWorks.step3.description')}</p>
            </li>
            <li>
              <p className="font-medium">{t('about.howItWorks.step4.title')}</p>
              <p>{t('about.howItWorks.step4.description')}</p>
            </li>
            <li>
              <p className="font-medium">{t('about.howItWorks.step5.title')}</p>
              <p>{t('about.howItWorks.step5.description')}</p>
            </li>
          </ol>
          <p className="pt-4 pl-4">
            <Trans
              i18nKey="about.howItWorks.localNote"
              components={{ bold: <span className="font-medium" /> }}
            />
            <br />
            {t('about.howItWorks.noLeave')}
          </p>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-2xl mb-2">{t('about.openSource.title')}</h3>
          <p className="mb-4 pl-4">
            <RatureLogo />{' '}
            <Trans
              i18nKey="about.openSource.isOpenSource"
              components={{ underline: <span className="underline underline-offset-4" /> }}
            />
          </p>
          <a
            href="https://github.com/TerriaConseil/rature"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 pl-4"
          >
            <Button variant="secondary">
              <ExternalLink size={16} />
              {t('about.openSource.viewCode')}
            </Button>
          </a>
          <p className="pt-4 pl-4">
            {t('about.openSource.sourceDesc')}
            <br />
            {t('about.openSource.sourceDesc2')}
            <br />
            <br />
            <span className="font-medium">{t('about.openSource.devNote')}</span>{' '}
            <Trans
              i18nKey="about.openSource.devContrib"
              components={{
                githubLink: <a href="https://github.com/TerriaConseil/rature/issues" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" />
              }}
            />
            <br />
            <span className="font-medium">{t('about.openSource.nonDevNote')}</span>{' '}
            <Trans
              i18nKey="about.openSource.nonDevContrib"
              components={{
                fiderLink: <a href="https://rature.fider.io/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" />
              }}
            />
            <br />
            <br />
            <Trans
              i18nKey="about.openSource.philosophy"
              components={{ bold: <span className="font-medium" /> }}
            />
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
