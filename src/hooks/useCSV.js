import { useState, useEffect, useRef } from 'react';

const cache = new Map();

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim();
      const raw = (values[j] || '').trim();
      const num = Number(raw);
      row[key] = raw !== '' && !isNaN(num) ? num : raw;
    }
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        values.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  values.push(current);
  return values;
}

export function useCSV(filename) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filenameRef = useRef(filename);

  useEffect(() => {
    filenameRef.current = filename;
    const path = filename.startsWith('/') ? filename : `/data/${filename}`;

    if (cache.has(path)) {
      setData(cache.get(path));
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);
        cache.set(path, parsed);
        if (filenameRef.current === filename) {
          setData(parsed);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (filenameRef.current === filename) {
          setError(err.message);
          setLoading(false);
        }
      });
  }, [filename]);

  return { data, loading, error };
}
