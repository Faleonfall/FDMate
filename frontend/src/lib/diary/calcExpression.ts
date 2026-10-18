/**
 * Safe arithmetic evaluator for calorie inputs. Supports + - * / , parentheses,
 * decimals, and unary +/-. Returns null on any malformed input. No use of eval().
 */

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lp" }
  | { type: "rp" };

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index] ?? "";

    if (char === " " || char === "\t") {
      index += 1;
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ type: "op", value: char });
      index += 1;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lp" });
      index += 1;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "rp" });
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const match = input.slice(index).match(/^\d*\.?\d+/);
      if (!match) {
        return null;
      }
      tokens.push({ type: "num", value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    return null;
  }

  return tokens;
}

// Recursive-descent parser; the cursor object is shared by reference.
type Cursor = { tokens: Token[]; pos: number };

function peek(cursor: Cursor): Token | undefined {
  return cursor.tokens[cursor.pos];
}

function parseExpression(cursor: Cursor): number | null {
  let left = parseTerm(cursor);
  if (left === null) {
    return null;
  }

  let next = peek(cursor);
  while (next?.type === "op" && (next.value === "+" || next.value === "-")) {
    cursor.pos += 1;
    const right = parseTerm(cursor);
    if (right === null) {
      return null;
    }
    left = next.value === "+" ? left + right : left - right;
    next = peek(cursor);
  }
  return left;
}

function parseTerm(cursor: Cursor): number | null {
  let left = parseFactor(cursor);
  if (left === null) {
    return null;
  }

  let next = peek(cursor);
  while (next?.type === "op" && (next.value === "*" || next.value === "/")) {
    cursor.pos += 1;
    const right = parseFactor(cursor);
    if (right === null) {
      return null;
    }
    left = next.value === "*" ? left * right : left / right;
    next = peek(cursor);
  }
  return left;
}

function parseFactor(cursor: Cursor): number | null {
  const token = peek(cursor);
  if (!token) {
    return null;
  }

  if (token.type === "op" && (token.value === "+" || token.value === "-")) {
    cursor.pos += 1;
    const operand = parseFactor(cursor);
    if (operand === null) {
      return null;
    }
    return token.value === "-" ? -operand : operand;
  }

  if (token.type === "num") {
    cursor.pos += 1;
    return token.value;
  }

  if (token.type === "lp") {
    cursor.pos += 1;
    const inner = parseExpression(cursor);
    if (inner === null || peek(cursor)?.type !== "rp") {
      return null;
    }
    cursor.pos += 1;
    return inner;
  }

  return null;
}

/** Evaluate an arithmetic string, or null if invalid / non-finite. */
export function evalExpression(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const tokens = tokenize(trimmed);
  if (!tokens || tokens.length === 0) {
    return null;
  }

  const cursor: Cursor = { tokens, pos: 0 };
  const result = parseExpression(cursor);
  if (result === null || cursor.pos !== tokens.length) {
    return null;
  }

  return Number.isFinite(result) ? result : null;
}
