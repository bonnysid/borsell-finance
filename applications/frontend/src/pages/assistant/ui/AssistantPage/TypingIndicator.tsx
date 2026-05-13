import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './AssistantPage.module.scss';

const cn = bindStyles(styles);
const INTERVAL_MS = 2600;

export const TypingIndicator = () => {
  const { t } = useTranslation();
  const phrases = t('assistant.thinking_phrases', { returnObjects: true }) as string[];

  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setAnimKey((k) => k + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [phrases.length]);

  return (
    <div className={cn('typing')}>
      <div className={cn('typing-dots')}>
        <span />
        <span />
        <span />
      </div>
      <span key={animKey} className={cn('typing-phrase')}>
        {phrases[index]}
      </span>
    </div>
  );
};
