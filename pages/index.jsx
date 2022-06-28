import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

import Liquidity from "containers/liquidity";
import { getAPY } from 'utils/redis';

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY)

const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

const canvasStyles = {
  position: "fixed",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
};

const getAnimationSettings = (originXA, originXB) => {
  return {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    particleCount: 150,
    origin: {
      x: randomInRange(originXA, originXB),
      y: Math.random() - 0.2,
    },
  };
};

export default function Home({ state, router, apy }) {

  const refAnimationInstance = useRef(null);
  const [intervalId, setIntervalId] = useState();

  const getInstance = useCallback((instance) => {
    refAnimationInstance.current = instance;
  }, []);

  const nextTickAnimation = useCallback(() => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current(getAnimationSettings(0.1, 0.3));
      refAnimationInstance.current(getAnimationSettings(0.7, 0.9));
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!intervalId) {
      setIntervalId(setInterval(nextTickAnimation, 400));
    }
  }, [intervalId, nextTickAnimation]);

  // const pauseAnimation = useCallback(() => {
  //   clearInterval(intervalId);
  //   setIntervalId(null);
  // }, [intervalId]);

  const stopAnimation = useCallback(() => {
    clearInterval(intervalId);
    setIntervalId(null);
    refAnimationInstance.current && refAnimationInstance.current.reset();
  }, [intervalId]);

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  mixpanel.track("VISIT");

  return (
    <div className="page-container">
      <Liquidity router={router} curveAPY={apy} onConfettiStart={startAnimation} onConfettiStop={stopAnimation} />
      <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
    </div>
  );
}

export async function getServerSideProps() {
  const apy = await getAPY();

  return { props: { apy } }
}
