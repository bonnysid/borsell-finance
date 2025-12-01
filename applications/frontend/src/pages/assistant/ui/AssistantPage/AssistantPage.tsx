import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './AssistantPage.module.scss';

type AssistantPageProps = {};

const cn = bindStyles(styles);

export const AssistantPage: FC<AssistantPageProps> = () => {
  return <div className={cn('assistant-page')}>assistant</div>;
};

export default AssistantPage;
