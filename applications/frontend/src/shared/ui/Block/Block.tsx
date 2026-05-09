import { bindStyles, Skeleton } from '@devbonnysid/ui-kit-default';
import { FC, HTMLAttributes } from 'react';

import styles from './Block.module.scss';

type BlockProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  isLoading?: boolean;
};

const cx = bindStyles(styles);

export const Block: FC<BlockProps> = ({ children, className, title, isLoading, ...props }) => {
  if (isLoading) {
    return <Skeleton width="100%" height="100%" borderRadius="var(--RoundingM)" />;
  }

  return (
    <div className={cx(className, 'block')} {...props}>
      {title && <div className={cx('title')}>{title}</div>}
      {children}
    </div>
  );
};
