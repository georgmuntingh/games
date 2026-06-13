// Registry of available cell types. main.js uses this to build/switch cells.
import eryParams from '../data/erythrocyte.params.json';
import cardioParams from '../data/cardiomyocyte.params.json';
import neuronParams from '../data/neuron.params.json';
import { buildModel as buildErythrocyte } from './erythrocyte.js';
import { buildModel as buildCardiomyocyte } from './cardiomyocyte.js';
import { buildModel as buildNeuron } from './neuron.js';
import { erythrocyteLessons } from '../lessons/erythrocyte.js';
import { cardiomyocyteLessons } from '../lessons/cardiomyocyte.js';
import { neuronLessons } from '../lessons/neuron.js';
import { erythrocyteView, cardiomyocyteView, neuronView } from './views.js';

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
  neuron: {
    id: 'neuron',
    label: 'Neuron (myelinated, Hodgkin–Huxley)',
    params: neuronParams,
    build: buildNeuron,
    lessons: neuronLessons,
    view: neuronView,
  },
};

export const CELL_ORDER = ['erythrocyte', 'cardiomyocyte', 'neuron'];
