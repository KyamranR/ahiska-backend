"use strict";

// Helper function for updating partial data in SQL queries
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new Error("No data.");

  // Map JS keys to SQL column names
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}" = $${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
