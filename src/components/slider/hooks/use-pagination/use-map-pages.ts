/* eslint no-restricted-imports: 0 */

import { useSliderStore } from '@/providers/slider-provider';

import { Pages } from '@/lib/types';
import { Movie } from '@/lib/zod-types.ts/modelSchema/MovieSchema';
import { usePageUtils } from '@/components/slider/hooks/use-page-utils';
import { useValidators } from '@/components/slider/hooks/use-validators';

type SetMapTilesParams = {
  firstTileCurrentPage: Movie;
  firstTileCurrentPageIndex: number;
  isFirstPage?: boolean;
  isLastPage?: boolean;
};

export const useMapPages = () => {
  const TILES = useSliderStore(state => state.TILES);
  const setAllPages = useSliderStore(state => state.setAllPages);
  const { validatePages } = useValidators();
  const { getTilesPerPage, getTotalTiles, getStartIndex } = usePageUtils();

  const setMapTiles = ({
    firstTileCurrentPage,
    firstTileCurrentPageIndex,
    isFirstPage,
    isLastPage,
  }: SetMapTilesParams) => {
    const newPages: Pages = new Map<number, Movie[]>();
    const newTilesPerPage = getTilesPerPage();
    let newFirstPageLength = newTilesPerPage;
    let newLastPageLength = newTilesPerPage;

    const leftTilesTotal = getTotalTiles(firstTileCurrentPageIndex / newTilesPerPage);
    const rightTilesTotal = getTotalTiles((TILES.length - firstTileCurrentPageIndex) / newTilesPerPage);

    const newTilesTotal = leftTilesTotal + rightTilesTotal;
    const newMaxPages = newTilesTotal / newTilesPerPage;
    let newCurrentPage = -1;

    let startIndex = getStartIndex(firstTileCurrentPageIndex, leftTilesTotal);
    let tempTiles: Movie[] = [];
    for (let i = 0; i < newTilesTotal; i++) {
      if (startIndex >= TILES.length) startIndex = 0;

      const pageNumber = Math.floor(i / newTilesPerPage);
      const idMatches = tempTiles.some(tile => tile.id === firstTileCurrentPage.id);
      if (idMatches && pageNumber > 1 && newCurrentPage === -1) newCurrentPage = pageNumber;

      tempTiles.push(TILES[startIndex++]);
      if (tempTiles.length !== newTilesPerPage) continue;

      const firstTileIndex = tempTiles.findIndex(tile => tile.id === TILES.at(0)?.id);
      if (firstTileIndex > 0) {
        const tilesNeeded = tempTiles.slice(0, firstTileIndex).length;
        if (pageNumber === 1) newFirstPageLength = newTilesPerPage - tilesNeeded;
        if (pageNumber === newMaxPages - 2) newLastPageLength = tilesNeeded;
      }

      newPages.set(pageNumber, tempTiles);
      tempTiles = [];
    }

    // console.table({
    //   startIndex: startIndex,
    //   newCurrentPage: newCurrentPage,
    //   leftTilesTotal: leftTilesTotal,
    //   rightTilesTotal: rightTilesTotal,
    //   totalTiles: leftTilesTotal + rightTilesTotal,
    //   newMaxPages: newMaxPages,
    //   newFirstPageLength: newFirstPageLength,
    //   newLastPageLength: newLastPageLength,
    // });
    //
    // [...newPages.entries()]
    //   .sort((a, b) => a[0] - b[0])
    //   .forEach(([pageIndex, tiles]) => {
    //     console.log(
    //       `Page ${pageIndex}:`,
    //       tiles.map(card => (card ? card.id : undefined))
    //     );
    //   });

    validatePages({
      label: 'useMapPages()',
      pages: newPages,
      expectedMaxPages: newMaxPages,
      expectedTilesPerPage: newTilesPerPage,
    });

    setAllPages({
      pages: newPages,
      currentPage: isFirstPage ? 1 : isLastPage ? newMaxPages - 2 : newCurrentPage,
      maxPages: newMaxPages,
      tilesPerPage: newTilesPerPage,
      firstPageLength: newFirstPageLength,
      lastPageLength: newLastPageLength,
      isMounted: true,
    });
  };

  return { setMapTiles };
};
