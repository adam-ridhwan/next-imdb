import chalk from 'chalk';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { DEVELOPMENT_MODE, DIRECTION, TIMEOUT_DURATION } from '@/lib/constants';
import { Pages, Tile } from '@/lib/types';
import {
  findIndexFromKey,
  getMapItem,
  getMaxPages,
  getTilesPerPage,
  validatePagesMap,
} from '@/lib/utils';
import { GetTranslatePercentageParams } from '@/components/slider/use-translate-percentage';

const log = (string: string) =>
  DEVELOPMENT_MODE ? console.log(chalk.bgBlueBright.black(` ${string} `)) : null;

type State = {
  TILES: Tile[];
  pages: Pages;
  maxPage: number;
  currentPage: number;
  tilesPerPage: number;
  firstPageLength: number;
  lastPageLength: number;
  translatePercentage: number;
  isFirstPageVisited: boolean;
  isLastPageVisited: boolean;
  hasPaginated: boolean;
  isAnimating: boolean;
  isMounted: boolean;
};

type Actions = {
  setCurrentPage: (currentPage: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setInitialPages: () => void;
  setPagesAfterResize: (previousTiles: Tile[]) => void;
  resetPages: () => void;
  setTilesPerPage: (tilesPerPage: number) => void;
  setLastPageLength: (lastPageLength: number) => void;
  setTranslatePercentage: (translatePercentage: number) => void;
  markAsPaginated: () => void;
  setIsAnimating: (isAnimating: boolean) => void;
  enableAnimation: () => void;
  disableAnimation: () => void;
  handleRightScroll: (
    getTranslatePercentage: (params: GetTranslatePercentageParams) => number
  ) => void;
  handleLeftScroll: (
    getTranslatePercentage: (params: GetTranslatePercentageParams) => number
  ) => void;
};

export type SliderStore = State & Actions;

export const createSliderStore = (TILES: Tile[]) =>
  create(
    devtools<SliderStore>((set, get) => ({
      TILES: TILES,
      pages: new Map<number, Tile[]>().set(1, TILES.slice(0, 7)),
      maxPage: getMaxPages(TILES),
      tilesPerPage: getTilesPerPage(),
      currentPage: 1,
      hasPaginated: false,
      isAnimating: false,
      isFirstPageVisited: false,
      isLastPageVisited: false,
      firstPageLength: 0,
      lastPageLength: 0,
      translatePercentage: 0,
      isMounted: false,

      setTilesPerPage: tilesPerPage => set(() => ({ tilesPerPage })),
      goToNextPage: () =>
        set(state => {
          log('GO TO NEXT PAGE');
          return state.hasPaginated
            ? { currentPage: state.currentPage + 1 }
            : { currentPage: state.currentPage + 1, hasPaginated: true };
        }),
      goToPrevPage: () =>
        set(state => {
          log('GO TO PREVIOUS PAGE');
          return { currentPage: state.currentPage - 1 };
        }),
      resetPages: () => set(() => ({ pages: new Map() })),
      markAsPaginated: () => set(() => ({ hasPaginated: true })),
      setLastPageLength: lastPageLength => set(() => ({ lastPageLength })),
      setTranslatePercentage: translatePercentage => set(() => ({ translatePercentage })),
      setCurrentPage: currentPage => set(() => ({ currentPage })),
      setIsAnimating: (isAnimating: boolean) => set(() => ({ isAnimating })),
      setInitialPages: () => {
        set(state => {
          const initialPages: Pages = new Map<number, Tile[]>();

          // Left page placeholder
          initialPages.set(0, TILES.slice(-state.tilesPerPage));

          // Middle pages
          for (let pageIndex = 1; pageIndex < state.maxPage; pageIndex++) {
            const startIndex = (pageIndex - 1) * state.tilesPerPage;
            const endIndex = startIndex + state.tilesPerPage;
            initialPages.set(pageIndex, TILES.slice(startIndex, endIndex));
          }

          const lastPage = getMapItem({
            label: 'setInitialPages()',
            map: initialPages,
            key: state.maxPage - 2,
          });

          const tilesNeededForLastPage = state.tilesPerPage - lastPage.length;
          if (tilesNeededForLastPage) {
            initialPages.set(state.maxPage - 2, [
              ...lastPage,
              ...TILES.slice(0, tilesNeededForLastPage),
            ]);
          }

          // Right page placeholder
          initialPages.set(
            state.maxPage - 1,
            TILES.slice(tilesNeededForLastPage, state.tilesPerPage + tilesNeededForLastPage)
          );

          validatePagesMap({ label: 'setInitialPages()', tiles: TILES, pages: initialPages });

          return {
            pages: initialPages,
            lastPageLength: state.tilesPerPage - tilesNeededForLastPage,
            isFirstPageVisited: true,
            isMounted: true,
          };
        });
      },
      setPagesAfterResize: previousTilesCurrentPage => {
        // set(state => {
        //   log('setPagesAfterResize()');
        //   get().resetPages();
        //
        //   /** ────────────────────────────────────────────────────────────────────────────────
        //    * FOUR tilesPerPage to THREE tilesPerPage - when resizing from 2nd page
        //    *  L        1           2           3        R
        //    * [9] - [1,2,3,4] - [5,6,7,8] - [9,1,2,3] - [4]
        //    * [7] -  [8,9,1]  -  [2,3,4]  -  [5,6,7]  -  [8,9,1]  - [2]
        //    *
        //    * left - 3 tiles
        //    * right - 6 tiles
        //    * ────────────────────────────────────────────────────────────────────────────── */
        //
        //   /** ────────────────────────────────────────────────────────────────────────────────
        //    * FOUR tilesPerPage to THREE tilesPerPage - when resizing from 3rd page (last page)
        //    *  L        1           2           3        R
        //    * [7] - [7,8,9,1] - [2,3,4,5] - [6,7,8,9] - [1]
        //    * [8] -  [9,1,2]  -  [3,4,5]  -  [6,7,8]  - [9]
        //    *
        //    * TODO:
        //    * ────────────────────────────────────────────────────────────────────────────── */
        //
        //   const newTiles: Tile[] = [];
        //
        //   const newTilesPerPage = getTilesPerPage();
        //   const newMaxPage = Math.ceil(TILES.length / newTilesPerPage);
        //
        //   const totalTilesToTheLeft = newTilesPerPage * state.currentPage; // 1
        //   const totalTilesToTheRight = newTilesPerPage * (newMaxPage - state.currentPage + 1); // 2
        //
        //   const indexOfFirstItemInCurrentPage = findIndexFromKey({
        //     label: 'setPagesAfterResize()',
        //     array: state.TILES,
        //     key: 'id',
        //     value: previousTilesCurrentPage[0].id,
        //   });
        //
        //   let decrementingTilesIndex = indexOfFirstItemInCurrentPage - 1;
        //   for (let i = totalTilesToTheLeft; i > 0; i--) {
        //     newTiles.unshift(state.TILES[decrementingTilesIndex--]);
        //     if (decrementingTilesIndex === -1) {
        //       decrementingTilesIndex = state.TILES.length - 1;
        //     }
        //   }
        //
        //   let incrementingTilesIndex = indexOfFirstItemInCurrentPage;
        //   let hasMissingTiles = false;
        //   let newLastPageLength = newTilesPerPage;
        //   for (let i = 0; i < totalTilesToTheRight; i++) {
        //     newTiles.push(state.TILES[incrementingTilesIndex++]);
        //     if (hasMissingTiles) {
        //       newLastPageLength--;
        //     }
        //     if (incrementingTilesIndex === state.TILES.length) {
        //       incrementingTilesIndex = 0;
        //       hasMissingTiles = true;
        //     }
        //   }
        //
        //   // console.log([totalTilesToTheLeft, totalTilesToTheRight]);
        //   // console.log(
        //   //   'previousTilesCurrentPage',
        //   //   previousTilesCurrentPage.map(tile => tile.id)
        //   // );
        //
        //   console.log('previousTilesCurrentPage', previousTilesCurrentPage);
        //   console.log('newLastPageLength', newLastPageLength);
        //
        //   const newPages: Pages = new Map<number, Tile[]>();
        //   for (let pageIndex = 0; pageIndex < newMaxPage + 1; pageIndex++) {
        //     const startIndex = pageIndex * newTilesPerPage;
        //     const endIndex = startIndex + newTilesPerPage;
        //     const newTilesGroup = newTiles.slice(startIndex, endIndex);
        //     newPages.set(pageIndex + 1, newTilesGroup);
        //   }
        //
        //   console.log(newPages);
        //   console.log(state.currentPage);
        //
        //   newPages.forEach((value, key) => {
        //     console.log(
        //       ` Page ${key}: `,
        //       value.map(tile => (tile ? tile.id : undefined))
        //     );
        //   });
        //
        //   // cache
        //   const initialPages: Pages = new Map<number, Tile[]>();
        //
        //   for (let pageIndex = 0; pageIndex < newMaxPage; pageIndex++) {
        //     const startIndex = pageIndex * newTilesPerPage;
        //     const endIndex = startIndex + newTilesPerPage;
        //     initialPages.set(pageIndex + 1, TILES.slice(startIndex, endIndex));
        //   }
        //
        //   const lastPage = getMapItem({
        //     label: 'setInitialPages()',
        //     map: initialPages,
        //     key: newMaxPage,
        //   });
        //
        //   if (lastPage.length < newTilesPerPage && initialPages.size > 1) {
        //     const tilesNeeded = newTilesPerPage - lastPage.length;
        //     initialPages.set(newMaxPage, [...lastPage, ...TILES.slice(0, tilesNeeded)]);
        //   }
        //
        //   console.log(initialPages);
        //   console.log(state.currentPage);
        //
        //   initialPages.forEach((value, key) => {
        //     console.log(
        //       ` Page ${key}: `,
        //       value.map(tile => (tile ? tile.id : undefined))
        //     );
        //   });
        //
        //   return {
        //     pages: state.currentPage === 1 ? initialPages : newPages,
        //     currentPage: state.currentPage === 1 ? 1 : state.currentPage + 1,
        //     tilesPerPage: newTilesPerPage,
        //     maxPage: newMaxPage + 1,
        //     lastPageLength: newLastPageLength,
        //     isLastPageVisited: true,
        //     isFirstPageVisited: true,
        //   };
        // });
      },
      goToFirstPage: () =>
        set(state => {
          log('GO TO FIRST PAGE');
          state.setInitialPages();

          return {
            currentPage: 1,
          };
        }),
      goToLastPage: () =>
        set(state => {
          log('GO TO LAST PAGE');

          const start = performance.now();

          const newPages: Pages = new Map<number, Tile[]>();

          // Right page placeholder
          newPages.set(state.maxPage - 1, TILES.slice(0, state.tilesPerPage));

          // Middle pages
          let endIndex = TILES.length;
          let startIndex = TILES.length - state.tilesPerPage;
          const middlePagesLength = state.maxPage - 2;
          for (let i = middlePagesLength; i > 0; i--) {
            newPages.set(i, TILES.slice(Math.max(0, startIndex), endIndex));
            startIndex -= state.tilesPerPage;
            endIndex -= state.tilesPerPage;
          }

          const firstPage = getMapItem({
            label: 'goToLastPage()',
            map: newPages,
            key: 1,
          });

          const totalTilesNeededToComplete = state.tilesPerPage - firstPage.length;
          if (totalTilesNeededToComplete) {
            newPages.set(1, [...TILES.slice(-totalTilesNeededToComplete), ...firstPage]);
          }

          // Left page placeholder
          const firstItem = TILES.slice(-totalTilesNeededToComplete)[0];
          let firstItemIndex =
            findIndexFromKey({
              label: 'Left page placeholder goToLastPage()',
              array: TILES,
              key: 'id',
              value: firstItem.id,
            }) - 1;

          const leftArray = [];
          for (let i = 0; i < state.tilesPerPage; i++) {
            leftArray.unshift(TILES[firstItemIndex--]);
            if (firstItemIndex === -1) {
              firstItemIndex = TILES.length - 1;
            }
          }

          newPages.set(0, leftArray);

          validatePagesMap({ label: 'goToLastPage()', tiles: TILES, pages: newPages });
          const end = performance.now();

          console.log(`Execution time: ${end - start} milliseconds`);

          return {
            pages: newPages,
            currentPage: state.maxPage - 2,
            isFirstPageVisited: false,
            isLastPageVisited: true,
            hasPaginated: true,
          };
        }),
      enableAnimation: () => {
        set(() => {
          document.body.style.pointerEvents = 'none';
          return { isAnimating: true };
        });
      },
      disableAnimation: () => {
        set(() => {
          document.body.style.pointerEvents = '';
          return { isAnimating: false };
        });
      },
      handleRightScroll: getTranslatePercentage => {
        log('HANDLE RIGHT SCROLL');
        const state = get();
        state.enableAnimation();

        const newTranslatePercentage = getTranslatePercentage({
          direction: DIRECTION.RIGHT,
          lastPageLength: state.lastPageLength,
          isLastPage: state.currentPage + 1 === state.maxPage - 2 && state.isFirstPageVisited,
        });

        state.setTranslatePercentage(newTranslatePercentage);

        setTimeout(() => {
          state.disableAnimation();
          state.setTranslatePercentage(0);

          if (state.currentPage === state.maxPage - 3) return state.goToLastPage();
          if (state.currentPage === state.maxPage - 2) return state.goToFirstPage();
          state.goToNextPage();
        }, TIMEOUT_DURATION);

        return;
      },
      handleLeftScroll: getTranslatePercentage => {
        log('HANDLE LEFT SCROLL');

        const state = get();

        state.enableAnimation();
        const newTranslatePercentage = getTranslatePercentage({
          direction: DIRECTION.LEFT,
          lastPageLength: state.lastPageLength,
          isFirstPage: state.currentPage - 1 === 1 && state.isLastPageVisited,
        });

        state.setTranslatePercentage(newTranslatePercentage);

        setTimeout(() => {
          state.disableAnimation();
          state.setTranslatePercentage(0);

          if (state.currentPage === 2) return state.goToFirstPage();
          if (state.currentPage === 1) return state.goToLastPage();
          state.goToPrevPage();
        }, TIMEOUT_DURATION);

        return;
      },
    }))
  );

export const goToLastPage = () => {};
