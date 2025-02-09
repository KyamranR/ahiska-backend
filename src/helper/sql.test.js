const { sqlForPartialUpdate } = require("../helper/sql");

describe("sqlForPartialUpdate", () => {
  it("generates a SQL partial update query with correct column mappings", () => {
    const dataToUpdate = { firstName: "Mark", lastName: "Aurelius" };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name" = $1, "last_name" = $2',
      values: ["Mark", "Aurelius"],
    });
  });

  it("throws an error if no data is provided", () => {
    expect(() => sqlForPartialUpdate({}, {})).toThrow("No data.");
  });

  it("returns unmapped columns if no jsToSql mapping is provided", () => {
    const dataToUpdate = { age: 30, bio: "Hacker" };

    const result = sqlForPartialUpdate(dataToUpdate, {});

    expect(result).toEqual({
      setCols: '"age" = $1, "bio" = $2',
      values: [30, "Hacker"],
    });
  });

  it("handles a mix of mapped and unmapped keys", () => {
    const dataToUpdate = { firstName: "Mark", bio: "Hacker" };
    const jsToSql = { firstName: "first_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name" = $1, "bio" = $2',
      values: ["Mark", "Hacker"],
    });
  });
});
