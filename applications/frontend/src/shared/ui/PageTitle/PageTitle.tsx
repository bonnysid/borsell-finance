import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC, HTMLAttributes } from 'react';

import styles from './PageTitle.module.scss';

type OwnProps = {
  title?: string;
};

type PageTitleProps = Omit<HTMLAttributes<HTMLHeadingElement>, keyof OwnProps> & OwnProps;

const cx = bindStyles(styles);

export const PageTitle: FC<PageTitleProps> = ({ title, className, children, ...rest }) => {
  return (
    <h1 className={cx(className, 'page-title')} {...rest}>
      {title ?? children}
    </h1>
  );
};
