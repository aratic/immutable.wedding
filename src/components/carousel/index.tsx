import React, {
  cloneElement,
  Children,
  ReactElement,
  HTMLAttributes,
  forwardRef,
  Ref,
  useImperativeHandle,
} from 'react';
import 'keen-slider/keen-slider.min.css';
import KeenSlider from 'keen-slider/react';
import cx from 'classnames';

import { useCarousel, Options as CarouselOptions } from './useCarousel';
import { styled } from 'stitches.config';

export interface SliderRef {
  slider: () => KeenSlider;
  moveTo: (index: number) => void;
}
interface PageProps {
  currentIndex: number;
  size: number;
}
interface Props
  extends Pick<HTMLAttributes<HTMLDivElement>, 'className'>,
    Omit<CarouselOptions, 'slideChanged'> {
  dot?: (props: PageProps) => ReactElement;
  pageInfo?: (props: PageProps) => ReactElement;
  children: ReactElement[] | ReactElement;
  onChange?: (instance: KeenSlider) => void;
}
const Carousel = forwardRef(function Carousel(
  {
    children,
    dot,
    className,
    defaultIndex,
    onChange,
    pageInfo,
    ...props
  }: Props,
  ref: Ref<SliderRef | null>,
) {
  const { slider, sliderRef, size, index, setIndex } = useCarousel({
    defaultIndex,
    slideChanged: onChange,
    ...props,
  });

  useImperativeHandle(
    ref,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => {
      return {
        slider() {
          return slider.current;
        },
        moveTo(index: number) {
          setIndex(index);
        },
      };
    }, [setIndex, slider]
  );

  return (
    <Wrapper>
      <div ref={sliderRef} className={cx('keen-slider', className)}>
        {Children.toArray(children).map(child => {
          const carouselItem = child as ReactElement;

          return cloneElement(carouselItem, {
            ...carouselItem.props,
            className: cx('keen-slider__slide', carouselItem.props.className),
          });
        })}
      </div>
      {pageInfo?.({ currentIndex: index, size })}
      {dot?.({ currentIndex: index, size })}
    </Wrapper>
  );
});

const Wrapper = styled('div', {
  position: 'relative',
});

export default Carousel;
