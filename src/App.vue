<template>
  <div>
    <div class="controls">
      <div class="inputs">
        <fieldset>
          <legend>Size</legend>

          <label>
            Width
            <input
              type="number"
              v-model="parameters.width"
              step="1"
              min="2"
              max="96"
            />
          </label>

          <label>
            Height
            <input
              type="number"
              v-model="parameters.height"
              step="1"
              min="2"
              max="96"
            />
          </label>
        </fieldset>

        <!-- <fieldset>
          <legend>Scale</legend>

          <label>
            X axis
            <input
              type="number"
              :step="stepSwing"
              v-model="parameters.swingX"
            />
          </label>

          <label>
            Y axis
            <input
              type="number"
              :step="stepSwing"
              v-model="parameters.swingY"
            />
          </label>
        </fieldset> -->

        <fieldset>
          <legend>Generator Method</legend>

          <select v-model="parameters.method">
            <option value="hitomezashi">Hitomezashi</option>
            <option value="random">Random Cells</option>
            <option value="prime">Prime numbers</option>
          </select>

          <!-- Hitomezashi -->
          <div v-if="parameters.method === 'hitomezashi'">
            <label>Probability of beginning with a line</label>

            <label>
              Columns
              <input
                type="number"
                :step="stepOffset"
                :min="0"
                :max="1"
                v-model="parameters.offsetX"
              />
            </label>

            <label>
              Rows
              <input
                type="number"
                :step="stepOffset"
                :min="0"
                :max="1"
                v-model="parameters.offsetY"
              />
            </label>
          </div>

          <!-- Hitomezashi -->
          <div v-if="parameters.method === 'random'">
            <label>Probability of a cell being filled</label>

            <label>
              P
              <input
                type="number"
                :step="stepOffset"
                :min="0"
                :max="1"
                v-model="parameters.offsetX"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Generate</legend>
          <button @click="reset()">🔄</button>
        </fieldset>
      </div>
    </div>
    <!-- <div style="width: 50%"> make the whole thing scalable but centered top-->
    <div class="fabric">
      <svg :viewBox="`0 0 ${parameters.width} ${parameters.height}`">
        <g>
          <rect
            class="tile"
            :class="{ 'tile--filled': tile.filled }"
            v-for="(tile, index) in tiles"
            :key="index"
            :x="tile.x"
            :y="tile.y"
            width="1"
            height="1"
          />
        </g>
      </svg>
    </div>
    <!-- </div> -->
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { debounce, throttle } from 'lodash-es'

// Generate line/tile data...
function generate(parameters) {
  // Generate an array of some amount of random numbers.
  const random = (amount, offset) => {
    return Array.from({ length: amount }, () =>
      Math.floor(Math.random() + offset)
    )
  }

  //
  const { width, offsetX } = parameters
  const linesX = random(width, offsetX)

  const { height, offsetY } = parameters
  const linesY = random(height, offsetY)

  //
  const tiles = generateTiles(parameters, linesX, linesY)

  return { linesX, linesY, tiles }
}

// Generate a square set of tiles.
function generateTiles(parameters, linesX, linesY) {
  const { width, height } = parameters
  const total = width * height

  let tiles = []

  let i = 0
  while (i++ < total) {
    tiles.push(generateTile(parameters, linesX, linesY, i))
  }

  return tiles
}

// Generate a single tile from width and offset.
function generateTile(parameters, linesX, linesY, start) {
  // Get (x, y) locations from start point and grid width...
  const x = (() => {
    return (start - 1) % parameters.width
  })()

  const y = (() => {
    return Math.floor((start - 1) / parameters.width)
  })()

  let filled = 0

  switch (parameters.method) {
    case 'hitomezashi':
      filled = hitomezashi(x, y, linesX, linesY)
      break
    case 'random':
      filled = random(parameters)
      break
    case 'prime':
      filled = prime(start)
      break
    default:
    // code block
  }

  // Decide if the cell should be filled...
  //const filled = hitomezashi(x, y, linesX, linesY)

  // Return cell data...
  return { x, y, filled }
}

function prime(n) {
  if (n === 1) {
    return 0
  } else if (n === 2) {
    return 1
  } else {
    for (var x = 2; x < n; x++) {
      if (n % x === 0) {
        return 0
      }
    }
    return 1
  }
}

function random(parameters) {
  return Math.floor(Math.random() + parameters.offsetX)
}

function hitomezashi(x, y, linesX, linesY) {
  const sumReducer = function (previousValue, currentValue) {
    return previousValue + currentValue
  }

  // Some rules...
  const total = y * x
  const countX = linesX.slice(0, x).reduce(sumReducer, 0)
  const countY = linesY.slice(0, y).reduce(sumReducer, 0)

  // console.log({ total, countX, countY })

  return (countX + countY + total) % 2
}

export default {
  props: {
    width: { default: 64 },
    height: { default: 48 },
    // swingX: { default: 0.8 },
    // swingY: { default: 1.2 },
    offsetX: { default: 0.6 },
    offsetY: { default: 0.6 },
    method: { default: 'random' },
  },

  setup(props) {
    const overrides = {
      // width: 8,
      // height: 8,
    }

    const parameters = ref({ ...props, ...overrides })

    // const ax = [0, 1, 0, 0, 0, 0, 1, 0];
    // const ay = [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0];
    const linesX = ref([])
    const linesY = ref([])
    const tiles = ref([])

    // Update data...
    const reset = function () {
      const generated = generate(parameters.value)
      // console.log(generated.tiles)

      linesX.value = generated.linesX
      linesY.value = generated.linesY
      tiles.value = generated.tiles
    }

    // Draw on mount, redraw when parameters change...
    watch(
      parameters,
      debounce(() => reset(), 200),
      {
        deep: true,
        immediate: true,
      }
    )

    return {
      // Data.
      parameters,
      linesX,
      linesY,
      tiles,
      stepOffset: 0.1,
      // stepSwing: 0.2,

      // Functions.
      reset,
    }
  },
}
</script>


<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  padding: 0.5rem;
  padding-bottom: 1rem;
  gap: 1rem;

  /* background: white; */
  border-bottom: solid;
}

.inputs {
  display: grid;
  gap: inherit;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}

.controls fieldset {
  display: flex;
  flex-direction: column;
  justify-content: space;
  flex-wrap: wrap;
  gap: 1rem;
}

.controls button,
.controls label {
  flex-grow: 1;
  min-height: 2rem;
}

.controls button {
  font-size: 2rem;
}

.controls label {
  display: flex;
  /* text-align: right; */
  flex-grow: 1;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: inherit;
}

.controls label > input {
  margin-left: auto;
  align-self: stretch;
  flex-grow: 1;

  min-width: 4rem;
  max-width: calc(100% - 6rem);
  width: 100%;
}

/*
 *
 */
.fabric {
  display: flex;
  padding: 1rem;

  /* background: aliceblue; */
}

.fabric svg {
  flex: 1;
  width: 100%;
  height: 100%;

  /* background: white; */
}

.tile {
  fill: transparent;
  /* transform: scale(0.8); */
  transform-origin: center;
  transform-box: fill-box;
}

.tile--filled {
  /* transform: scale(1.0); */
  fill: coral;
}
</style>
