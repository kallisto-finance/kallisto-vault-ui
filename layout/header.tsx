import React, { useState, useEffect } from "react";
import Link from "next/link";

import ConnectWalletButton from "components/ConnectWalletButton";

import cn from "classnames";

const LayoutHeader = ({ router }) => {
  const [curLink, setCurLink] = useState("");

  useEffect(() => {
    setCurLink(router.route);
  }, [router.route]);

  return (
    <div className="layout-container__header">
      <div className="layout-container__header__logo">
        <Link href="/">
          <img className="" src="/assets/logo-2.png" alt="Kallisto" />
        </Link>
      </div>
      <div className="layout-container__header__buttons">
        <Link href="/event">
          <div
            className={cn("header-button", {
              active: curLink.startsWith("/event"),
            })}
          >
            <span>Events</span>
          </div>
        </Link>
        <Link href="/blog">
          <div
            className={cn("header-button", {
              active: curLink.startsWith("/blog"),
            })}
          >
            <span>Blog</span>
          </div>
        </Link>
        <a
          href="https://t.me/kallistofinance"
          className="header-button"
          target="_blank"
        >
          <span>Join our Community</span>
          <img src="/assets/social/telegram.png" alt="Telegram" />
        </a>
        <a
          href="https://kallisto-finance.github.io/kallisto-docs/guide/abstract.html"
          className="header-button"
          target="_blank"
        >
          <span>Docs</span>
          <img src="/assets/icons/open.svg" alt="Docs" />
        </a>
        <ConnectWalletButton />
      </div>
    </div>
  );
};

export default LayoutHeader;
