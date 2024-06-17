import { pokemons } from './pokemons';

export function findDitto() {
  return pokemons.filter((pokemon) => pokemon.eyes === 'point');
}
