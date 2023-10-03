import React from "react";

import Run from './../../../assets/icons/run.svg';
import Gym from './../../../assets/icons/gym.svg';

import Home from './../../../assets/icons/home.svg';
import Profile from './../../../assets/icons/profile.svg';
import Events from './../../../assets/icons/events.svg';
import Map from './../../../assets/icons/map.svg';
import Chat from './../../../assets/icons/chat.svg';
import Notifications from './../../../assets/icons/notifications.svg';
import Search from './../../../assets/icons/search.svg';
import Settings from './../../../assets/icons/settings.svg';



const Icons = ({
  name,
  size = 15,
  fill = fill,
  style = style,
  onPress = onPress,
  stroke = stroke,
  color = color,
  strokeWidth = strokeWidth,
}) => {
  const Icon = {
    Run: Run,
    Gym: Gym,

    Home: Home,
    Profile: Profile,
    Events: Events,
    Map: Map,
    Chat: Chat,
    Notifications: Notifications,
    Search: Search,
    Settings: Settings,
  }[name];

  return (
    <Icon
      style={style}
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      color={color}
      strokeWidth={strokeWidth}
      onPress={onPress}
    />
  );
};

export default Icons;
