// Registry of available cell types. main.js uses this to build/switch cells.
import eryParams from '../data/erythrocyte.params.json';
import cardioParams from '../data/cardiomyocyte.params.json';
import { buildModel as buildErythrocyte } from './erythrocyte.js';
import { buildModel as buildCardiomyocyte } from './cardiomyocyte.js';
import { erythrocyteLessons } from '../lessons/erythrocyte.js';
import { cardiomyocyteLessons } from '../lessons/cardiomyocyte.js';
import { erythrocyteView, cardiomyocyteView } from './views.js';

export const CELLS = {
  erythrocyte: {
    id: 'erythrocyte',
    label: 'Erythrocyte (red blood cell)',
    params: eryParams,
    build: buildErythrocyte,
    lessons: erythrocyteLessons,
    view: erythrocyteView,
  },
  cardiomyocyte: {
    id: 'cardiomyocyte',
    label: 'Cardiomyocyte (Luo–Rudy I)',
    params: cardioParams,
    build: buildCardiomyocyte,
    lessons: cardiomyocyteLessons,
    view: cardiomyocyteView,
  },
};

export const CELL_ORDER = ['erythrocyte', 'cardiomyocyte'];
