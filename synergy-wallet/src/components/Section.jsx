import React from "react";

export default function Section({ id, title, children }) {
  return (
    <div id={id} className="section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
