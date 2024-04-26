import { TIMEOUT_DURATION } from '@/lib/constants';
import { useAnimation } from '@/lib/hooks/use-animation';
import { usePageUtils } from '@/lib/hooks/use-page-utils';
import { usePagination } from '@/lib/hooks/use-pagination';
import { useSlide } from '@/lib/hooks/use-slide';
import PaginateButton from '@/components/slider/paginate-button/paginate-button';

const PaginateRightButton = () => {
  const {
    status: { isLastPage, isSecondToLastPage },
    actions: { goToFirstPage, goToLastPage, goToNextPage },
  } = usePagination();
  const { state: { hasPaginated }, actions: { markAsPaginated, wait } } = usePageUtils(); // prettier-ignore
  const { slide, getSlideAmount } = useSlide();
  const { enableAnimation, disableAnimation } = useAnimation();

  const handlePaginateRight = async () => {
    enableAnimation();
    const slideAmount = getSlideAmount({
      direction: 'right',
      isSecondToLastPage,
    });
    slide(slideAmount);

    await wait(TIMEOUT_DURATION);

    if (!hasPaginated) markAsPaginated();
    disableAnimation();
    slide(0);
    if (isSecondToLastPage) return goToLastPage();
    if (isLastPage) return goToFirstPage();
    goToNextPage();
  };

  return <PaginateButton onClick={handlePaginateRight} direction='right' />;
};

export default PaginateRightButton;
