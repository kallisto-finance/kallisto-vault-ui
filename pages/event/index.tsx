import React, { useEffect, useState, useMemo } from "react";
import { fetchEvents } from "utils/storyblok";

import { UpcomingEvent, EventSearchBar, PastEvent } from "components/Event";
import { convertUTCtoLocalTime, parseDate } from "utils/date";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY)

const NoEvents = () => (
  <div className="no-events-container">
    <img src="/assets/kallistos/sad-kalli.png" />
    <p>
      Kalli doesn't have any events planned yet! <br />
      Join our community and stay updated on upcoming events.
    </p>
    <div className="no-events-buttons">
      <a href="https://t.me/kallistofinance" target="_blank">
        Telegram <img src="/assets/social/telegram.png" />
      </a>
      <a href="https://twitter.com/Kallistofinance" target="_blank">
        Twitter <img src="/assets/social/twitter.png" />
      </a>
    </div>
  </div>
);

const Event = () => {
  const [eventType, setEventType] = useState("upcoming");

  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchEvents();
      setEvents(data);
    };

    getData();
  }, []);

  const filteredEvents = useMemo(() => {
    const tempEvents = events.filter((event) => {
      const currentTime = new Date().getTime();
      const eventTime = convertUTCtoLocalTime(
        parseDate(event.content.EventTime).getTime()
      );

      if (eventType === "upcoming") {
        if (eventTime >= currentTime) {
          return true;
        }
      } else if (eventType === "past") {
        if (eventTime < currentTime) {
          return true;
        }
      }

      return false;
    });

    tempEvents.sort((a, b) => {
      const aEventTime = parseDate(a.content.EventTime).getTime();
      const bEventTime = parseDate(b.content.EventTime).getTime();

      if (eventType === "upcoming") {
        return aEventTime > bEventTime ? 1 : -1;
      }

      return aEventTime > bEventTime ? -1 : 1;
    });

    return tempEvents;
  }, [events, eventType]);

  return (
    <div className="page-container">
      <div className="event-page-container">
        <div className="event-searchbar-wrapper">
          <EventSearchBar
            onSelect={(type) => setEventType(type)}
            eventType={eventType}
          />
        </div>
        <div className="event-list-wrapper">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) =>
              eventType === "upcoming" ? (
                <UpcomingEvent data={event} key={event.uuid} />
              ) : (
                <PastEvent data={event} key={event.uuid} />
              )
            )
          ) : (
            <NoEvents />
          )}
        </div>
      </div>
    </div>
  );
};

export default Event;
  mixpanel.track("VISIT_EVENTS");
