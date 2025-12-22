import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC, HTMLAttributes } from 'react';

import styles from './PageWrapper.module.scss';

type PageWrapperProps = HTMLAttributes<HTMLDivElement>;

const cx = bindStyles(styles);

export const PageWrapper: FC<PageWrapperProps> = ({ className, children, ...props }) => {
  return (
    <div className={cx(className, 'page-wrapper')} {...props}>
      {children}
    </div>
  );
};
