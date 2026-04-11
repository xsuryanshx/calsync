type TimedEventLike = {
  start: string;
  end: string;
};

export type DayLayoutItem<T extends TimedEventLike> = {
  event: T;
  column: number;
  columnCount: number;
  span: number;
};

type WorkingItem<T extends TimedEventLike> = DayLayoutItem<T> & {
  endMin: number;
  order: number;
  startMin: number;
};

export function layoutDayEvents<T extends TimedEventLike>(
  events: T[],
): DayLayoutItem<T>[] {
  const items: WorkingItem<T>[] = events
    .map((event, order) => ({
      event,
      column: 0,
      columnCount: 1,
      span: 1,
      order,
      startMin: new Date(event.start).getTime() / 60000,
      endMin: new Date(event.end).getTime() / 60000,
    }))
    .sort(
      (a, b) =>
        a.startMin - b.startMin || b.endMin - a.endMin || a.order - b.order,
    );

  let active: WorkingItem<T>[] = [];
  let group: WorkingItem<T>[] = [];
  let groupEndMin = -Infinity;
  let groupColumns = 1;

  const overlaps = (a: WorkingItem<T>, b: WorkingItem<T>) =>
    a.startMin < b.endMin && b.startMin < a.endMin;

  const finalizeGroup = () => {
    if (group.length === 0) return;
    for (const item of group) {
      let span = 1;
      for (let column = item.column + 1; column < groupColumns; column += 1) {
        const blocked = group.some(
          (candidate) => candidate.column === column && overlaps(item, candidate),
        );
        if (blocked) break;
        span += 1;
      }
      item.span = span;
      item.columnCount = groupColumns;
    }
    active = [];
    group = [];
    groupEndMin = -Infinity;
    groupColumns = 1;
  };

  for (const item of items) {
    if (group.length > 0 && item.startMin >= groupEndMin) {
      finalizeGroup();
    }

    active = active.filter((candidate) => candidate.endMin > item.startMin);

    const usedColumns = new Set(active.map((candidate) => candidate.column));
    let column = 0;
    while (usedColumns.has(column)) {
      column += 1;
    }

    item.column = column;
    group.push(item);
    active.push(item);
    groupEndMin = Math.max(groupEndMin, item.endMin);
    groupColumns = Math.max(groupColumns, active.length, column + 1);
  }

  finalizeGroup();

  return items
    .sort((a, b) => a.order - b.order)
    .map(({ event, column, columnCount, span }) => ({
      event,
      column,
      columnCount,
      span,
    }));
}
