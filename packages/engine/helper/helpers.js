export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}


export function randomFloat(rng, min, max) {
  return rng() * (max - min) + min;
}


export function pick(rng, array) {
  return array[Math.floor(rng() * array.length)];
}


export function shuffle(rng, array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function sample(rng, array, count) {
  return shuffle(rng, array).slice(0, Math.min(count, array.length))
}

export function weightedPick(rng, items) {
  const totalWeight = items.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  let random = rng() * totalWeight;

  for (const item of items) {
    random -= item.weight;

    if (random <= 0) {
      return item.value;
    }
  }

  return items[items.length - 1].value;
}
