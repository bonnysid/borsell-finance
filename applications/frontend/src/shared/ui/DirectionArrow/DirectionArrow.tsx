import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './DirectionArrow.module.scss';

export enum DirectionArrowType {
  UP = 'up',
  DOWN = 'down',
  NEUTRAL = 'neutral',
}

type DirectionArrowProps =
  | {
      isCustom: true;
      direction: DirectionArrowType;
    }
  | {
      isCustom?: false;
      value: number;
    };

const cx = bindStyles(styles);

export const DirectionArrow: FC<DirectionArrowProps> = (props) => {
  let currentDirection: DirectionArrowType;

  if (props.isCustom) {
    currentDirection = props.direction;
  } else {
    currentDirection =
      props.value > 0
        ? DirectionArrowType.UP
        : props.value < 0
          ? DirectionArrowType.DOWN
          : DirectionArrowType.NEUTRAL;
  }

  if (currentDirection === DirectionArrowType.NEUTRAL) {
    return null;
  }

  return (
    <span className={cx('direction-arrow', currentDirection)}>
      {currentDirection === DirectionArrowType.DOWN && '↓'}
      {currentDirection === DirectionArrowType.UP && '↑'}
    </span>
  );
};
