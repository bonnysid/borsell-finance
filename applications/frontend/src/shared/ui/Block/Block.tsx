import { bindStyles, Skeleton } from '@devbonnysid/ui-kit-default';
import { CSSProperties, FC, HTMLAttributes, ReactNode } from 'react';

import styles from './Block.module.scss';

type BlockProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  titleAlign?: 'left' | 'center' | 'right';
  isLoading?: boolean;
  loadingContent?: ReactNode;
  skeletonHeight?: CSSProperties['height'];
  skeletonMinHeight?: CSSProperties['minHeight'];
};

const cx = bindStyles(styles);

export const Block: FC<BlockProps> = ({
  children,
  className,
  title,
  titleAlign = 'center',
  skeletonHeight = '100%',
  skeletonMinHeight,
  isLoading,
  loadingContent,
  ...props
}) => {
  if (isLoading) {
    if (loadingContent) {
      return (
        <div className={cx(className, 'block')} {...props}>
          {title && <div className={cx('title', titleAlign)}>{title}</div>}
          {loadingContent}
        </div>
      );
    }

    return (
      <Skeleton
        width="100%"
        height={skeletonHeight}
        minHeight={skeletonMinHeight}
        borderRadius="var(--RoundingM)"
      />
    );
  }

  return (
    <div className={cx(className, 'block')} {...props}>
      {title && <div className={cx('title', titleAlign)}>{title}</div>}
      {children}
    </div>
  );
};
