import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC, PropsWithChildren } from 'react';

import styles from './RowInfo.module.scss';

type RowInfoProps = PropsWithChildren<{
  className?: string;
  caption?: string;
}>;

const cx = bindStyles(styles);

export const RowInfo: FC<RowInfoProps> = ({ className, caption, children }) => {
  return (
    <div className={cx('row-info', className)}>
      {caption && <div className={cx('caption')}>{caption}</div>}
      {children}
    </div>
  );
};
