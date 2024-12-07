import DB from './';

export interface Card {
  id: number;
  title?: string;
  description?: string;
  request: string;
  rank: number;
  colSpan: 1 | 2 | 3;
  type: 'table' | 'graph';
  data?: unknown[];
  chartType?: 'line' | 'bar' | 'pie';
}

export interface Dashboard {
  id: number;
  title: string;
  description?: string;
  cards: Card[];
}

async function getCardData(card: Card): Promise<unknown[]> {
  const sql = card.request;
  const [data] = await DB.query(sql);
  return data as unknown[];
}

export async function getDashboard(id: number, userId: number): Promise<Dashboard> {
  const dashboardSql = `
  SELECT
    *
  FROM dashboard
  WHERE dashboard.id = ?
  AND userId = ?
  `;
  const [dashboards] = await DB.query(dashboardSql, [id, userId]);
  if (dashboards.length === 0) {
    throw new Error('Dashboard not found');
  }
  const dashboard = dashboards[0];

  const cardsSQL = `
  SELECT
    *
  FROM card
  WHERE card.dashboardId = ?
  `;
  const [cards] = await DB.query(cardsSQL, [id]);
  await Promise.all(
    (cards as Card[]).map(async (card) => {
      if (card.request) {
        card.data = await getCardData(card);
      }
      return card;
    })
  );
  dashboard.cards = (cards as Card[]).sort((a, b) => a.rank - b.rank);

  return dashboard;
}

export async function updateDashboard(data: Dashboard, userId: number): Promise<Dashboard> {
  const dashboardSql = `
  UPDATE dashboard
  SET title = ?, description = ?
  WHERE dashboard.id = ?
  AND userId = ?
  `;
  await DB.query(dashboardSql, [data.title, data.description ?? null, data.id, userId]);

  const cards = data.cards;
  await Promise.all(
    cards.map(async (card) => {
      const cardSql = `
      INSERT INTO card (id, title, description, type, request, colSpan, \`rank\`, dashboardId)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      title = ?, description = ?, type = ?, request = ?, colSpan = ?, \`rank\` = ?
      `;
      await DB.query(cardSql, [
        card.id,
        card.title,
        card.description,
        card.type,
        card.request,
        card.colSpan,
        card.rank,
        data.id,
        card.title,
        card.description,
        card.type,
        card.request,
        card.colSpan,
        card.rank
      ]);
    })
  );

  // Handle deletions
  const cardIds = cards.map((card) => card.id);
  const deleteCardsSql = `
  DELETE FROM card
  WHERE card.dashboardId = ?
  AND card.id NOT IN (?)
  `;
  await DB.query(deleteCardsSql, [data.id, cardIds]);

  return await getDashboard(data.id, userId);
}

export async function getDashboards(userId: number) {
  const dashboardSql = `
  SELECT
    *
  FROM dashboard
  WHERE userId = ?
  `;
  const [dashboards] = await DB.query(dashboardSql, [userId]);
  return dashboards as Dashboard[];
}
