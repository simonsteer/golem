import { HypotheticalGridModifications } from './types'
import { Grid, Unit } from '../../entities'
import { RawCoords } from '../Coords'
import { Pathfinder } from '..'

export default class HypotheticalGridModificationsManager {
  private hypotheticals: HypotheticalGridModifications
  private grid: Grid
  private moved = new Map<Pathfinder, RawCoords>()
  private added = new Set<Symbol>()
  private removed = new Map<Unit, RawCoords>()

  constructor(grid: Grid, hypotheticals: HypotheticalGridModifications) {
    this.hypotheticals = hypotheticals
    this.grid = grid
  }

  setup() {
    const { add = [], remove = [], move = [] } = this.hypotheticals
    this.grid.events.disable()
    this.grid.mapTiles(({ tile }) => tile.events.disable())

    remove.forEach(id => {
      const pathfinder = this.grid.getPathfinder(id)
      if (pathfinder) {
        this.removed.set(pathfinder.unit, pathfinder.coordinates.raw)
        this.grid.removeUnits([pathfinder.unit.id])
      }
    })

    this.grid.addUnits(add)
    add.map(([{ id }]) => id).forEach(id => this.added.add(id))

    move.forEach(([id, toCoords]) => {
      const pathfinder = this.grid.getPathfinder(id)
      if (pathfinder) {
        this.moved.set(pathfinder, pathfinder.coordinates.raw)
        pathfinder.move([toCoords])
      }
    })
  }

  teardown() {
    ;[...this.moved.entries()].forEach(([pathfinder, originalCoords]) => {
      pathfinder.move([originalCoords])
    })
    this.grid.removeUnits([...this.added.values()])
    this.grid.addUnits([...this.removed.entries()])
    this.grid.mapTiles(({ tile }) => tile.events.enable())
    this.grid.events.enable()
  }
}