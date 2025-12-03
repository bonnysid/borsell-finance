import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC, SVGProps } from 'react';

import LogoSVG from '../../assets/img/logo.svg?react';
import styles from './Logo.module.scss';

type LogoProps = SVGProps<SVGSVGElement>;

const cx = bindStyles(styles);

export const Logo: FC<LogoProps> = ({ className, ...props }) => {
  return <LogoSVG className={cx(className, 'logo')} {...props} />;
};
