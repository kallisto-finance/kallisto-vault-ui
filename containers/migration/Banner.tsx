import React from "react";
import Link from "next/link";

const Banner = () => {
  return (
    <div className="migration-container">
      <div className="migration-wrapper">
        <div className="migration-banner-container">
          <div className="migration-banner-content">
            <span className="title">Please Migrate your Liquidity!</span>
            <span className="description">
              Our contracts have been updated on{" "}
              <strong style={{ color: "#5A4FFD" }}>
                Monday, 18 April 2022
              </strong>
              . Please migrate your liquidity to our new contract. You can do
              this easily here.
            </span>
          </div>
          <Link href="/migration">
            <div className="migration-banner-button">
              <span>Migrate</span>
              <img src="/assets/arrows/arrow-top-right.png" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
