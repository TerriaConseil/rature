import { CircleQuestionMark, ChevronDown, ArrowUpRight } from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

import { HelpModal, type HelpModalKind } from "@/components/workflow/HelpModal.tsx";
import { cn } from "@/lib/utils.ts";

export function HowItWorks() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalKind, setModalKind] = useState<HelpModalKind | null>(null);

  const isModalOpen = !!modalKind;

  const toggleExpansion = () => setIsExpanded((value) => !value);

  const closeModal = () => setModalKind(null);

  const handleQuestionClick = (event: SyntheticEvent<HTMLButtonElement>, kind: HelpModalKind) => {
    event.currentTarget.blur();
    setModalKind(kind);
  };

  const questionsKeywords: HelpModalKind[] = ['add', 'update', 'remove'];

  return (
    <>
      <div className="absolute top-4 left-70 rounded-lg bg-card shadow-sm z-10">
        <button
          onClick={toggleExpansion}
          className={cn(
            "flex items-center w-full gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-fg-muted hover:text-fg bg-accent/8 border border-border-theme dark:bg-accent/12 hover:border-border-strong transition-all ease-in-out duration-300 cursor-pointer",
          )}
        >
          <CircleQuestionMark size={20} />
          <span>{t('help.buttonTitle')}</span>
          <ChevronDown size={20} className={cn("ml-auto transition-transform duration-300", isExpanded && "-rotate-180")} />
        </button>
        <div className={cn("max-h-0 transition-all duration-300", isExpanded && "max-h-90")}>
          <div className={cn("w-full flex flex-col gap-4 p-4 opacity-0 transition-opacity duration-200", isExpanded && "opacity-100")}>
            {questionsKeywords.map((keyword) => (
              <button
                key={`help-${keyword}`}
                onClick={(event) => handleQuestionClick(event, keyword)}
                className="group w-full flex gap-2 align-center justify-between text-sm text-fg-muted transition-colors duration-300 hover:text-fg cursor-pointer">
                <span>{t(`help.questions.${keyword}`)}</span>
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-45" />
              </button>
            ))}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <HelpModal kind={modalKind} open={isModalOpen} onClose={closeModal} />
      )}
    </>
  );
}
