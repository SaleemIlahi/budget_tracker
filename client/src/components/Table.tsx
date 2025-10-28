import React from "react";
import "../style/table.module.scss";

interface Body {
  [key: string]: string | number;
}

interface Tableprops {
  head: { id: string; name: string }[];
  body: Body[];
}

const Table: React.FC<Tableprops> = (props) => {
  const { head, body } = props;
  return (
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
          <tr key={"__row__" + i + o.length}>
            {Object.values(o).map((c) => (
              <td key={c}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
