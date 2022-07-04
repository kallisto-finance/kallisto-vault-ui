import React, { useState, useEffect, useMemo } from "react";

import { render, NODE_IMAGE } from "storyblok-rich-text-react-renderer";

import {
  convertDateStringWithWeekDay,
  convertTimeString,
  GetRemainDays,
  convertUTCtoLocalTime,
  parseDate
} from "utils/date";



import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY)

const UpcomingEvent = ({ data }) => {
  const [remainTime, setRemainTime] = useState(" ");
  let regClicked = false;
  let eventClicked = false;

  useEffect(() => {
    window.$ = window.jQuery = require('jquery');
    $("#event-register").click(function() {
      if(!regClicked) {
        regClicked = true;
        mixpanel.track('REGISTER_EVENT', registerLink);
        window.location = registerLink.url;
      }
    });


    $("#event-add-calendar").click(function() {
      if(!eventClicked) {
        eventClicked = true;
        mixpanel.track('ADD_EVENT_CALENDAR', {
          title: data.content.Title
        });

        window.location = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${data.content.EventTime}&location=${data.content.Location}&text=${data.content.Title}`;
      }
    });
  })

  useEffect(() => {
    if (data.content.EventTime) {
      let interval = null;

      interval = setInterval(() => {
        const {
          day: d,
          hour: h,
          minute: m,
        } = GetRemainDays(
          new Date().getTime(),
          convertUTCtoLocalTime(parseDate(data.content.EventTime).getTime())
        );
        let str = "";

        if (d > 0) {
          str = `${d}D `;
        }

        str = `${str}${h} HR ${m} M`;

        setRemainTime(str);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [data.content.EventTime]);

  const registerLink = useMemo(() => {
    if (!("RegistrationLink" in data.content)) {
      return null;
    }
    const registrationLink = data.content.RegistrationLink;

    if (registrationLink !== null) {
      return {
        url: registrationLink.url,
        title: data.content.Title,
        slug: data.slug,
      };
    }

    return null;
  }, [data]);

  const openRegistration = () => {
    console.log('click');

    mixpanel.track('REGISTER_EVENT', registerLink);
    window.location = registerLink.url;
  }

  const openCal = () => {
    console.log('click');

    mixpanel.track('ADD_EVENT_CALENDAR', {
      title: data.content.Title
    });

    window.location = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${data.content.EventTime}&location=${data.content.Location}&text=${data.content.Title}`;
  }

  return (
    <div className="event-item-container">
      <div className="event-title">{data.content.Title}</div>
      <div className="event-section">
        <div className="event-basics">
          <div className="event-row">
            <div className="event-row-title">Event Date:</div>
            <div className="event-row-value">
              {convertDateStringWithWeekDay(data.content.EventTime, true)}
            </div>
          </div>
          <div className="event-row">
            <div className="event-row-title">Event Time:</div>
            <div className="event-row-value">
              {convertTimeString(data.content.EventTime, true)}
            </div>
          </div>
          <div className="event-row">
            <div className="event-row-title">Location:</div>
            <div className="event-row-value">{data.content.Location}</div>
          </div>
          <a
            href={data.content.JoinCommunity.url}
            className="event-join-community"
            target="_blank"
          >
            Join Our Community
          </a>
        </div>
        <div className="event-timer">
          <span>Join us in</span>
          <div className="event-countdown">{remainTime}</div>
          <a
            id = "event-add-calendar"
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${data.content.EventTime}&location=${data.content.Location}&text=${data.content.Title}`}
            className="event-add-calendar"
            target="_blank"
          >
            Add to Calendar
          </a>
        </div>
      </div>
      <div className="event-section">
        <div className="event-image">
          <img src={`https:${data.content.Image}`} />
        </div>
        <div className="event-about">
          <div className="event-about-title">About the event</div>
          {render(data.content.Description, {
            nodeResolvers: {
              [NODE_IMAGE]: (children, props) => (
                <img
                  {...props}
                  style={{ borderRadius: "0px", width: "100%" }}
                />
              ),
            },
            blokResolvers: {
              ["YouTube-blogpost"]: (props) => (
                <div className="embed-responsive embed-responsive-16by9">
                  <iframe
                    className="embed-responsive-item"
                    src={
                      "https://www.youtube.com/embed/" +
                      props.YouTube_id.replace("https://youtu.be/", "")
                    }
                  ></iframe>
                </div>
              ),
            },
          })}
          {registerLink !== null && (
            <a className="event-register" id="event-register" target="_blank">
              Register
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvent;
