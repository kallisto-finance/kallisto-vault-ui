import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import cn from "classnames";

const faPropLeftIcon = faArrowLeft as IconProp;

const ViewContainer = ({
  children,
  className = "",
  border = false,
  title = "",
  navLeft = false,
  onLeft = () => {},
  header = true,
}) => (
  <div className={cn("view-container", className)}>
    {header && (
      <div className={cn("view-container-header", { border })}>
        {navLeft && (
          <div className="view-navigator-left" onClick={(e) => onLeft()}>
            <FontAwesomeIcon icon={faPropLeftIcon} />
          </div>
        )}
        <div className="view-container-title">{title}</div>
      </div>
    )}
    <div className={cn("view-container-content", { border })}>{children}</div>
  </div>
);

export default ViewContainer;
