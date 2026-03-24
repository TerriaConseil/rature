import { Trans, useTranslation } from "react-i18next";

import { Footer } from "@/components/home/Footer.tsx";
import { Navbar } from "@/components/Navbar.tsx";

const bold = <span className="font-bold" />;
const githubLink = <a href="https://github.com/TerriaConseil/rature" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" />;
const hostLink = <a href="https://www.ovhcloud.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" />;
const mailLink = <a href="mailto:contact@rature.fr" className="underline underline-offset-4" />;
const components = { bold, githubLink, hostLink, mailLink };

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <Navbar />

      <section className="flex-1 mx-auto h-full w-full max-w-200 px-6 pt-40 pb-16">
        <h1 className="flex items-baseline justify-center gap-3 text-center text-4xl font-extrabold tracking-tight leading-[1.1] mb-8">
          {t('privacy.title')}
        </h1>
        <p className="mb-6 text-fg-muted">{t('privacy.lastUpdated')}</p>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s1.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s1.p1')}</p>
          <p><Trans i18nKey="privacy.s1.p2" components={components} /></p>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s2.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s2.p1" components={components} /></p>
          <p>{t('privacy.s2.p2')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s2.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s2.li2" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s2.li3" components={components} /></li>
          </ul>
          <p>{t('privacy.s2.p3')}</p>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s3.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s3.p1" components={components} /></p>
          <p><Trans i18nKey="privacy.s3.p2" components={components} /></p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s3.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s3.li2" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s3.li3" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s3.li4" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s3.li5" components={components} /></li>
          </ul>
          <p><Trans i18nKey="privacy.s3.p3" components={components} /></p>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s4.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s4.p1" components={components} /></p>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s5.title')}</h3>
        <h4 className="font-bold text-lg mb-2">{t('privacy.s5.s5_1.title')}</h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s5.s5_1.p1" components={components} /></p>
        </div>
        <h4 className="font-bold text-lg mb-2">{t('privacy.s5.s5_2.title')}</h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s5.s5_2.p1')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s5.s5_2.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s5.s5_2.li2" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s5.s5_2.li3" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s5.s5_2.li4" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s5.s5_2.li5" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s5.s5_2.li6" components={components} /></li>
          </ul>
        </div>
        <h4 className="font-bold text-lg mb-2">{t('privacy.s5.s5_3.title')}</h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s5.s5_3.p1" components={components} /></p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s5.s5_3.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s5.s5_3.li2" components={components} /></li>
          </ul>
          <p><Trans i18nKey="privacy.s5.s5_3.p2" components={components} /></p>
        </div>
        <h4 className="font-bold text-lg mb-2">{t('privacy.s5.s5_4.title')}</h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s5.s5_4.p1" components={components} /></p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>
              📍 <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">www.cnil.fr</a>
            </li>
            <li>
              📧 <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">www.cnil.fr/fr/plaintes</a>
            </li>
          </ul>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s6.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s6.p1" components={components} /></p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- {t('privacy.s6.li1')}</li>
            <li>- {t('privacy.s6.li2')}</li>
            <li>- {t('privacy.s6.li3')}</li>
          </ul>
          <p><Trans i18nKey="privacy.s6.p2" components={components} /></p>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s7.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s7.p1" components={components} /></p>
        </div>
        <h4 className="font-bold text-lg mb-2">{t('privacy.s7.s7_1.title')}</h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s7.s7_1.p1')}</p>
          <p className="pl-4">
            <Trans i18nKey="privacy.s7.s7_1.provider" components={components} />
            <br />
            {t('privacy.s7.s7_1.address')}
            <br />
            <Trans i18nKey="privacy.s7.s7_1.website" components={components} />
          </p>
          <p><Trans i18nKey="privacy.s7.s7_1.p2" components={components} /></p>
        </div>
        <h4 className="font-bold text-lg mb-2">{t('privacy.s7.s7_2.title')}</h4>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s7.s7_2.p1')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s7.s7_2.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s7.s7_2.li2" components={components} /></li>
          </ul>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s8.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s8.p1')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s8.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s8.li2" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s8.li3" components={components} /></li>
          </ul>
          <p>{t('privacy.s8.p2')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s8.rec1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s8.rec2" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s8.rec3" components={components} /></li>
          </ul>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s9.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p><Trans i18nKey="privacy.s9.p1" components={components} /></p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s9.li1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s9.li2" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s9.li3" components={components} /></li>
          </ul>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s10.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s10.p1')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li><Trans i18nKey="privacy.s10.email" components={components} /></li>
            <li><Trans i18nKey="privacy.s10.github" components={components} /></li>
          </ul>
        </div>

        <h3 className="font-bold text-2xl mb-2">{t('privacy.s11.title')}</h3>
        <div className="flex flex-col gap-2 mb-6 pl-4">
          <p>{t('privacy.s11.p1')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- {t('privacy.s11.li1')}</li>
            <li>- {t('privacy.s11.li2')}</li>
            <li>- {t('privacy.s11.li3')}</li>
          </ul>
          <p className="font-bold">{t('privacy.s11.howTitle')}</p>
          <ul className="pl-4 flex flex-col gap-3">
            <li>- <Trans i18nKey="privacy.s11.how1" components={components} /></li>
            <li>- <Trans i18nKey="privacy.s11.how2" components={components} /></li>
            <ul className="pl-4 flex flex-col gap-3">
              <li>• <Trans i18nKey="privacy.s11.how2a" components={components} /></li>
              <li>• <Trans i18nKey="privacy.s11.how2b" components={components} /></li>
            </ul>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
