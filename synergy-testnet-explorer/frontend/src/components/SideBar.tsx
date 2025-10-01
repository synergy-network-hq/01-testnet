import React, {useState} from "react";
import "../styles/SideBar.css";
import {Link} from "react-router-dom";

const SideBar: React.FC = () => {
    const [synPrice] = useState("$ 3.2500");
    const [gasFees] = useState("0.002 SYN");

    return (
        <nav className="sidebar">
            <div className="navbar-info">
                <div className="info-box">
                    SYN Price: <br /> {synPrice}
                </div>
                <div className="info-box">
                    Gas Fees: <br /> {gasFees}
                </div>
            </div>
            <hr></hr>
            <div className="navbar-links">
                            <Link to="/">Home</Link>
                            <Link to="/blocks">Blocks</Link>
                            <Link to="/transactions">Transactions</Link>
                            <Link to="/about">About</Link>
                        </div>
        </nav>
    );
};

export default SideBar;
