// src/components/Marquee.tsx
import React from "react";
import "../styles/Marquee.css";

const dummyData = [
  { pair: "BTC/USD", price: "$42,300", change: "+1.2%" },
  { pair: "ETH/USD", price: "$3,200", change: "-0.5%" },
  { pair: "SOL/USD", price: "$145", change: "+2.8%" },
  { pair: "SYN/USD", price: "$1.75", change: "-0.2%" },
];

const Marquee: React.FC = () => {
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {dummyData.map((item, index) => (
          <div key={index} className="marquee-item">
            <span className="pair">{item.pair}: </span>
            <span className="price">{item.price}</span>
            <span className={item.change.startsWith("+") ? "positive-change" : "negative-change"}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
