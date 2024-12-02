import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

function sanitizeSQLQuery(query: string): string {
  // Trim whitespace and convert to uppercase for consistent matching
  const trimmedQuery = query.trim().toUpperCase();

  // Check if the query starts with 'SELECT'
  if (!trimmedQuery.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }

  // Define a list of potentially harmful SQL keywords
  const dangerousKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'EXEC', 'MERGE'];

  // Replace dangerous keywords with an empty string
  let sanitizedQuery = query.trim();
  dangerousKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitizedQuery = sanitizedQuery.replace(regex, '');
  });

  return sanitizedQuery.endsWith(';') ? sanitizedQuery.slice(0, -1) : sanitizedQuery;
}

function addLimitToQuery(query: string, limit: number, offset: number): string {
  // Helper to detect if a LIMIT exists at the outermost level
  function hasOuterLimit(query: string): boolean {
    let depth = 0; // Tracks parentheses depth
    const tokens = query.split(/\b(LIMIT)\b/i); // Split around "LIMIT" keyword
    for (let i = 0; i < tokens.length; i++) {
      const part = tokens[i];
      // Update depth based on parentheses
      for (const char of part) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }
      // If depth is 0, LIMIT is at the top level
      if (i % 2 === 1 && depth === 0) return true;
    }
    return false;
  }

  if (hasOuterLimit(query)) {
    return query; // If LIMIT exists at the top level, return as is
  }

  // Ensure no trailing semicolon before appending LIMIT
  query = query.trimEnd().endsWith(';') ? query.trimEnd().slice(0, -1) : query;

  return `${query} LIMIT ${limit} OFFSET ${offset}`;
}

export const POST: RequestHandler = async ({ request }) => {
  const { query, lastQueryValue = query, currentPage = 0, all = false } = await request.json();
  const NUMBER_OF_RESULTS_PER_PAGE = 50;
  const pageNumber = lastQueryValue === query ? currentPage : 0;

  try {
    const sanitizedQuery = sanitizeSQLQuery(query);
    if (all) {
      const [rows] = await db.execute(sanitizedQuery);
      return json({
        success: true,
        message: 'Query ran successfully',
        rows
      });
    } else {
      const limitedQuery = addLimitToQuery(
        sanitizedQuery,
        NUMBER_OF_RESULTS_PER_PAGE,
        pageNumber * NUMBER_OF_RESULTS_PER_PAGE
      );
      const [rows] = await db.execute(limitedQuery);
      const [numberOfResults] = await db.execute(
        `SELECT COUNT(*) AS count FROM (${sanitizedQuery}) AS subquery`
      );
      const numberOfPages = Math.ceil(numberOfResults[0].count / NUMBER_OF_RESULTS_PER_PAGE);

      return json({
        success: true,
        message: 'Query ran successfully',
        rows,
        numberOfPages,
        currentPage: pageNumber
      });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({ error: true, message: error.message, numberOfPages: 0, currentPage: 0 });
    } else {
      return json({
        error: true,
        message: 'An unexpected error occurred!',
        numberOfPages: 0,
        currentPage: 0
      });
    }
  }
};
