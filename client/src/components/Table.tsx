import S from "../style/table.module.scss";

interface Tableprops<T extends object> {
  head: { id: string; name: string }[];
  body: T[];
}

const Table = <T extends object>(props: Tableprops<T>) => {
  const { head, body } = props;
  return (
    <>
      <table>
        <thead>
          <tr>
            {head.map((o) => (
              <th key={o.id}>{o.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((o, i) => (
            <tr key={"__row__" + i}>
              {Object.values(o).map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {body.length === 0 && (
        <div className={S.fallback}>
          <img
            src="https://res.cloudinary.com/do63p55lo/image/upload/v1762679316/budget_tracker/no-data_c2wtuz.svg"
            alt="no-data"
          />
          <h3>No Data Found</h3>
        </div>
      )}
    </>
  );
};

export default Table;
