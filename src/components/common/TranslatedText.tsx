import React from "react";
import { useTranslation } from "@/lib/i18n";

interface TranslatedTextProps {
  id: string;
  params?: Record<string, string>;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Component that renders translated text
 */
const TranslatedText: React.FC<TranslatedTextProps> = ({
  id,
  params = {},
  as: Component = "span",
  className = "",
}) => {
  const { t } = useTranslation();

  return <Component className={className}>{t(id, params)}</Component>;
};

export default TranslatedText;
